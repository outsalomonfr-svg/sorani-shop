import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function jwtInfo(k: string | undefined) {
  if (!k) return null;
  try {
    const p = JSON.parse(
      Buffer.from(k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    return { ref: p.ref, iat: p.iat, role: p.role };
  } catch {
    return { parseError: true };
  }
}

// Outil de diagnostic temporaire — à supprimer après résolution.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let read = 'not-run';
  let navLabels: string[] | null = null;
  let err: string | null = null;
  try {
    const sb = await createClient();
    const { data, error } = await sb.from('site_settings').select('data').eq('id', 1).single();
    if (error) {
      read = 'error';
      err = error.message;
    } else if (data) {
      read = 'ok';
      const links = (data as { data?: { nav?: { links?: Array<{ label?: string }> } } }).data?.nav?.links || [];
      navLabels = links.map((l) => l.label || '');
    } else {
      read = 'empty';
    }
  } catch (e) {
    read = 'throw';
    err = e instanceof Error ? e.message : 'unknown';
  }

  return NextResponse.json({
    url,
    anonKey: { len: anon.length, info: jwtInfo(anon) },
    serviceKey: { len: svc.length, info: jwtInfo(svc) },
    dbRead: read,
    navLabels,
    error: err,
    expected: { ref: 'fgrtiflnuntqyblvcjkg', anonIat: 1779391724 },
  });
}

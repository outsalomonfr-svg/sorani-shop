import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, serviceRoleKeyStatus } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Row = {
  path: string;
  source: string;
  device: string;
  country: string | null;
  visitor_hash: string;
  created_at: string;
};

/** Compte les occurrences et renvoie un classement decroissant. */
function rank(rows: Row[], key: (r: Row) => string | null, uniqueBy?: (r: Row) => string) {
  const counts = new Map<string, Set<string> | number>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    if (uniqueBy) {
      const set = (counts.get(k) as Set<string>) || new Set<string>();
      set.add(uniqueBy(r));
      counts.set(k, set);
    } else {
      counts.set(k, ((counts.get(k) as number) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, v]) => ({ label, count: v instanceof Set ? v.size : v }))
    .sort((a, b) => b.count - a.count);
}

export async function GET(request: NextRequest) {
  // --- Securite : reserve aux administrateurs -------------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // --- Periode demandee ----------------------------------------------------
  const days = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get('days') || '30', 10) || 30, 1), 90);
  const since = new Date(Date.now() - days * 86400000);
  since.setHours(0, 0, 0, 0);

  // --- Lecture paginee (PostgREST plafonne le nombre de lignes par requete) --
  const keyStatus = serviceRoleKeyStatus();
  if (keyStatus !== 'ok') {
    return NextResponse.json(
      { error: 'config', detail: `Clé service_role ${keyStatus} sur le serveur.` },
      { status: 500 }
    );
  }

  const rows: Row[] = [];
  try {
    const admin = createAdminClient();
    const PAGE = 1000;
    const MAX = 100000;
    for (let from = 0; from < MAX; from += PAGE) {
      const { data, error } = await admin
        .from('page_views')
        .select('path, source, device, country, visitor_hash, created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) {
        console.error('[admin/stats]', error.message);
        // 42P01 = table absente : le seul cas ou la migration est vraiment en cause.
        const missingTable = error.code === '42P01' || /does not exist/i.test(error.message);
        return NextResponse.json(
          { error: missingTable ? 'table' : 'db', detail: error.message },
          { status: 500 }
        );
      }
      rows.push(...((data || []) as Row[]));
      if (!data || data.length < PAGE) break;
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error('[admin/stats] exception', detail);
    return NextResponse.json({ error: 'db', detail }, { status: 500 });
  }

  // --- Totaux sur des fenetres glissantes ----------------------------------
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const windowStats = (fromMs: number) => {
    const sub = rows.filter((r) => new Date(r.created_at).getTime() >= fromMs);
    return { views: sub.length, visitors: new Set(sub.map((r) => r.visitor_hash)).size };
  };

  // --- Serie journaliere (du plus ancien au plus recent) --------------------
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    byDay.set(d.toISOString().slice(0, 10), { views: 0, visitors: new Set() });
  }
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    const slot = byDay.get(key);
    if (slot) {
      slot.views++;
      slot.visitors.add(r.visitor_hash);
    }
  }

  return NextResponse.json({
    days,
    today: windowStats(startOfToday.getTime()),
    last7: windowStats(now - 7 * 86400000),
    period: windowStats(since.getTime()),
    daily: [...byDay.entries()].map(([date, v]) => ({
      date,
      views: v.views,
      visitors: v.visitors.size,
    })),
    // Visiteurs uniques pour les provenances/appareils, pages vues pour les pages.
    sources: rank(rows, (r) => r.source, (r) => r.visitor_hash).slice(0, 10),
    pages: rank(rows, (r) => r.path).slice(0, 12),
    devices: rank(rows, (r) => r.device, (r) => r.visitor_hash),
    countries: rank(rows, (r) => r.country, (r) => r.visitor_hash).slice(0, 8),
  });
}

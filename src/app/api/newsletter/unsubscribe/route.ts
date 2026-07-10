import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubToken } from '@/lib/unsubscribe-token';

function page(message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Désabonnement · SORANI</title></head>
<body style="margin:0;background:#FAF6EF;font-family:Georgia,serif;color:#1A1A1A;">
  <div style="max-width:480px;margin:12vh auto;padding:48px 32px;background:#fff;text-align:center;">
    <p style="font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#3845AD;margin:0 0 24px;">SORANI</p>
    <p style="font-size:16px;line-height:1.7;color:#333;margin:0;">${message}</p>
    <a href="https://www.soranibijoux.com" style="display:inline-block;margin-top:28px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3845AD;text-decoration:none;border-bottom:1px solid #3845AD;padding-bottom:2px;">Retour à la boutique</a>
  </div>
</body></html>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  const token = request.nextUrl.searchParams.get('token') || '';

  if (!email || !verifyUnsubToken(email, token)) {
    return page('Ce lien de désabonnement n’est pas valide.');
  }

  try {
    const supabase = createAdminClient();
    await supabase.from('subscribers').update({ is_active: false }).eq('email', email);
    return page('Tu es bien désabonnée de la newsletter. Tu ne recevras plus nos emails.');
  } catch {
    return page('Une erreur est survenue. Réessaie plus tard.');
  }
}

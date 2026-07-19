import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/public-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const sbCookies = request.cookies
    .getAll()
    .map((c) => c.name)
    .filter((n) => n.startsWith('sb-'));

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Diag session</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:6vh auto;padding:24px;color:#111;">
  <h1 style="color:#3845AD;font-size:22px;">Diagnostic session</h1>
  <p style="color:#666;">Fais une capture de cette page et envoie-la 🙏</p>
  <div style="background:#f7f7f9;border-radius:10px;padding:16px;line-height:2;">
    <div><b>1. Serveur voit l'utilisateur :</b> <span style="font-family:monospace;color:${user ? '#16a34a' : '#dc2626'}">${user?.email || 'AUCUN (null)'}</span> ${error ? '<span style="color:#dc2626">(' + error.message + ')</span>' : ''}</div>
    <div><b>2. Cookies « sb- » reçus par le serveur :</b> <span style="font-family:monospace">${sbCookies.join(', ') || 'AUCUN'}</span></div>
    <div id="cli"><b>3. Cookies « sb- » côté navigateur :</b> <span style="font-family:monospace">(chargement…)</span></div>
  </div>
  <script>
    var names = document.cookie.split(';').map(function(c){return c.trim().split('=')[0];}).filter(function(n){return n.indexOf('sb-')===0;});
    document.getElementById('cli').innerHTML = '<b>3. Cookies « sb- » côté navigateur :</b> <span style="font-family:monospace">' + (names.join(', ') || 'AUCUN') + '</span>';
  </script>
  <p style="margin-top:24px;"><a href="/admin" style="color:#3845AD;">→ Essayer d'aller sur /admin</a></p>
</body></html>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

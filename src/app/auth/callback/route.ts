import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/public-config';

function diagPage(title: string, details: Record<string, unknown>): NextResponse {
  const rows = Object.entries(details)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#666;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 12px;font-family:monospace;word-break:break-all;">${String(v)}</td></tr>`
    )
    .join('');
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Diag connexion</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:8vh auto;padding:24px;color:#111;">
  <h1 style="color:#3845AD;font-size:22px;">${title}</h1>
  <p style="color:#666;">Fais une capture et envoie-la — c'est temporaire.</p>
  <table style="border-collapse:collapse;background:#f7f7f9;border-radius:10px;width:100%;">${rows}</table>
  <p style="margin-top:24px;"><a href="/login" style="color:#3845AD;">← Retour à la connexion</a></p>
</body></html>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (!code) {
    return diagPage('Retour Google — aucun "code" reçu', {
      origin,
      params_recus: JSON.stringify(Object.fromEntries(searchParams.entries())),
    });
  }

  // IMPORTANT : on crée la réponse de redirection AVANT, et on écrit les cookies
  // de session DESSUS (sinon la session n'est pas conservée par le navigateur → boucle).
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return diagPage('Retour Google — échec de l’échange de session', {
      origin,
      code_recu: 'oui (' + code.slice(0, 8) + '…)',
      erreur_message: error.message,
      erreur_status: (error as { status?: number }).status ?? '?',
    });
  }

  return response;
}

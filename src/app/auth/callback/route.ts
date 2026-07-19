import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
  <p style="color:#666;">Fais une capture de cette page et envoie-la — c'est temporaire, on retirera ensuite.</p>
  <table style="border-collapse:collapse;background:#f7f7f9;border-radius:10px;width:100%;">${rows}</table>
  <p style="margin-top:24px;"><a href="/login" style="color:#3845AD;">← Retour à la connexion</a></p>
</body></html>`;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  // Paramètres renvoyés par Google/Supabase (utile si l'OAuth a échoué en amont)
  const allParams = Object.fromEntries(searchParams.entries());

  if (!code) {
    return diagPage('Retour Google — aucun "code" reçu', {
      origin,
      params_recus: JSON.stringify(allParams),
      indice: 'Si error/error_description apparaissent ci-dessus, le blocage est côté Google/Supabase (pas le code).',
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return diagPage('Retour Google — échec de l’échange de session', {
    origin,
    code_recu: 'oui (' + code.slice(0, 8) + '…)',
    erreur_message: error.message,
    erreur_status: (error as { status?: number }).status ?? '?',
    erreur_code: (error as { code?: string }).code ?? '?',
    autres_params: JSON.stringify(allParams),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/public-config';

/** Page d'erreur sobre, visible par un visiteur (le détail technique reste dans les logs). */
function errorPage(detail: string): NextResponse {
  console.error('[auth/callback]', detail);
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Connexion impossible — SORANI</title></head>
<body style="font-family:system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:24px;color:#111;text-align:center;">
  <h1 style="color:#3845AD;font-size:22px;">Connexion impossible</h1>
  <p style="color:#666;line-height:1.6;">La connexion n'a pas pu aboutir. Merci de réessayer&nbsp;; si le problème persiste, ferme puis rouvre ton navigateur.</p>
  <p style="margin-top:28px;"><a href="/login" style="color:#3845AD;font-weight:500;">← Retour à la connexion</a></p>
</body></html>`;
  return new NextResponse(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (!code) {
    return errorPage(
      `aucun "code" reçu — origin=${origin} params=${JSON.stringify(Object.fromEntries(searchParams.entries()))}`
    );
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
    return errorPage(
      `échec exchangeCodeForSession — status=${(error as { status?: number }).status ?? '?'} message=${error.message}`
    );
  }

  // Session échangée : les cookies ont été écrits sur `response` (la redirection
  // vers /admin). Le proxy prend ensuite le relais pour maintenir la session.
  return response;
}

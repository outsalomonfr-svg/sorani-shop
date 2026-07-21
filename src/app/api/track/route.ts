import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/** Robots et outils de surveillance : on ne les compte pas comme des visiteurs. */
const BOT_RE =
  /bot|crawler|spider|crawling|facebookexternalhit|preview|slurp|bingpreview|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|axios|node-fetch/i;

/** D'ou vient la visite, a partir du referrer et des parametres utm. */
function detectSource(referrerHost: string | null, utmSource: string | null): string {
  const utm = (utmSource || '').toLowerCase();
  if (utm) {
    if (utm.includes('instagram') || utm === 'ig') return 'instagram';
    if (utm.includes('facebook') || utm === 'fb') return 'facebook';
    if (utm.includes('tiktok')) return 'tiktok';
    if (utm.includes('pinterest')) return 'pinterest';
    if (utm.includes('google')) return 'google';
    if (utm.includes('newsletter') || utm.includes('email')) return 'newsletter';
    return utm.slice(0, 40);
  }
  const h = (referrerHost || '').toLowerCase();
  if (!h) return 'direct';
  if (h.includes('instagram')) return 'instagram';
  if (h.includes('facebook') || h.includes('fb.')) return 'facebook';
  if (h.includes('tiktok')) return 'tiktok';
  if (h.includes('pinterest')) return 'pinterest';
  if (h.includes('google')) return 'google';
  if (h.includes('bing')) return 'bing';
  if (h.includes('duckduckgo')) return 'duckduckgo';
  if (h.includes('yahoo')) return 'yahoo';
  return h.replace(/^www\./, '').slice(0, 60);
}

function detectDevice(ua: string): 'mobile' | 'tablette' | 'desktop' {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablette';
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Empreinte anonyme et NON reversible du visiteur, valable une seule journee.
 * On ne stocke jamais l'IP : elle sert uniquement d'ingredient au hachage,
 * avec un sel qui change chaque jour (impossible de relier deux journees).
 */
function dailyVisitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sorani';
  return createHash('sha256').update(`${day}|${secret}|${ip}|${ua}`).digest('hex').slice(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { path?: string; referrer?: string };
    const rawPath = (body.path || '/').slice(0, 300);

    // On ne mesure jamais l'espace admin ni les routes techniques.
    if (rawPath.startsWith('/admin') || rawPath.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: 'admin' });
    }

    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    // Separe le chemin des parametres (on garde utm_source pour la provenance).
    let path = rawPath;
    let utmSource: string | null = null;
    const qIdx = rawPath.indexOf('?');
    if (qIdx !== -1) {
      path = rawPath.slice(0, qIdx) || '/';
      utmSource = new URLSearchParams(rawPath.slice(qIdx + 1)).get('utm_source');
    }

    // Referrer : on ne conserve que le domaine, jamais l'URL complete.
    let referrerHost: string | null = null;
    if (body.referrer) {
      try {
        const h = new URL(body.referrer).hostname;
        // Une navigation interne n'est pas une "provenance".
        if (!h.includes('soranibijoux')) referrerHost = h.slice(0, 100);
      } catch {
        /* referrer invalide : ignore */
      }
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const country = request.headers.get('x-vercel-ip-country') || null;

    const admin = createAdminClient();
    const { error } = await admin.from('page_views').insert({
      path,
      source: detectSource(referrerHost, utmSource),
      referrer_host: referrerHost,
      device: detectDevice(ua),
      country,
      visitor_hash: dailyVisitorHash(ip, ua),
    });

    if (error) {
      console.error('[track] insert', error.message);
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // La mesure d'audience ne doit jamais casser la navigation.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

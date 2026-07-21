'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Mesure d'audience interne : signale chaque page vue.
 * Anonyme et sans cookie (l'anonymisation se fait cote serveur dans /api/track),
 * donc aucun consentement n'est requis et 100 % des visites sont comptees.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const qs = searchParams?.toString();
    const full = qs ? `${pathname}?${qs}` : pathname;

    // Evite les doublons (re-render, navigation vers la meme URL).
    if (lastSent.current === full) return;
    lastSent.current = full;

    const payload = JSON.stringify({ path: full, referrer: document.referrer || '' });

    // keepalive : la mesure part meme si la page est quittee dans la foulee.
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      /* la mesure ne doit jamais gener la navigation */
    });
  }, [pathname, searchParams]);

  return null;
}

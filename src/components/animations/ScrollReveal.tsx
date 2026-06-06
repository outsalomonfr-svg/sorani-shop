'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Observer global qui ajoute `is-revealed` à tous les éléments
 * [data-reveal] et [data-reveal-stagger] quand ils entrent dans le viewport.
 * Se re-déclenche à chaque changement de route.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    // Petit délai pour laisser le DOM se peindre après un changement de route
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => {
        if (!el.classList.contains('is-revealed')) observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

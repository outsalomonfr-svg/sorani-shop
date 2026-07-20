'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ajoute `is-revealed` aux éléments [data-reveal] / [data-reveal-stagger] :
 * - immédiatement pour ceux déjà (au moins partiellement) visibles au chargement,
 * - au scroll pour les autres,
 * - filet de sécurité : révèle tout après un court délai pour que RIEN ne reste caché.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SELECTOR = '[data-reveal], [data-reveal-stagger]';
    const reveal = (el: Element) => el.classList.add('is-revealed');
    // Affichage instantané (sans fondu) pour ce qui est déjà à l'écran au chargement.
    const revealInstant = (el: Element) => {
      el.classList.add('reveal-instant', 'is-revealed');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    );

    const setup = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains('is-revealed')) return;
        const r = el.getBoundingClientRect();
        // Déjà visible (ou tout en haut) → affichage immédiat, sans fondu ni attente du scroll.
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          revealInstant(el);
        } else {
          observer.observe(el);
        }
      });
    };

    // Immédiatement, pour qu'aucune zone déjà visible ne reste blanche.
    setup();
    const t1 = setTimeout(setup, 80);
    // Filet de sécurité : si un élément reste masqué (observer manqué), on l'affiche.
    const t2 = setTimeout(() => document.querySelectorAll(SELECTOR).forEach(reveal), 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

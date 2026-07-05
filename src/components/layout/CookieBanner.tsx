'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'sorani-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (value: 'accepted' | 'refused') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
    // Informe le reste de l'app (ex. trackers) du choix
    window.dispatchEvent(new CustomEvent('sorani-cookie-consent', { detail: value }));
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-5"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          pointerEvents: 'auto',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
        }}
      >
        <p className="text-[13px] leading-relaxed flex-1" style={{ color: '#374151' }}>
          Nous utilisons des cookies pour le bon fonctionnement du site (panier, préférences) et, avec
          ton accord, pour la mesure d’audience et la traduction.{' '}
          <Link href="/confidentialite" className="underline underline-offset-2" style={{ color: 'var(--brand-blue)' }}>
            En savoir plus
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => choose('refused')}
            className="text-[11px] uppercase tracking-[0.14em] px-4 py-2.5 rounded-full transition hover:bg-black/[0.04]"
            style={{ color: '#374151', border: '1px solid rgba(0,0,0,0.15)' }}
          >
            Refuser
          </button>
          <button
            onClick={() => choose('accepted')}
            className="text-[11px] uppercase tracking-[0.14em] px-5 py-2.5 rounded-full text-white transition hover:opacity-90"
            style={{ background: 'var(--brand-blue)' }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

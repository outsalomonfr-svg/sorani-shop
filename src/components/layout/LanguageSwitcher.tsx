'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';

type Lang = { code: string; label: string; name: string };
const LANGS: Lang[] = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
];

// Lit la langue courante depuis le cookie googtrans (/fr/en -> 'en')
function currentLangFromCookie(): string {
  if (typeof document === 'undefined') return 'fr';
  const m = document.cookie.match(/googtrans=\/[a-z]{2}\/([a-z]{2})/);
  return m ? m[1] : 'fr';
}

// Toutes les portées de domaine où le cookie a pu être posé
// (dont le domaine racine .soranibijoux.com utilisé par Google)
function cookieDomains(): string[] {
  const host = window.location.hostname;
  const domains = new Set<string>(['', `; domain=${host}`, `; domain=.${host}`]);
  const parts = host.split('.');
  if (parts.length > 2) {
    domains.add(`; domain=.${parts.slice(-2).join('.')}`);
  }
  return [...domains];
}

// Supprime le cookie googtrans sur TOUTES les portées (corrige le blocage sur une langue)
function clearGoogTrans() {
  for (const d of cookieDomains()) {
    document.cookie = `googtrans=; path=/${d}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function setGoogTransCookie(code: string) {
  // On repart toujours d'une base propre
  clearGoogTrans();
  if (code === 'fr') return; // français = pas de cookie
  const value = `/fr/${code}`;
  const host = window.location.hostname;
  const parts = host.split('.');
  const scopes = [''];
  if (parts.length > 2) scopes.push(`; domain=.${parts.slice(-2).join('.')}`);
  for (const d of scopes) {
    document.cookie = `googtrans=${value}; path=/${d}; max-age=31536000`;
  }
}

export default function LanguageSwitcher({ textColor = '#374151' }: { textColor?: string }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('fr');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLang(currentLangFromCookie());

    // Protection contre le crash React + Google Translate (removeChild/insertBefore)
    if (typeof Node === 'function' && Node.prototype && !(window as unknown as { __gtPatched?: boolean }).__gtPatched) {
      (window as unknown as { __gtPatched?: boolean }).__gtPatched = true;
      const origRemove = Node.prototype.removeChild;
      // @ts-expect-error patch défensif
      Node.prototype.removeChild = function (child: Node) {
        if (child.parentNode !== this) return child;
        // eslint-disable-next-line prefer-rest-params
        return origRemove.apply(this, arguments as unknown as [Node]);
      };
      const origInsert = Node.prototype.insertBefore;
      // @ts-expect-error patch défensif
      Node.prototype.insertBefore = function (newNode: Node, refNode: Node | null) {
        if (refNode && refNode.parentNode !== this) return newNode;
        // eslint-disable-next-line prefer-rest-params
        return origInsert.apply(this, arguments as unknown as [Node, Node | null]);
      };
    }

    // Charge le script Google Traduction une seule fois
    if (!document.getElementById('google-translate-script')) {
      (window as unknown as { googleTranslateElementInit?: () => void }).googleTranslateElementInit = () => {
        const g = (window as unknown as { google?: { translate?: { TranslateElement: new (o: object, el: string) => void } } }).google;
        if (g?.translate) {
          new g.translate.TranslateElement(
            { pageLanguage: 'fr', includedLanguages: 'en,es,fr', autoDisplay: false },
            'google_translate_element'
          );
        }
      };
      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const choose = (code: string) => {
    if (code === lang) {
      setOpen(false);
      return;
    }
    setGoogTransCookie(code);
    window.location.reload();
  };

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 p-1 transition-colors"
        style={{ color: textColor }}
        aria-label="Choisir la langue"
      >
        <Globe size={16} strokeWidth={1.5} />
        <span className="text-[11px] font-medium tracking-wide">
          {LANGS.find((l) => l.code === lang)?.label || 'FR'}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 p-1 rounded-xl z-50"
          style={{
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-black/[0.04]"
              style={{ color: '#374151' }}
            >
              <span>{l.name}</span>
              {l.code === lang && <Check size={14} style={{ color: 'var(--brand-blue)' }} />}
            </button>
          ))}
        </div>
      )}

      {/* Élément technique requis par Google Traduction (masqué) */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
}

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteSettings } from '@/types/site-settings';

const SettingsContext = createContext<SiteSettings | null>(null);

export function useSiteSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used inside SettingsProvider');
  return ctx;
}

const PREVIEW_CSS = `
[data-sorani-edit] {
  position: relative;
  cursor: pointer !important;
  transition: outline 0.12s ease, background-color 0.12s ease;
  outline: 2px solid transparent;
  outline-offset: 2px;
}
[data-sorani-edit]:hover {
  outline-color: #2563EB;
  background-color: rgba(37, 99, 235, 0.04);
  border-radius: 6px;
}
[data-sorani-edit]::after {
  content: attr(data-sorani-label);
  position: absolute;
  top: -26px;
  left: -2px;
  background: #2563EB;
  color: white;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 8px;
  border-radius: 5px 5px 5px 0;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.15s ease;
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
  line-height: 1.2;
}
[data-sorani-edit]:hover::after {
  opacity: 1;
}
/* Si l'élément est trop près du haut, on bascule le label en bas */
[data-sorani-edit][data-sorani-label-below="true"]::after {
  top: auto;
  bottom: -26px;
  border-radius: 0 5px 5px 5px;
}
[data-sorani-preview-mode] a {
  cursor: pointer !important;
}
/* Désactive les interactions sur les inputs/forms en mode preview pour éviter
   les suggestions d'autofill et les soumissions de formulaire */
[data-sorani-preview-mode] input,
[data-sorani-preview-mode] textarea,
[data-sorani-preview-mode] select,
[data-sorani-preview-mode] button[type="submit"] {
  pointer-events: none !important;
}
`;

export function SettingsProvider({
  initial,
  children,
}: {
  initial: SiteSettings;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initial);
  const [isInPreviewMode, setIsInPreviewMode] = useState(false);

  // Live preview: listen for postMessage from the customize editor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isInIframe = window.self !== window.top;
    if (!isInIframe) return;
    setIsInPreviewMode(true);

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'sorani:preview-settings') {
        setSettings(event.data.settings as SiteSettings);
      }
    };

    window.addEventListener('message', handler);
    // Signal to parent that preview is ready
    window.parent.postMessage({ type: 'sorani:preview-ready' }, '*');

    return () => window.removeEventListener('message', handler);
  }, []);

  // Click-to-edit: intercept clicks on [data-sorani-edit] elements
  useEffect(() => {
    if (!isInPreviewMode) return;

    document.body.setAttribute('data-sorani-preview-mode', 'true');

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editable = target.closest('[data-sorani-edit]') as HTMLElement | null;
      if (!editable) return;

      e.preventDefault();
      e.stopPropagation();

      const section = editable.getAttribute('data-sorani-edit');
      const field = editable.getAttribute('data-sorani-field') || undefined;

      window.parent.postMessage(
        { type: 'sorani:edit-section', section, field },
        '*'
      );
    };

    // Bascule automatiquement le label en bas quand l'élément est près du haut
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editable = target.closest('[data-sorani-edit]') as HTMLElement | null;
      if (!editable) return;
      const rect = editable.getBoundingClientRect();
      // Si moins de 32px au-dessus, on met le label en bas
      if (rect.top < 32) {
        editable.setAttribute('data-sorani-label-below', 'true');
      } else {
        editable.removeAttribute('data-sorani-label-below');
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.body.removeAttribute('data-sorani-preview-mode');
    };
  }, [isInPreviewMode]);

  // Inject CSS variables based on settings (couleurs + polices)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-blue', settings.colors.primary);
    root.style.setProperty('--brand-blue-dark', settings.colors.primaryDark);
    root.style.setProperty('--brand-blue-light', settings.colors.accent);

    // Polices
    const headingFont = settings.typography.headingFont;
    const bodyFont = settings.typography.bodyFont;
    root.style.setProperty('--font-heading', `"${headingFont}", system-ui, sans-serif`);
    root.style.setProperty('--font-body', `"${bodyFont}", system-ui, sans-serif`);

    // Chargement Google Fonts à la demande (+ Playfair Display utilisé en dur dans la navbar)
    const families = new Set<string>([headingFont, bodyFont, 'Playfair Display']);
    families.forEach((family) => {
      const safe = family.replace(/\s+/g, '+');
      const id = `gf-${safe}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${safe}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [settings]);

  return (
    <SettingsContext.Provider value={settings}>
      {isInPreviewMode && <style dangerouslySetInnerHTML={{ __html: PREVIEW_CSS }} />}
      {children}
    </SettingsContext.Provider>
  );
}

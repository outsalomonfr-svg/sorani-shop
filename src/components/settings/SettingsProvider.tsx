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
  transition: box-shadow 0.15s ease, background-color 0.15s ease;
}
[data-sorani-edit]:hover {
  box-shadow: inset 0 0 0 2px #2563EB, 0 0 0 1px rgba(37, 99, 235, 0.2);
  background-color: rgba(37, 99, 235, 0.05);
  border-radius: 6px;
}
[data-sorani-edit]::after {
  content: attr(data-sorani-label);
  position: absolute;
  top: 4px;
  left: 4px;
  background: #2563EB;
  color: white;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 2px 7px;
  border-radius: 4px;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.15s ease;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
[data-sorani-edit]:hover::after {
  opacity: 1;
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

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
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

    // Chargement Google Fonts à la demande
    const families = new Set<string>([headingFont, bodyFont]);
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

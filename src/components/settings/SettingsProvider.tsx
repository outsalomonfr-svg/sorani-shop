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
  transition: outline 0.15s ease, background-color 0.15s ease;
  outline: 2px dashed transparent;
  outline-offset: 4px;
  border-radius: 4px;
}
[data-sorani-edit]:hover {
  outline-color: #2563EB;
  background-color: rgba(37, 99, 235, 0.04);
}
[data-sorani-edit]::after {
  content: attr(data-sorani-label);
  position: absolute;
  top: -28px;
  left: 0;
  background: #2563EB;
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.15s ease;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
[data-sorani-edit]:hover::after {
  opacity: 1;
}
/* Disable navigation on links inside preview */
[data-sorani-preview-mode] a {
  cursor: pointer !important;
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

  // Inject CSS variables based on settings
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-blue', settings.colors.primary);
    root.style.setProperty('--brand-blue-dark', settings.colors.primaryDark);
    root.style.setProperty('--brand-blue-light', settings.colors.accent);
  }, [settings]);

  return (
    <SettingsContext.Provider value={settings}>
      {isInPreviewMode && <style dangerouslySetInnerHTML={{ __html: PREVIEW_CSS }} />}
      {children}
    </SettingsContext.Provider>
  );
}

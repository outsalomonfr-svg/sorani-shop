'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SiteSettings } from '@/types/site-settings';

const SettingsContext = createContext<SiteSettings | null>(null);

export function useSiteSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used inside SettingsProvider');
  return ctx;
}

export function SettingsProvider({
  initial,
  children,
}: {
  initial: SiteSettings;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initial);

  // Live preview: listen for postMessage from the customize editor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isInIframe = window.self !== window.top;
    if (!isInIframe) return;

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

  // Inject CSS variables based on settings
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-blue', settings.colors.primary);
    root.style.setProperty('--brand-blue-dark', settings.colors.primaryDark);
    root.style.setProperty('--brand-blue-light', settings.colors.accent);
  }, [settings]);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

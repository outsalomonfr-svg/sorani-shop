'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { THEME_PRESETS, type ThemePreset } from '@/lib/theme-presets';
import type { SiteSettings } from '@/types/site-settings';

export default function ThemePicker({
  settings,
  onApply,
}: {
  settings: SiteSettings;
  onApply: (s: SiteSettings) => void;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const apply = (preset: ThemePreset) => {
    onApply(preset.apply(settings));
    setConfirmingId(preset.id);
    setTimeout(() => setConfirmingId(null), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] mb-2" style={{ color: 'var(--admin-text-faint)' }}>
        Un clic = applique couleurs + polices + ambiance. Tu peux ensuite ajuster avant de publier.
      </p>
      {THEME_PRESETS.map((t) => (
        <button
          key={t.id}
          onClick={() => apply(t)}
          className="w-full p-3 rounded-lg text-left transition group relative"
          style={{
            background: 'var(--admin-bg)',
            border: '1px solid var(--admin-border)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Swatches */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="flex gap-0.5">
                <span
                  className="w-5 h-5 rounded-l"
                  style={{ background: t.preview.primary, border: '1px solid rgba(0,0,0,0.08)' }}
                />
                <span
                  className="w-5 h-5"
                  style={{ background: t.preview.accent, borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                />
                <span
                  className="w-5 h-5 rounded-r"
                  style={{ background: t.preview.background, border: '1px solid rgba(0,0,0,0.08)' }}
                />
              </div>
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--admin-text)' }}>
                {t.name}
                {t.recommended && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: '#FEF3C7', color: '#92400E' }}
                  >
                    ★ Pour toi
                  </span>
                )}
                {confirmingId === t.id && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-green-700">
                    <Check size={11} /> Appliqué
                  </span>
                )}
              </p>
              <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--admin-text-muted)' }}>
                {t.description}
              </p>
            </div>

            <Sparkles
              size={14}
              className="opacity-0 group-hover:opacity-100 transition flex-shrink-0"
              style={{ color: 'var(--brand-blue)' }}
            />
          </div>
        </button>
      ))}
      <p className="text-[10px] mt-2 px-1" style={{ color: 'var(--admin-text-faint)' }}>
        ⚠️ N&apos;oublie pas de cliquer <b>Publier</b> en haut à droite pour activer le thème sur ton site.
      </p>
    </div>
  );
}

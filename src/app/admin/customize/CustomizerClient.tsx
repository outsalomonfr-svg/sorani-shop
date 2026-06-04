'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Palette,
  Type,
  Megaphone,
  Image as ImageIcon,
  Menu as MenuIcon,
  Layout,
  Save,
  Undo2,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Button, Label, Input, Textarea } from '@/components/admin/ui';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  HEADING_FONTS,
  BODY_FONTS,
  type SiteSettings,
  type FontChoice,
} from '@/types/site-settings';
import { saveSiteSettings } from './actions';

type SectionId = 'brand' | 'colors' | 'typography' | 'announcement' | 'hero' | 'nav' | 'footer';

const sectionMeta: Record<SectionId, { label: string; icon: typeof Layout }> = {
  brand: { label: 'Marque', icon: Layout },
  colors: { label: 'Couleurs', icon: Palette },
  typography: { label: 'Typographie', icon: Type },
  announcement: { label: 'Barre d’annonce', icon: Megaphone },
  hero: { label: 'Hero (page d’accueil)', icon: ImageIcon },
  nav: { label: 'Menu de navigation', icon: MenuIcon },
  footer: { label: 'Pied de page', icon: Layout },
};

type Device = 'mobile' | 'tablet' | 'desktop';
const deviceWidths: Record<Device, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

export default function CustomizerClient({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [savedSettings, setSavedSettings] = useState<SiteSettings>(initialSettings);
  const [activeSection, setActiveSection] = useState<SectionId>('brand');
  const [device, setDevice] = useState<Device>('desktop');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // Listen for iframe-ready signal
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'sorani:preview-ready') {
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Push settings to iframe whenever they change
  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'sorani:preview-settings', settings },
      '*'
    );
  }, [settings, iframeReady]);

  const handleSave = async () => {
    setSaving(true);
    const res = await saveSiteSettings(settings);
    setSaving(false);
    if (res.ok) {
      setSavedSettings(settings);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } else {
      alert(`Erreur de sauvegarde: ${res.error}`);
    }
  };

  const handleRevert = () => {
    setSettings(savedSettings);
  };

  /* helpers */
  const updateBrand = (patch: Partial<SiteSettings['brand']>) =>
    setSettings({ ...settings, brand: { ...settings.brand, ...patch } });
  const updateColors = (patch: Partial<SiteSettings['colors']>) =>
    setSettings({ ...settings, colors: { ...settings.colors, ...patch } });
  const updateTypo = (patch: Partial<SiteSettings['typography']>) =>
    setSettings({ ...settings, typography: { ...settings.typography, ...patch } });
  const updateAnnouncement = (patch: Partial<SiteSettings['announcement']>) =>
    setSettings({ ...settings, announcement: { ...settings.announcement, ...patch } });
  const updateHero = (patch: Partial<SiteSettings['hero']>) =>
    setSettings({ ...settings, hero: { ...settings.hero, ...patch } });
  const updateFooter = (patch: Partial<SiteSettings['footer']>) =>
    setSettings({ ...settings, footer: { ...settings.footer, ...patch } });

  return (
    <div className="-mx-4 md:-mx-8 -my-6 md:-my-8 h-[calc(100vh-3rem)] flex flex-col">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 md:px-6 h-12 border-b"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
            Apparence du site
          </h1>
          {isDirty && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#FFF4E5', color: '#9A5A00' }}
            >
              Modifications non publiées
            </span>
          )}
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ background: 'var(--admin-hover)' }}>
          {(['mobile', 'tablet', 'desktop'] as Device[]).map((d) => {
            const Icon = d === 'mobile' ? Smartphone : d === 'tablet' ? Tablet : Monitor;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className="px-2 py-1 rounded transition"
                style={{
                  background: device === d ? 'var(--admin-surface)' : 'transparent',
                  color: device === d ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                  boxShadow: device === d ? 'var(--shadow-xs)' : undefined,
                }}
                title={d}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="ghost" size="sm" icon={Undo2} onClick={handleRevert}>
              Annuler
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={justSaved ? CheckCircle2 : Save}
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Publication…' : justSaved ? 'Publié' : 'Publier'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: editor */}
        <aside
          className="w-[320px] border-r flex flex-col"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
        >
          {/* Section list */}
          <nav className="px-2 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            {(Object.keys(sectionMeta) as SectionId[]).map((id) => {
              const meta = sectionMeta[id];
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition"
                  style={{
                    background: isActive ? 'var(--admin-hover)' : 'transparent',
                    color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  <meta.icon size={14} style={{ color: isActive ? 'var(--brand-blue)' : 'currentColor' }} />
                  <span className="flex-1 text-left">{meta.label}</span>
                  {isActive ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              );
            })}
          </nav>

          {/* Section editor */}
          <div className="flex-1 overflow-y-auto admin-scroll p-4 space-y-4">
            {activeSection === 'brand' && (
              <div className="space-y-3">
                <div>
                  <Label>Nom de la marque</Label>
                  <Input value={settings.brand.name} onChange={(e) => updateBrand({ name: e.target.value })} />
                </div>
                <ImageUpload
                  label="Logo"
                  value={settings.brand.logoUrl}
                  onChange={(url) => updateBrand({ logoUrl: url })}
                  folder="logo"
                  aspectRatio="wide"
                  helpText="Laisse vide pour afficher le nom à la place du logo."
                />
                <div>
                  <Label>Tagline</Label>
                  <Input value={settings.brand.tagline} onChange={(e) => updateBrand({ tagline: e.target.value })} />
                </div>
              </div>
            )}

            {activeSection === 'colors' && (
              <div className="space-y-3">
                <ColorField label="Couleur primaire" value={settings.colors.primary} onChange={(v) => updateColors({ primary: v })} />
                <ColorField label="Primaire foncée" value={settings.colors.primaryDark} onChange={(v) => updateColors({ primaryDark: v })} />
                <ColorField label="Accent" value={settings.colors.accent} onChange={(v) => updateColors({ accent: v })} />
                <ColorField label="Fond" value={settings.colors.background} onChange={(v) => updateColors({ background: v })} />
                <ColorField label="Texte" value={settings.colors.text} onChange={(v) => updateColors({ text: v })} />
              </div>
            )}

            {activeSection === 'typography' && (
              <div className="space-y-3">
                <div>
                  <Label>Police des titres</Label>
                  <FontSelect
                    value={settings.typography.headingFont}
                    options={HEADING_FONTS}
                    onChange={(v) => updateTypo({ headingFont: v })}
                  />
                </div>
                <div>
                  <Label>Police du texte</Label>
                  <FontSelect
                    value={settings.typography.bodyFont}
                    options={BODY_FONTS}
                    onChange={(v) => updateTypo({ bodyFont: v })}
                  />
                </div>
              </div>
            )}

            {activeSection === 'announcement' && (
              <div className="space-y-3">
                <ToggleField
                  label="Afficher la barre d’annonce"
                  value={settings.announcement.enabled}
                  onChange={(v) => updateAnnouncement({ enabled: v })}
                />
                <div>
                  <Label>Message</Label>
                  <Input
                    value={settings.announcement.text}
                    onChange={(e) => updateAnnouncement({ text: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Lien (optionnel)</Label>
                  <Input
                    value={settings.announcement.link}
                    onChange={(e) => updateAnnouncement({ link: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
              </div>
            )}

            {activeSection === 'hero' && (
              <div className="space-y-3">
                <div>
                  <Label>Titre principal</Label>
                  <Input value={settings.hero.title} onChange={(e) => updateHero({ title: e.target.value })} />
                </div>
                <div>
                  <Label>Sous-titre</Label>
                  <Textarea
                    rows={3}
                    value={settings.hero.subtitle}
                    onChange={(e) => updateHero({ subtitle: e.target.value })}
                  />
                </div>
                <ImageUpload
                  label="Image de fond du hero"
                  value={settings.hero.imageUrl}
                  onChange={(url) => updateHero({ imageUrl: url })}
                  folder="hero"
                  aspectRatio="wide"
                  helpText="Format paysage recommandé (1920×1080 ou plus)."
                />
                <div>
                  <Label>Texte du bouton</Label>
                  <Input value={settings.hero.ctaLabel} onChange={(e) => updateHero({ ctaLabel: e.target.value })} />
                </div>
                <div>
                  <Label>Lien du bouton</Label>
                  <Input value={settings.hero.ctaLink} onChange={(e) => updateHero({ ctaLink: e.target.value })} />
                </div>
              </div>
            )}

            {activeSection === 'nav' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {settings.nav.links.map((link, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg space-y-2"
                      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                          Lien {i + 1}
                        </span>
                        <button
                          onClick={() =>
                            setSettings({
                              ...settings,
                              nav: { links: settings.nav.links.filter((_, idx) => idx !== i) },
                            })
                          }
                          className="p-1 rounded hover:bg-[#FEF2F2]"
                          style={{ color: 'var(--admin-text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <Input
                        placeholder="Libellé"
                        value={link.label}
                        onChange={(e) => {
                          const links = [...settings.nav.links];
                          links[i] = { ...links[i], label: e.target.value };
                          setSettings({ ...settings, nav: { links } });
                        }}
                      />
                      <Input
                        placeholder="/shop"
                        value={link.href}
                        onChange={(e) => {
                          const links = [...settings.nav.links];
                          links[i] = { ...links[i], href: e.target.value };
                          setSettings({ ...settings, nav: { links } });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      nav: { links: [...settings.nav.links, { label: 'Nouveau lien', href: '/' }] },
                    })
                  }
                >
                  Ajouter un lien
                </Button>
              </div>
            )}

            {activeSection === 'footer' && (
              <div className="space-y-3">
                <div>
                  <Label>À propos (paragraphe)</Label>
                  <Textarea
                    rows={4}
                    value={settings.footer.about}
                    onChange={(e) => updateFooter({ about: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email de contact</Label>
                  <Input
                    type="email"
                    value={settings.footer.contactEmail}
                    onChange={(e) => updateFooter({ contactEmail: e.target.value })}
                  />
                </div>
                <div className="pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                    Réseaux sociaux
                  </p>
                  <div className="space-y-2">
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={settings.footer.social.instagram || ''}
                        onChange={(e) =>
                          updateFooter({ social: { ...settings.footer.social, instagram: e.target.value } })
                        }
                        placeholder="https://instagram.com/…"
                      />
                    </div>
                    <div>
                      <Label>Facebook</Label>
                      <Input
                        value={settings.footer.social.facebook || ''}
                        onChange={(e) =>
                          updateFooter({ social: { ...settings.footer.social, facebook: e.target.value } })
                        }
                        placeholder="https://facebook.com/…"
                      />
                    </div>
                    <div>
                      <Label>TikTok</Label>
                      <Input
                        value={settings.footer.social.tiktok || ''}
                        onChange={(e) =>
                          updateFooter({ social: { ...settings.footer.social, tiktok: e.target.value } })
                        }
                        placeholder="https://tiktok.com/@…"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right: preview */}
        <div className="flex-1 flex items-stretch justify-center p-4 md:p-6" style={{ background: 'var(--admin-bg)' }}>
          <div
            className="bg-white shadow-md rounded-lg overflow-hidden w-full h-full transition-all duration-300 mx-auto"
            style={{
              maxWidth: deviceWidths[device],
              border: '1px solid var(--admin-border)',
            }}
          >
            <iframe
              ref={iframeRef}
              src="/?preview=1"
              title="Aperçu du site"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-md border flex-shrink-0 overflow-hidden relative"
          style={{ background: value, borderColor: 'var(--admin-border-strong)' }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function FontSelect({
  value,
  options,
  onChange,
}: {
  value: FontChoice;
  options: FontChoice[];
  onChange: (v: FontChoice) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FontChoice)}
      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
      style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border-strong)',
        color: 'var(--admin-text)',
      }}
    >
      {options.map((f) => (
        <option key={f} value={f} style={{ fontFamily: f }}>
          {f}
        </option>
      ))}
    </select>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg"
      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
    >
      <span className="text-sm" style={{ color: 'var(--admin-text)' }}>
        {label}
      </span>
      <span
        className="w-9 h-5 rounded-full p-0.5 transition flex"
        style={{ background: value ? 'var(--brand-blue)' : '#D9D9D6', justifyContent: value ? 'flex-end' : 'flex-start' }}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
      </span>
    </button>
  );
}

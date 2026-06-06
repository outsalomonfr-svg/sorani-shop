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
  Heart,
  BookOpen,
  Star,
  Grid3x3,
  Shield,
  Mail,
  GripVertical,
  Eye,
  EyeOff,
  Images,
  Square,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button, Label, Input, Textarea } from '@/components/admin/ui';
import ImageUpload from '@/components/admin/ImageUpload';
import ImagePositionControl from '@/components/admin/ImagePositionControl';
import FeaturedProductPicker from '@/components/admin/FeaturedProductPicker';
import CategoryPicker from '@/components/admin/CategoryPicker';
import ThemePicker from '@/components/admin/ThemePicker';
import {
  HEADING_FONTS,
  BODY_FONTS,
  ALL_FONTS,
  ADDABLE_SECTION_TYPES,
  SECTION_TYPE_LABELS,
  type SiteSettings,
  type FontChoice,
  type HomeSection,
  type HomeSectionType,
} from '@/types/site-settings';
import { saveSiteSettings } from './actions';
import { useNavCategories } from '@/components/settings/CategoriesProvider';

type SectionId =
  | 'themes'
  | 'brand'
  | 'colors'
  | 'typography'
  | 'announcement'
  | 'hero'
  | 'featured'
  | 'story'
  | 'reasons'
  | 'categoriesTitle'
  | 'trust'
  | 'newsletter'
  | 'nav'
  | 'footer';

// Type pour l'état actif : soit une section fixe, soit l'ID d'une section custom
type ActiveSel = SectionId | string;
const isFixedSection = (id: string, meta: Record<string, unknown>): id is SectionId =>
  id in meta;

const sectionMeta: Record<SectionId, { label: string; icon: typeof Layout }> = {
  themes: { label: 'Thèmes pré-faits', icon: Sparkles },
  brand: { label: 'Marque', icon: Layout },
  colors: { label: 'Couleurs', icon: Palette },
  typography: { label: 'Typographie', icon: Type },
  announcement: { label: 'Barre d’annonce', icon: Megaphone },
  hero: { label: 'Hero', icon: ImageIcon },
  featured: { label: 'Coups de cœur', icon: Heart },
  story: { label: 'L’histoire', icon: BookOpen },
  reasons: { label: '4 raisons', icon: Star },
  categoriesTitle: { label: 'Catégories', icon: Grid3x3 },
  trust: { label: 'Badges confiance', icon: Shield },
  newsletter: { label: 'Newsletter', icon: Mail },
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
  const [activeSection, setActiveSection] = useState<ActiveSel>('brand');
  const [device, setDevice] = useState<Device>('desktop');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const [listView, setListView] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorPanelRef = useRef<HTMLDivElement>(null);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // Listen for iframe events (ready + click-to-edit)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'sorani:preview-ready') {
        setIframeReady(true);
      } else if (event.data?.type === 'sorani:edit-section') {
        const sec = event.data.section as string;
        if (!sec) return;
        // Accept fixed sections OR custom section IDs (custom-XXXXXX)
        const isFixed = sec in sectionMeta;
        const isCustom = sec.startsWith('custom-');
        if (isFixed || isCustom) {
          setActiveSection(sec);
          setListView(false);
          if (event.data.field) {
            setHighlightField(event.data.field);
            setFocusMode(true);
          } else {
            setFocusMode(false);
            setHighlightField(null);
          }
        }
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

  // Focus mode: masque tous les champs sauf celui ciblé + scroll + ring
  useEffect(() => {
    const panel = editorPanelRef.current;
    if (!panel) return;

    // Reset visibility
    panel.querySelectorAll<HTMLElement>('[data-field-id]').forEach((el) => {
      el.style.display = '';
      el.classList.remove('field-focused');
    });
    panel.querySelectorAll<HTMLElement>('details, .style-block').forEach((el) => {
      el.style.display = '';
    });

    if (!focusMode || !highlightField) return;

    // Hide non-matching groups
    panel.querySelectorAll<HTMLElement>('[data-field-id]').forEach((el) => {
      if (el.getAttribute('data-field-id') !== highlightField) {
        el.style.display = 'none';
      } else {
        el.classList.add('field-focused');
      }
    });
    // Hide style accordion in focus mode
    panel.querySelectorAll<HTMLElement>('details, .style-block').forEach((el) => {
      el.style.display = 'none';
    });

    const target = panel.querySelector(`[data-field-id="${highlightField}"]`) as HTMLElement | null;
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const input = target.querySelector<HTMLElement>('input, textarea');
      if (input) setTimeout(() => input.focus(), 250);
    });
  }, [highlightField, activeSection, focusMode]);

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
  const updateStory = (patch: Partial<SiteSettings['story']>) =>
    setSettings({ ...settings, story: { ...settings.story, ...patch } });
  const updateNewsletter = (patch: Partial<SiteSettings['newsletter']>) =>
    setSettings({ ...settings, newsletter: { ...settings.newsletter, ...patch } });

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
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition"
            style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border-strong)',
              color: 'var(--admin-text)',
            }}
            title="Ouvrir le site dans un nouvel onglet"
          >
            <ExternalLink size={13} />
            Aperçu du site
          </a>
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
          {/* Section list (when listView) */}
          {listView ? (
            <SectionsListView
              settings={settings}
              setActiveSection={(id) => {
                setActiveSection(id);
                setListView(false);
                setFocusMode(false);
                setHighlightField(null);
              }}
              onUpdateLayout={(sections) =>
                setSettings({ ...settings, homeLayout: { sections } })
              }
            />
          ) : (
            <>
              {/* Breadcrumb header when editing a section */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 border-b"
                style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}
              >
                <button
                  onClick={() => {
                    setListView(true);
                    setFocusMode(false);
                    setHighlightField(null);
                  }}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-black/[0.04] transition"
                  style={{ color: 'var(--admin-text-muted)' }}
                >
                  <ChevronRight size={12} className="rotate-180" />
                  Sections
                </button>
                <span className="text-xs" style={{ color: 'var(--admin-text-faint)' }}>/</span>
                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                  {(() => {
                    if (isFixedSection(activeSection, sectionMeta)) {
                      const Icon = sectionMeta[activeSection].icon;
                      return <Icon size={14} style={{ color: 'var(--brand-blue)' }} />;
                    }
                    const cs = settings.homeLayout?.sections.find((s) => s.id === activeSection);
                    if (!cs) return null;
                    return <Layout size={14} style={{ color: 'var(--brand-blue)' }} />;
                  })()}
                  {(() => {
                    if (isFixedSection(activeSection, sectionMeta)) {
                      return sectionMeta[activeSection].label;
                    }
                    const cs = settings.homeLayout?.sections.find((s) => s.id === activeSection);
                    return cs ? (cs.custom?.title || SECTION_TYPE_LABELS[cs.type]) : 'Section';
                  })()}
                </span>
              </div>

              {/* Section editor (takes all remaining space) */}
              {focusMode && highlightField && (
                <div
                  className="px-4 py-2 border-b text-xs flex items-center justify-between"
                  style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    borderColor: 'var(--admin-border)',
                  }}
                >
                  <span>Édition rapide d’un seul champ</span>
                  <button
                    onClick={() => {
                      setFocusMode(false);
                      setHighlightField(null);
                    }}
                    className="font-medium underline"
                  >
                    Voir toute la section
                  </button>
                </div>
              )}
              <div ref={editorPanelRef} className="flex-1 overflow-y-auto admin-scroll p-4 space-y-4">
            {activeSection === 'themes' && (
              <ThemePicker settings={settings} onApply={setSettings} />
            )}

            {activeSection === 'brand' && (
              <div className="space-y-3">
                <div data-field-id="name">
                  <Label>Nom de la marque</Label>
                  <Input value={settings.brand.name} onChange={(e) => updateBrand({ name: e.target.value })} />
                </div>
                <div data-field-id="logoUrl">
                  <ImageUpload
                    label="Logo"
                    value={settings.brand.logoUrl}
                    onChange={(url) => updateBrand({ logoUrl: url })}
                    folder="logo"
                    aspectRatio="wide"
                    helpText="Laisse vide pour afficher le nom à la place du logo."
                  />
                </div>
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
                <div data-field-id="headingFont">
                  <Label>Titres (h1, h2, h3)</Label>
                  <FontSelect
                    value={settings.typography.headingFont}
                    options={HEADING_FONTS}
                    onChange={(v) => updateTypo({ headingFont: v })}
                  />
                </div>
                <div data-field-id="bodyFont">
                  <Label>Texte courant</Label>
                  <FontSelect
                    value={settings.typography.bodyFont}
                    options={BODY_FONTS}
                    onChange={(v) => updateTypo({ bodyFont: v })}
                  />
                </div>
                <div data-field-id="navFont">
                  <Label>Menu de navigation</Label>
                  <FontSelect
                    value={settings.typography.navFont || settings.typography.headingFont}
                    options={ALL_FONTS}
                    onChange={(v) => updateTypo({ navFont: v })}
                  />
                </div>
                <div data-field-id="productFont">
                  <Label>Nom des produits</Label>
                  <FontSelect
                    value={settings.typography.productFont || settings.typography.headingFont}
                    options={ALL_FONTS}
                    onChange={(v) => updateTypo({ productFont: v })}
                  />
                </div>
                <div data-field-id="priceFont">
                  <Label>Prix</Label>
                  <FontSelect
                    value={settings.typography.priceFont || settings.typography.bodyFont}
                    options={ALL_FONTS}
                    onChange={(v) => updateTypo({ priceFont: v })}
                  />
                </div>
                <div data-field-id="buttonFont">
                  <Label>Boutons</Label>
                  <FontSelect
                    value={settings.typography.buttonFont || settings.typography.bodyFont}
                    options={ALL_FONTS}
                    onChange={(v) => updateTypo({ buttonFont: v })}
                  />
                </div>
                <p className="text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
                  Les polices sont chargées automatiquement depuis Google Fonts.
                </p>
              </div>
            )}

            {activeSection === 'announcement' && (
              <div className="space-y-3">
                <div data-field-id="enabled">
                  <ToggleField
                    label="Afficher la barre d’annonce"
                    value={settings.announcement.enabled}
                    onChange={(v) => updateAnnouncement({ enabled: v })}
                  />
                </div>
                <div data-field-id="text">
                  <Label>Message</Label>
                  <Input
                    value={settings.announcement.text}
                    onChange={(e) => updateAnnouncement({ text: e.target.value })}
                  />
                </div>
                <div data-field-id="link">
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
                <div data-field-id="title">
                  <Label>Titre principal</Label>
                  <Input value={settings.hero.title} onChange={(e) => updateHero({ title: e.target.value })} />
                </div>
                <div data-field-id="subtitle">
                  <Label>Sous-titre</Label>
                  <Textarea
                    rows={3}
                    value={settings.hero.subtitle}
                    onChange={(e) => updateHero({ subtitle: e.target.value })}
                  />
                </div>
                <div data-field-id="imageUrl">
                  <ImageUpload
                    label="Image de fond du hero"
                    value={settings.hero.imageUrl}
                    onChange={(url) => updateHero({ imageUrl: url })}
                    folder="hero"
                    aspectRatio="wide"
                    placeholderUrl="/images/hero-1.png"
                    helpText="Format paysage recommandé (1920×1080 ou plus)."
                  />
                </div>
                <div data-field-id="imagePosition" className="pt-2">
                  <ImagePositionControl
                    imageUrl={settings.hero.imageUrl || '/images/hero-1.png'}
                    value={settings.hero.imagePosition}
                    onChange={(pos) => updateHero({ imagePosition: pos })}
                    desktopRatio={16 / 9}
                    mobileRatio={9 / 16}
                  />
                </div>
                <div data-field-id="ctaLabel">
                  <Label>Texte du bouton</Label>
                  <Input value={settings.hero.ctaLabel} onChange={(e) => updateHero({ ctaLabel: e.target.value })} />
                </div>
                <div data-field-id="ctaLink">
                  <Label>Lien du bouton</Label>
                  <Input value={settings.hero.ctaLink} onChange={(e) => updateHero({ ctaLink: e.target.value })} />
                </div>

                {/* Voile / Overlay */}
                <div
                  className="pt-3 border-t space-y-3"
                  style={{ borderColor: 'var(--admin-border)' }}
                  data-field-id="overlay"
                >
                  <ToggleField
                    label="Voile coloré au-dessus de l'image"
                    value={!!settings.hero.overlayEnabled}
                    onChange={(v) => updateHero({ overlayEnabled: v })}
                  />
                  {settings.hero.overlayEnabled && (
                    <>
                      <ColorField
                        label="Couleur du voile"
                        value={settings.hero.overlayColor || '#1B4965'}
                        onChange={(v) => updateHero({ overlayColor: v })}
                      />
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label>Opacité du voile</Label>
                          <span className="text-xs font-mono" style={{ color: 'var(--admin-text-muted)' }}>
                            {settings.hero.overlayOpacity ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={settings.hero.overlayOpacity ?? 50}
                          onChange={(e) => updateHero({ overlayOpacity: parseInt(e.target.value) })}
                          className="w-full accent-[#1B4965]"
                        />
                      </div>
                      <div>
                        <Label>Direction du voile</Label>
                        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
                          {(['full', 'horizontal', 'vertical'] as const).map((d) => {
                            const isActive = (settings.hero.overlayDirection || 'horizontal') === d;
                            const label =
                              d === 'full' ? 'Uniforme' : d === 'horizontal' ? 'De gauche' : 'Du bas';
                            return (
                              <button
                                key={d}
                                onClick={() => updateHero({ overlayDirection: d })}
                                className="flex-1 text-xs py-1.5 rounded transition"
                                style={{
                                  background: isActive ? 'var(--admin-surface)' : 'transparent',
                                  color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                                  boxShadow: isActive ? 'var(--shadow-xs)' : undefined,
                                  fontWeight: isActive ? 500 : 400,
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <SectionStyleEditor sectionKey="hero" settings={settings} setSettings={setSettings} defaultBg={settings.colors.primary} />
              </div>
            )}

            {activeSection === 'nav' && (
              <div className="space-y-4">
                {/* Layout */}
                <div data-field-id="layout">
                  <Label>Disposition du menu</Label>
                  <select
                    value={settings.nav.layout || 'two-row'}
                    onChange={(e) =>
                      setSettings({ ...settings, nav: { ...settings.nav, layout: e.target.value as 'two-row' | 'single-row-left' | 'single-row-center' } })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                    style={{
                      background: 'var(--admin-surface)',
                      border: '1px solid var(--admin-border-strong)',
                      color: 'var(--admin-text)',
                    }}
                  >
                    <option value="two-row">Logo centré (2 rangées)</option>
                    <option value="single-row-left">Logo à gauche, menu au centre</option>
                    <option value="single-row-center">Logo centré, menu autour</option>
                  </select>
                </div>

                {/* Background */}
                <div data-field-id="background">
                  <Label>Fond de la navbar</Label>
                  <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
                    {(['glass', 'solid', 'transparent'] as const).map((b) => {
                      const isActive = (settings.nav.background || 'glass') === b;
                      const label = b === 'glass' ? 'Verre flou' : b === 'solid' ? 'Plein' : 'Transparent';
                      return (
                        <button
                          key={b}
                          onClick={() => setSettings({ ...settings, nav: { ...settings.nav, background: b } })}
                          className="flex-1 text-xs py-1.5 rounded transition"
                          style={{
                            background: isActive ? 'var(--admin-surface)' : 'transparent',
                            color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                            boxShadow: isActive ? 'var(--shadow-xs)' : undefined,
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>
                    Transparent : la navbar laisse voir le hero, devient opaque au scroll.
                  </p>
                </div>

                {/* Custom colors */}
                <div className="grid grid-cols-2 gap-2">
                  <ColorField
                    label="Fond personnalisé"
                    value={settings.nav.bgColor || '#FFFFFF'}
                    onChange={(v) => setSettings({ ...settings, nav: { ...settings.nav, bgColor: v } })}
                  />
                  <ColorField
                    label="Texte"
                    value={settings.nav.textColor || '#374151'}
                    onChange={(v) => setSettings({ ...settings, nav: { ...settings.nav, textColor: v } })}
                  />
                </div>

                {/* Icons toggles */}
                <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--admin-border)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                    Icônes affichées à droite
                  </p>
                  <ToggleField
                    label="Loupe de recherche"
                    value={settings.nav.showSearch !== false}
                    onChange={(v) => setSettings({ ...settings, nav: { ...settings.nav, showSearch: v } })}
                  />
                  <ToggleField
                    label="Compte client"
                    value={settings.nav.showAccount !== false}
                    onChange={(v) => setSettings({ ...settings, nav: { ...settings.nav, showAccount: v } })}
                  />
                  <ToggleField
                    label="Panier"
                    value={settings.nav.showCart !== false}
                    onChange={(v) => setSettings({ ...settings, nav: { ...settings.nav, showCart: v } })}
                  />
                </div>

                {/* Sticky */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                  <ToggleField
                    label="Navbar collante au scroll"
                    value={settings.nav.sticky !== false}
                    onChange={(v) => setSettings({ ...settings, nav: { ...settings.nav, sticky: v } })}
                  />
                </div>

                {/* Links */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                    Liens du menu
                  </p>
                  <NavMenuEditor
                    links={settings.nav.links}
                    onChange={(links) => setSettings({ ...settings, nav: { ...settings.nav, links } })}
                  />
                </div>
              </div>
            )}

            {activeSection === 'featured' && (
              <div className="space-y-3">
                <div data-field-id="title">
                  <Label>Titre de la section</Label>
                  <Input
                    value={settings.featuredTitle}
                    onChange={(e) => setSettings({ ...settings, featuredTitle: e.target.value })}
                  />
                </div>
                <div data-field-id="products">
                  <Label>Produits affichés</Label>
                  <FeaturedProductPicker />
                </div>
                <SectionStyleEditor sectionKey="featured" settings={settings} setSettings={setSettings} defaultBg="#ffffff" />
              </div>
            )}

            {activeSection === 'story' && (
              <div className="space-y-3">
                <div data-field-id="title">
                  <Label>Titre</Label>
                  <Input value={settings.story.title} onChange={(e) => updateStory({ title: e.target.value })} />
                </div>
                <div data-field-id="paragraph1">
                  <Label>Paragraphe 1</Label>
                  <Textarea
                    rows={3}
                    value={settings.story.paragraph1}
                    onChange={(e) => updateStory({ paragraph1: e.target.value })}
                  />
                </div>
                <div data-field-id="paragraph2">
                  <Label>Paragraphe 2</Label>
                  <Textarea
                    rows={3}
                    value={settings.story.paragraph2}
                    onChange={(e) => updateStory({ paragraph2: e.target.value })}
                  />
                </div>
                <div data-field-id="imageUrl">
                  <ImageUpload
                    label="Image"
                    value={settings.story.imageUrl}
                    onChange={(url) => updateStory({ imageUrl: url })}
                    folder="story"
                    aspectRatio="wide"
                    placeholderUrl="/images/sorani-card.jpg"
                  />
                </div>
                <div data-field-id="imagePosition" className="pt-2">
                  <ImagePositionControl
                    imageUrl={settings.story.imageUrl || '/images/sorani-card.jpg'}
                    value={settings.story.imagePosition}
                    onChange={(pos) => updateStory({ imagePosition: pos })}
                    desktopRatio={4 / 5}
                    mobileRatio={4 / 5}
                  />
                </div>
                <div data-field-id="ctaLabel">
                  <Label>Texte du bouton</Label>
                  <Input value={settings.story.ctaLabel} onChange={(e) => updateStory({ ctaLabel: e.target.value })} />
                </div>
                <div>
                  <Label>Lien du bouton</Label>
                  <Input value={settings.story.ctaLink} onChange={(e) => updateStory({ ctaLink: e.target.value })} />
                </div>
                <SectionStyleEditor sectionKey="story" settings={settings} setSettings={setSettings} defaultBg={settings.colors.primary} />
              </div>
            )}

            {activeSection === 'reasons' && (
              <div className="space-y-3">
                <div data-field-id="title">
                  <Label>Titre</Label>
                  <Input
                    value={settings.reasons.title}
                    onChange={(e) =>
                      setSettings({ ...settings, reasons: { ...settings.reasons, title: e.target.value } })
                    }
                  />
                </div>
                <div data-field-id="subtitle">
                  <Label>Sous-titre</Label>
                  <Input
                    value={settings.reasons.subtitle}
                    onChange={(e) =>
                      setSettings({ ...settings, reasons: { ...settings.reasons, subtitle: e.target.value } })
                    }
                  />
                </div>
                <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--admin-border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--admin-text)' }}>
                    Les 4 raisons
                  </p>
                  {settings.reasons.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg space-y-2"
                      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                      data-field-id={`item-${idx}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                          Raison {idx + 1}
                        </p>
                        <button
                          onClick={() => {
                            const items = settings.reasons.items.filter((_, i) => i !== idx);
                            setSettings({ ...settings, reasons: { ...settings.reasons, items } });
                          }}
                          className="p-1 rounded hover:bg-[#FEF2F2]"
                          style={{ color: 'var(--admin-text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <Input
                        placeholder="Titre"
                        value={item.title}
                        onChange={(e) => {
                          const items = [...settings.reasons.items];
                          items[idx] = { ...items[idx], title: e.target.value };
                          setSettings({ ...settings, reasons: { ...settings.reasons, items } });
                        }}
                      />
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const items = [...settings.reasons.items];
                          items[idx] = { ...items[idx], description: e.target.value };
                          setSettings({ ...settings, reasons: { ...settings.reasons, items } });
                        }}
                      />
                      <ImageUpload
                        value={item.imageUrl}
                        folder="reasons"
                        aspectRatio="square"
                        onChange={(url) => {
                          const items = [...settings.reasons.items];
                          items[idx] = { ...items[idx], imageUrl: url };
                          setSettings({ ...settings, reasons: { ...settings.reasons, items } });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={() =>
                      setSettings({
                        ...settings,
                        reasons: {
                          ...settings.reasons,
                          items: [
                            ...settings.reasons.items,
                            { title: 'Nouvelle raison', description: 'Description', imageUrl: '' },
                          ],
                        },
                      })
                    }
                  >
                    Ajouter une raison
                  </Button>
                </div>
                <SectionStyleEditor sectionKey="reasons" settings={settings} setSettings={setSettings} />
              </div>
            )}

            {activeSection === 'categoriesTitle' && (
              <div className="space-y-3">
                <div data-field-id="title">
                  <Label>Titre de la section catégories</Label>
                  <Input
                    value={settings.categoriesTitle}
                    onChange={(e) => setSettings({ ...settings, categoriesTitle: e.target.value })}
                  />
                </div>
                <div data-field-id="categories">
                  <Label>Catégories</Label>
                  <CategoryPicker
                    hiddenSlugs={settings.hiddenCategorySlugs || []}
                    onChangeHidden={(slugs) => setSettings({ ...settings, hiddenCategorySlugs: slugs })}
                    onDbChange={() => {
                      if (iframeRef.current) {
                        // Recharge la preview pour refléter les nouvelles données serveur
                        iframeRef.current.src = iframeRef.current.src;
                      }
                    }}
                  />
                </div>
                <SectionStyleEditor sectionKey="categories" settings={settings} setSettings={setSettings} defaultBg="#f9fafb" />
              </div>
            )}

            {activeSection === 'trust' && (
              <div className="space-y-3">
                <p className="text-xs font-medium" style={{ color: 'var(--admin-text)' }}>
                  Badges de confiance
                </p>
                {settings.trust.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg space-y-2"
                    style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                    data-field-id={`item-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                        Badge {idx + 1}
                      </p>
                      <button
                        onClick={() => {
                          const items = settings.trust.items.filter((_, i) => i !== idx);
                          setSettings({ ...settings, trust: { items } });
                        }}
                        className="p-1 rounded hover:bg-[#FEF2F2]"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <Input
                      placeholder="Titre"
                      value={item.title}
                      onChange={(e) => {
                        const items = [...settings.trust.items];
                        items[idx] = { ...items[idx], title: e.target.value };
                        setSettings({ ...settings, trust: { items } });
                      }}
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const items = [...settings.trust.items];
                        items[idx] = { ...items[idx], description: e.target.value };
                        setSettings({ ...settings, trust: { items } });
                      }}
                    />
                    <select
                      value={item.icon}
                      onChange={(e) => {
                        const items = [...settings.trust.items];
                        items[idx] = { ...items[idx], icon: e.target.value as typeof item.icon };
                        setSettings({ ...settings, trust: { items } });
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                      style={{
                        background: 'var(--admin-surface)',
                        border: '1px solid var(--admin-border-strong)',
                        color: 'var(--admin-text)',
                      }}
                    >
                      <option value="Sparkles">Étincelles</option>
                      <option value="Droplets">Gouttes (waterproof)</option>
                      <option value="Truck">Camion (livraison)</option>
                      <option value="Shield">Bouclier (sécurité)</option>
                    </select>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      trust: {
                        items: [
                          ...settings.trust.items,
                          { title: 'Nouveau badge', description: 'Description', icon: 'Sparkles' },
                        ],
                      },
                    })
                  }
                >
                  Ajouter un badge
                </Button>
                <SectionStyleEditor sectionKey="trust" settings={settings} setSettings={setSettings} />
              </div>
            )}

            {activeSection === 'newsletter' && (
              <div className="space-y-3">
                <div data-field-id="title">
                  <Label>Titre</Label>
                  <Input
                    value={settings.newsletter.title}
                    onChange={(e) => updateNewsletter({ title: e.target.value })}
                  />
                </div>
                <div data-field-id="subtitle">
                  <Label>Sous-titre</Label>
                  <Textarea
                    rows={2}
                    value={settings.newsletter.subtitle}
                    onChange={(e) => updateNewsletter({ subtitle: e.target.value })}
                  />
                </div>
                <div data-field-id="ctaLabel">
                  <Label>Texte du bouton</Label>
                  <Input
                    value={settings.newsletter.ctaLabel}
                    onChange={(e) => updateNewsletter({ ctaLabel: e.target.value })}
                  />
                </div>
                <SectionStyleEditor sectionKey="newsletter" settings={settings} setSettings={setSettings} defaultBg={settings.colors.primary} />
              </div>
            )}

            {activeSection === 'footer' && (
              <div className="space-y-3">
                <div data-field-id="about">
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
                <div className="pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }} data-field-id="social">
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

                {/* Colonnes de liens */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--admin-text)' }}>
                    Colonnes de liens
                  </p>
                  {(settings.footer.columns || []).map((col, ci) => (
                    <div
                      key={ci}
                      data-field-id={`column-${ci}`}
                      className="p-3 rounded-lg space-y-2 mb-2"
                      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="Titre de la colonne"
                          value={col.title}
                          onChange={(e) => {
                            const cols = [...(settings.footer.columns || [])];
                            cols[ci] = { ...cols[ci], title: e.target.value };
                            updateFooter({ columns: cols });
                          }}
                          className="font-medium"
                        />
                        <button
                          onClick={() => {
                            if (!confirm(`Supprimer la colonne « ${col.title} » ?`)) return;
                            updateFooter({ columns: (settings.footer.columns || []).filter((_, i) => i !== ci) });
                          }}
                          className="ml-1 p-1 rounded hover:bg-[#FEF2F2]"
                          style={{ color: 'var(--admin-text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {col.links.map((link, li) => (
                        <div key={li} className="flex items-center gap-1">
                          <Input
                            placeholder="Libellé"
                            value={link.label}
                            onChange={(e) => {
                              const cols = [...(settings.footer.columns || [])];
                              const links = [...cols[ci].links];
                              links[li] = { ...links[li], label: e.target.value };
                              cols[ci] = { ...cols[ci], links };
                              updateFooter({ columns: cols });
                            }}
                          />
                          <Input
                            placeholder="/url"
                            value={link.href}
                            onChange={(e) => {
                              const cols = [...(settings.footer.columns || [])];
                              const links = [...cols[ci].links];
                              links[li] = { ...links[li], href: e.target.value };
                              cols[ci] = { ...cols[ci], links };
                              updateFooter({ columns: cols });
                            }}
                            className="font-mono text-xs"
                          />
                          <button
                            onClick={() => {
                              const cols = [...(settings.footer.columns || [])];
                              cols[ci] = { ...cols[ci], links: cols[ci].links.filter((_, i) => i !== li) };
                              updateFooter({ columns: cols });
                            }}
                            className="p-1 rounded hover:bg-[#FEF2F2]"
                            style={{ color: 'var(--admin-text-muted)' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => {
                          const cols = [...(settings.footer.columns || [])];
                          cols[ci] = { ...cols[ci], links: [...cols[ci].links, { label: 'Nouveau lien', href: '/' }] };
                          updateFooter({ columns: cols });
                        }}
                      >
                        Ajouter un lien
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      updateFooter({
                        columns: [
                          ...(settings.footer.columns || []),
                          { title: 'Nouvelle colonne', links: [{ label: 'Lien', href: '/' }] },
                        ],
                      });
                    }}
                  >
                    Ajouter une colonne
                  </Button>
                </div>

                <div data-field-id="copyright">
                  <Label>Texte de copyright</Label>
                  <Input
                    value={settings.footer.copyright || ''}
                    onChange={(e) => updateFooter({ copyright: e.target.value })}
                    placeholder={`© ${new Date().getFullYear()} ${settings.brand.name}. Tous droits réservés.`}
                  />
                  <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>
                    Laisse vide pour utiliser le texte par défaut (avec l’année courante).
                  </p>
                </div>
              </div>
            )}

            {!isFixedSection(activeSection, sectionMeta) && (
              <CustomSectionEditor
                sectionId={activeSection}
                settings={settings}
                setSettings={setSettings}
              />
            )}
              </div>
            </>
          )}
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

/* ============================================================ */
/*  SectionStyleEditor : bg color + text color + padding        */
/* ============================================================ */
function SectionStyleEditor({
  sectionKey,
  settings,
  setSettings,
  defaultBg = '#ffffff',
}: {
  sectionKey: string;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  defaultBg?: string;
}) {
  const style = settings.sectionStyles?.[sectionKey] || {};

  const update = (patch: Partial<typeof style>) => {
    setSettings({
      ...settings,
      sectionStyles: {
        ...(settings.sectionStyles || {}),
        [sectionKey]: { ...style, ...patch },
      },
    });
  };

  return (
    <details
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
    >
      <summary
        className="cursor-pointer px-3 py-2 text-xs font-medium flex items-center justify-between"
        style={{ color: 'var(--admin-text)' }}
      >
        <span className="flex items-center gap-1.5">
          <Palette size={12} />
          Style de la section
        </span>
        <ChevronDown size={12} />
      </summary>
      <div className="p-3 space-y-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
        <ColorField
          label="Couleur de fond"
          value={style.bgColor || defaultBg}
          onChange={(v) => update({ bgColor: v })}
        />
        <ColorField
          label="Couleur du texte"
          value={style.textColor || '#171717'}
          onChange={(v) => update({ textColor: v })}
        />
        <div>
          <Label>Espacement vertical</Label>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
            {(['compact', 'normal', 'spacious'] as const).map((p) => {
              const isActive = (style.padding || 'normal') === p;
              const label = p === 'compact' ? 'Compact' : p === 'normal' ? 'Normal' : 'Aéré';
              return (
                <button
                  key={p}
                  onClick={() => update({ padding: p })}
                  className="flex-1 text-xs py-1.5 rounded transition"
                  style={{
                    background: isActive ? 'var(--admin-surface)' : 'transparent',
                    color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                    boxShadow: isActive ? 'var(--shadow-xs)' : undefined,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label>Transition vers la section suivante</Label>
          <select
            value={style.transition || (style.gradientToNext ? 'gradient' : style.divider) || 'none'}
            onChange={(e) =>
              update({ transition: e.target.value as typeof style.transition, gradientToNext: false, divider: 'none' })
            }
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border-strong)',
              color: 'var(--admin-text)',
            }}
          >
            <option value="none">Aucune (transition nette)</option>
            <option value="gradient">Dégradé doux</option>
            <option value="wave">Vague</option>
            <option value="slant">Diagonale</option>
            <option value="curve">Courbe</option>
            <option value="arrow">Flèche</option>
          </select>
          <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>
            Une seule transition à la fois pour un rendu propre.
          </p>
        </div>

        <div>
          <Label>Largeur du contenu</Label>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
            {(['boxed', 'full'] as const).map((w) => {
              const isActive = (style.width || 'boxed') === w;
              const label = w === 'boxed' ? 'Cadré' : 'Pleine largeur';
              return (
                <button
                  key={w}
                  onClick={() => update({ width: w })}
                  className="flex-1 text-xs py-1.5 rounded transition"
                  style={{
                    background: isActive ? 'var(--admin-surface)' : 'transparent',
                    color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                    boxShadow: isActive ? 'var(--shadow-xs)' : undefined,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Alignement du texte</Label>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
            {(['left', 'center'] as const).map((a) => {
              const isActive = (style.align || 'left') === a;
              const label = a === 'left' ? 'Gauche' : 'Centré';
              return (
                <button
                  key={a}
                  onClick={() => update({ align: a })}
                  className="flex-1 text-xs py-1.5 rounded transition"
                  style={{
                    background: isActive ? 'var(--admin-surface)' : 'transparent',
                    color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                    boxShadow: isActive ? 'var(--shadow-xs)' : undefined,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <ToggleField
          label="Coins arrondis"
          value={!!style.rounded}
          onChange={(v) => update({ rounded: v })}
        />

        {(style.bgColor || style.textColor || style.padding || style.transition || style.gradientToNext || style.width || style.align || style.divider || style.rounded) && (
          <button
            onClick={() =>
              setSettings({
                ...settings,
                sectionStyles: {
                  ...(settings.sectionStyles || {}),
                  [sectionKey]: {},
                },
              })
            }
            className="text-[11px] underline"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            Réinitialiser au style par défaut
          </button>
        )}
      </div>
    </details>
  );
}

/* ============================================================ */
/*  CustomSectionEditor : éditeur pour les blocs additionnels   */
/* ============================================================ */
function CustomSectionEditor({
  sectionId,
  settings,
  setSettings,
}: {
  sectionId: string;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
}) {
  const sectionIdx = (settings.homeLayout?.sections || []).findIndex((s) => s.id === sectionId);
  const section = sectionIdx >= 0 ? settings.homeLayout!.sections[sectionIdx] : null;
  if (!section) return <p className="text-sm text-gray-500">Section introuvable.</p>;

  const update = (patch: Partial<NonNullable<HomeSection['custom']>>) => {
    const sections = [...(settings.homeLayout?.sections || [])];
    sections[sectionIdx] = {
      ...section,
      custom: { ...(section.custom || {}), ...patch },
    };
    setSettings({ ...settings, homeLayout: { sections } });
  };

  const c = section.custom || {};

  return (
    <div className="space-y-3">
      {/* ImageText */}
      {section.type === 'imageText' && (
        <>
          <div data-field-id="title">
            <Label>Titre</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="body">
            <Label>Texte</Label>
            <Textarea rows={4} value={c.body || ''} onChange={(e) => update({ body: e.target.value })} />
          </div>
          <div data-field-id="imageUrl">
            <ImageUpload label="Image" value={c.imageUrl || ''} onChange={(url) => update({ imageUrl: url })} folder="blocks" aspectRatio="wide" />
          </div>
          <div>
            <Label>Position de l’image</Label>
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--admin-hover)' }}>
              {(['left', 'right'] as const).map((p) => {
                const active = (c.layout || 'left') === p;
                return (
                  <button key={p} onClick={() => update({ layout: p })} className="flex-1 text-xs py-1.5 rounded transition"
                    style={{ background: active ? 'var(--admin-surface)' : 'transparent', color: active ? 'var(--admin-text)' : 'var(--admin-text-muted)' }}>
                    {p === 'left' ? 'Gauche' : 'Droite'}
                  </button>
                );
              })}
            </div>
          </div>
          <div data-field-id="ctaLabel">
            <Label>Texte du bouton (optionnel)</Label>
            <Input value={c.ctaLabel || ''} onChange={(e) => update({ ctaLabel: e.target.value })} />
          </div>
          <div>
            <Label>Lien du bouton</Label>
            <Input value={c.ctaLink || ''} onChange={(e) => update({ ctaLink: e.target.value })} />
          </div>
        </>
      )}

      {/* Banner */}
      {section.type === 'banner' && (
        <>
          <div data-field-id="title">
            <Label>Titre</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="subtitle">
            <Label>Sous-titre</Label>
            <Textarea rows={2} value={c.subtitle || ''} onChange={(e) => update({ subtitle: e.target.value })} />
          </div>
          <div data-field-id="imageUrl">
            <ImageUpload label="Image de fond (optionnel)" value={c.imageUrl || ''} onChange={(url) => update({ imageUrl: url })} folder="blocks" aspectRatio="wide" />
          </div>
          <div data-field-id="ctaLabel">
            <Label>Texte du bouton</Label>
            <Input value={c.ctaLabel || ''} onChange={(e) => update({ ctaLabel: e.target.value })} />
          </div>
          <div>
            <Label>Lien du bouton</Label>
            <Input value={c.ctaLink || ''} onChange={(e) => update({ ctaLink: e.target.value })} />
          </div>
        </>
      )}

      {/* Text */}
      {section.type === 'text' && (
        <>
          <div data-field-id="title">
            <Label>Titre (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="body">
            <Label>Contenu</Label>
            <Textarea rows={6} value={c.body || ''} onChange={(e) => update({ body: e.target.value })} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>Les retours à la ligne sont conservés.</p>
          </div>
        </>
      )}

      {/* Quote */}
      {section.type === 'quote' && (
        <>
          <div data-field-id="quote">
            <Label>Citation</Label>
            <Textarea rows={3} value={c.quote || ''} onChange={(e) => update({ quote: e.target.value })} />
          </div>
          <div data-field-id="author">
            <Label>Auteur</Label>
            <Input value={c.author || ''} onChange={(e) => update({ author: e.target.value })} placeholder="Marie L., cliente" />
          </div>
        </>
      )}

      {/* FAQ */}
      {section.type === 'faq' && (
        <>
          <div data-field-id="title">
            <Label>Titre de la section (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} placeholder="Questions fréquentes" />
          </div>
          <div data-field-id="faqItems" className="space-y-2">
            <Label>Questions</Label>
            {(c.faqItems || []).map((item, i) => (
              <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--admin-text-muted)' }}>Question {i + 1}</span>
                  <button
                    onClick={() => {
                      const items = [...(c.faqItems || [])].filter((_, idx) => idx !== i);
                      update({ faqItems: items });
                    }}
                    className="p-1 rounded hover:bg-[#FEF2F2]"
                    style={{ color: 'var(--admin-text-muted)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <Input placeholder="Question" value={item.question} onChange={(e) => {
                  const items = [...(c.faqItems || [])];
                  items[i] = { ...items[i], question: e.target.value };
                  update({ faqItems: items });
                }} />
                <Textarea placeholder="Réponse" rows={2} value={item.answer} onChange={(e) => {
                  const items = [...(c.faqItems || [])];
                  items[i] = { ...items[i], answer: e.target.value };
                  update({ faqItems: items });
                }} />
              </div>
            ))}
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => {
              const items = [...(c.faqItems || []), { question: 'Nouvelle question ?', answer: 'La réponse.' }];
              update({ faqItems: items });
            }}>
              Ajouter une question
            </Button>
          </div>
        </>
      )}

      {/* Video */}
      {section.type === 'video' && (
        <>
          <div data-field-id="title">
            <Label>Titre (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="videoUrl">
            <Label>URL YouTube ou Vimeo</Label>
            <Input value={c.videoUrl || ''} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
            <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>L’ID de la vidéo est extrait automatiquement.</p>
          </div>
        </>
      )}

      {/* Stats */}
      {section.type === 'stats' && (
        <>
          <div data-field-id="title">
            <Label>Titre (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="statsItems" className="space-y-2">
            <Label>Chiffres clés</Label>
            {(c.statsItems || []).map((item, i) => (
              <div key={i} className="p-3 rounded-lg space-y-2 grid grid-cols-[1fr_2fr_auto] gap-2 items-center" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <Input placeholder="10k+" value={item.value} onChange={(e) => {
                  const items = [...(c.statsItems || [])];
                  items[i] = { ...items[i], value: e.target.value };
                  update({ statsItems: items });
                }} />
                <Input placeholder="Clientes" value={item.label} onChange={(e) => {
                  const items = [...(c.statsItems || [])];
                  items[i] = { ...items[i], label: e.target.value };
                  update({ statsItems: items });
                }} />
                <button onClick={() => {
                  const items = [...(c.statsItems || [])].filter((_, idx) => idx !== i);
                  update({ statsItems: items });
                }} className="p-1 rounded hover:bg-[#FEF2F2]" style={{ color: 'var(--admin-text-muted)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => {
              const items = [...(c.statsItems || []), { value: '100', label: 'Indicateur' }];
              update({ statsItems: items });
            }}>
              Ajouter un chiffre
            </Button>
          </div>
        </>
      )}

      {/* CTA */}
      {section.type === 'cta' && (
        <>
          <div data-field-id="title">
            <Label>Titre</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="subtitle">
            <Label>Sous-titre (optionnel)</Label>
            <Textarea rows={2} value={c.subtitle || ''} onChange={(e) => update({ subtitle: e.target.value })} />
          </div>
          <div data-field-id="ctaLabel">
            <Label>Texte du bouton</Label>
            <Input value={c.ctaLabel || ''} onChange={(e) => update({ ctaLabel: e.target.value })} placeholder="Nous contacter" />
          </div>
          <div>
            <Label>Lien du bouton</Label>
            <Input value={c.ctaLink || ''} onChange={(e) => update({ ctaLink: e.target.value })} placeholder="/contact" />
          </div>
        </>
      )}

      {/* Logos */}
      {section.type === 'logos' && (
        <>
          <div data-field-id="title">
            <Label>Titre (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} placeholder="Ils nous font confiance" />
          </div>
          <div data-field-id="logos" className="space-y-2">
            <Label>Logos</Label>
            <div className="grid grid-cols-2 gap-2">
              {(c.logos || []).map((logo, i) => (
                <div key={i} className="relative">
                  <ImageUpload value={logo} folder="logos" aspectRatio="wide" onChange={(url) => {
                    const logos = [...(c.logos || [])];
                    logos[i] = url;
                    update({ logos });
                  }} />
                  <button onClick={() => {
                    const logos = [...(c.logos || [])].filter((_, idx) => idx !== i);
                    update({ logos });
                  }} className="absolute top-1 right-1 p-1 rounded bg-white shadow" style={{ color: '#DC2626' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => {
              update({ logos: [...(c.logos || []), ''] });
            }}>
              Ajouter un logo
            </Button>
          </div>
        </>
      )}

      {/* Gallery */}
      {section.type === 'gallery' && (
        <>
          <div data-field-id="title">
            <Label>Titre (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div data-field-id="images" className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-2 gap-2">
              {(c.images || []).map((img, i) => (
                <div key={i} className="relative">
                  <ImageUpload value={img} folder="gallery" aspectRatio="square" onChange={(url) => {
                    const images = [...(c.images || [])];
                    images[i] = url;
                    update({ images });
                  }} />
                  <button onClick={() => {
                    const images = [...(c.images || [])].filter((_, idx) => idx !== i);
                    update({ images });
                  }} className="absolute top-1 right-1 p-1 rounded bg-white shadow" style={{ color: '#DC2626' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => {
              update({ images: [...(c.images || []), ''] });
            }}>
              Ajouter une photo
            </Button>
          </div>
        </>
      )}

      {/* Spacer */}
      {section.type === 'spacer' && (
        <div data-field-id="height">
          <Label>Hauteur de l’espace (pixels)</Label>
          <Input
            type="number"
            min={20}
            max={400}
            value={c.height || 80}
            onChange={(e) => update({ height: parseInt(e.target.value) || 80 })}
          />
        </div>
      )}

      {/* Columns3 */}
      {section.type === 'columns3' && (
        <>
          <div data-field-id="title">
            <Label>Titre (optionnel)</Label>
            <Input value={c.title || ''} onChange={(e) => update({ title: e.target.value })} placeholder="Comment ça marche" />
          </div>
          <div data-field-id="columnsItems" className="space-y-2">
            <Label>Les 3 colonnes</Label>
            {(c.columnsItems || []).slice(0, 3).map((item, i) => (
              <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <p className="text-[11px] font-medium" style={{ color: 'var(--admin-text-muted)' }}>Colonne {i + 1}</p>
                <Input placeholder="Titre" value={item.title} onChange={(e) => {
                  const items = [...(c.columnsItems || [])];
                  items[i] = { ...items[i], title: e.target.value };
                  update({ columnsItems: items });
                }} />
                <Textarea placeholder="Description" rows={2} value={item.description} onChange={(e) => {
                  const items = [...(c.columnsItems || [])];
                  items[i] = { ...items[i], description: e.target.value };
                  update({ columnsItems: items });
                }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Style universel pour toutes les sections custom */}
      <SectionStyleEditor sectionKey={section.id} settings={settings} setSettings={setSettings} />
    </div>
  );
}

/* ============================================================ */
/*  SectionsListView : Site + Page d'accueil (drag-drop)        */
/* ============================================================ */
const SITE_SECTIONS: SectionId[] = ['themes', 'brand', 'colors', 'typography', 'announcement', 'nav', 'footer'];

function customTypeIcon(type: HomeSectionType): typeof Layout {
  const map: Partial<Record<HomeSectionType, typeof Layout>> = {
    imageText: Images,
    banner: ImageIcon,
    gallery: Images,
    text: Type,
    quote: Megaphone,
    faq: BookOpen,
    video: Star,
    stats: Grid3x3,
    cta: Megaphone,
    logos: Square,
    spacer: Square,
    columns3: Grid3x3,
  };
  return map[type] || Square;
}

const homeTypeToSectionId: Record<HomeSectionType, SectionId> = {
  hero: 'hero',
  featured: 'featured',
  story: 'story',
  reasons: 'reasons',
  categories: 'categoriesTitle',
  trust: 'trust',
  newsletter: 'newsletter',
  imageText: 'hero',
  banner: 'hero',
  gallery: 'hero',
  text: 'hero',
  quote: 'hero',
  faq: 'hero',
  video: 'hero',
  stats: 'hero',
  cta: 'hero',
  logos: 'hero',
  spacer: 'hero',
  columns3: 'hero',
  promo: 'hero',
};

function SectionsListView({
  settings,
  setActiveSection,
  onUpdateLayout,
}: {
  settings: SiteSettings;
  setActiveSection: (id: ActiveSel) => void;
  onUpdateLayout: (sections: HomeSection[]) => void;
}) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const sections = settings.homeLayout?.sections || [];

  const toggleVisible = (i: number) => {
    const next = [...sections];
    next[i] = { ...next[i], visible: !next[i].visible };
    onUpdateLayout(next);
  };

  const remove = (i: number) => {
    if (!confirm(`Supprimer "${SECTION_TYPE_LABELS[sections[i].type]}" ?`)) return;
    onUpdateLayout(sections.filter((_, idx) => idx !== i));
  };

  const add = (type: HomeSectionType) => {
    const newSection: HomeSection = {
      id: `custom-${Date.now()}`,
      type,
      visible: true,
      custom: {
        title: `Nouveau ${SECTION_TYPE_LABELS[type]}`,
        body: 'Clique sur le texte dans la preview pour éditer.',
      },
    };
    onUpdateLayout([...sections, newSection]);
    setShowAdd(false);
  };

  const onDrop = (toIdx: number) => {
    if (draggedIdx === null || draggedIdx === toIdx) {
      setDraggedIdx(null);
      return;
    }
    const next = [...sections];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(toIdx, 0, moved);
    onUpdateLayout(next);
    setDraggedIdx(null);
  };

  return (
    <div className="flex-1 overflow-y-auto admin-scroll px-2 py-3">
      {/* SITE group */}
      <p className="px-2 mb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-faint)' }}>
        Site
      </p>
      {SITE_SECTIONS.map((id) => {
        const meta = sectionMeta[id];
        return (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition hover:bg-black/[0.03]"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            <meta.icon size={15} />
            <span className="flex-1 text-left">{meta.label}</span>
            <ChevronRight size={14} style={{ color: 'var(--admin-text-faint)' }} />
          </button>
        );
      })}

      {/* HOMEPAGE group (drag-drop) */}
      <p className="px-2 mt-5 mb-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--admin-text-faint)' }}>
        Page d’accueil
      </p>
      <div className="space-y-0.5">
        {sections.map((section, i) => {
          const isCustom = ADDABLE_SECTION_TYPES.includes(section.type);
          // Pour les sections custom on bascule sur l'ID unique, pour les core on bascule sur le SectionId mappé
          const targetSectionId: ActiveSel = isCustom ? section.id : homeTypeToSectionId[section.type];
          const meta = isCustom ? null : sectionMeta[targetSectionId as SectionId];
          const Icon = isCustom ? customTypeIcon(section.type) : (meta?.icon || Square);
          const label = isCustom
            ? section.custom?.title || SECTION_TYPE_LABELS[section.type]
            : meta?.label || SECTION_TYPE_LABELS[section.type];
          const hidden = !section.visible;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => setDraggedIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onDragEnd={() => setDraggedIdx(null)}
              className="group flex items-center gap-1 px-1.5 py-1.5 rounded-md transition hover:bg-black/[0.03]"
              style={{
                opacity: draggedIdx === i ? 0.3 : hidden ? 0.45 : 1,
                background: draggedIdx === i ? 'var(--admin-hover)' : undefined,
              }}
            >
              <GripVertical
                size={12}
                style={{ color: 'var(--admin-text-faint)', cursor: 'grab' }}
              />
              <button
                onClick={() => setActiveSection(targetSectionId)}
                className="flex-1 flex items-center gap-2 text-left text-sm"
                style={{ color: 'var(--admin-text-muted)' }}
              >
                <Icon size={14} />
                <span className="flex-1 truncate">{label}</span>
              </button>
              <button
                onClick={() => toggleVisible(i)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/[0.05] transition"
                style={{ color: 'var(--admin-text-muted)' }}
                title={hidden ? 'Afficher' : 'Masquer'}
              >
                {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              {isCustom && (
                <button
                  onClick={() => remove(i)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#FEF2F2] transition"
                  style={{ color: 'var(--admin-text-muted)' }}
                  title="Supprimer"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add section */}
      <div className="px-2 mt-2 relative">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full flex items-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-md transition hover:bg-black/[0.04]"
          style={{ color: 'var(--brand-blue)' }}
        >
          <Plus size={13} />
          Ajouter une section
        </button>
        {showAdd && (
          <div
            className="absolute left-2 right-2 mt-1 rounded-lg p-1 z-10"
            style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              boxShadow: 'var(--shadow-pop)',
            }}
          >
            {ADDABLE_SECTION_TYPES.map((type) => {
              const icon = type === 'imageText' ? Images : type === 'banner' ? Square : Grid3x3;
              const Icon = icon;
              return (
                <button
                  key={type}
                  onClick={() => add(type)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover:bg-black/[0.04]"
                  style={{ color: 'var(--admin-text)' }}
                >
                  <Icon size={14} />
                  {SECTION_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*  NavMenuEditor : drag-drop + hide + delete + create page    */
/* ============================================================ */
type NavSubLink = { label: string; href: string; children?: NavSubLink[] };
type NavLink = {
  label: string;
  href: string;
  visible?: boolean;
  children?: NavSubLink[];
  childrenSource?: 'manual' | 'categories';
};

function NavMenuEditor({
  links,
  onChange,
}: {
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
}) {
  const categories = useNavCategories();
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<NavLink>) => {
    const next = [...links];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const toggle = (i: number) => update(i, { visible: links[i].visible === false ? true : false });

  const remove = (i: number) => {
    if (!confirm(`Supprimer "${links[i].label}" du menu ?`)) return;
    onChange(links.filter((_, idx) => idx !== i));
  };

  const add = () => {
    onChange([...links, { label: 'Nouveau lien', href: '/', visible: true }]);
  };

  const addChild = (i: number) => {
    const current = links[i].children ?? [];
    update(i, { children: [...current, { label: 'Sous-lien', href: '/' }] });
    setExpandedIdx(i);
  };

  const updateChild = (i: number, ci: number, patch: Partial<NavSubLink>) => {
    const current = [...(links[i].children ?? [])];
    current[ci] = { ...current[ci], ...patch };
    update(i, { children: current });
  };

  const removeChild = (i: number, ci: number) => {
    const current = [...(links[i].children ?? [])];
    current.splice(ci, 1);
    update(i, { children: current });
  };

  const handleDragStart = (i: number) => setDraggedIdx(i);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (toIdx: number) => {
    if (draggedIdx === null || draggedIdx === toIdx) {
      setDraggedIdx(null);
      return;
    }
    const next = [...links];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
    setDraggedIdx(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
        Glisse-dépose pour réorganiser. Œil = masquer/afficher. Poubelle = supprimer.
      </p>
      <div className="space-y-1.5">
        {links.map((link, i) => {
          const hidden = link.visible === false;
          return (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => setDraggedIdx(null)}
              className="rounded-lg overflow-hidden transition"
              style={{
                background: 'var(--admin-bg)',
                border: '1px solid var(--admin-border)',
                opacity: draggedIdx === i ? 0.4 : hidden ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-1 px-2 py-1.5" style={{ background: 'var(--admin-hover)' }}>
                <GripVertical
                  size={13}
                  style={{ color: 'var(--admin-text-faint)', cursor: 'grab' }}
                />
                <span
                  className="text-xs font-medium flex-1 truncate"
                  style={{ color: 'var(--admin-text)' }}
                >
                  {link.label || 'Sans titre'}
                </span>
                <button
                  onClick={() => toggle(i)}
                  className="p-1 rounded hover:bg-black/[0.04]"
                  style={{ color: 'var(--admin-text-muted)' }}
                  title={hidden ? 'Afficher' : 'Masquer'}
                >
                  {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  onClick={() => remove(i)}
                  className="p-1 rounded hover:bg-[#FEF2F2]"
                  style={{ color: 'var(--admin-text-muted)' }}
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-2.5 space-y-1.5">
                <Input
                  placeholder="Libellé"
                  value={link.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                />
                <Input
                  placeholder="/shop ou /a-propos"
                  value={link.href}
                  onChange={(e) => update(i, { href: e.target.value })}
                />

                {/* Sous-liens */}
                <div
                  className="mt-2 rounded-md"
                  style={{ background: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5"
                  >
                    <span
                      className="text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: 'var(--admin-text-muted)' }}
                    >
                      Sous-liens ({link.children?.length ?? 0})
                    </span>
                    <ChevronDown
                      size={12}
                      style={{
                        color: 'var(--admin-text-faint)',
                        transform: expandedIdx === i ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>
                  {expandedIdx === i && (
                    <div className="px-2.5 pb-2.5 space-y-2">
                      {/* Source selector : Manuel vs Catégories auto */}
                      <div className="flex gap-1 p-0.5 rounded" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                        {([
                          { v: 'manual', l: 'Manuel' },
                          { v: 'categories', l: 'Catégories auto' },
                        ] as const).map((opt) => {
                          const current = link.childrenSource ?? 'manual';
                          const active = current === opt.v;
                          return (
                            <button
                              key={opt.v}
                              type="button"
                              onClick={() => update(i, { childrenSource: opt.v })}
                              className="flex-1 px-2 py-1.5 rounded text-[10px] uppercase tracking-[0.18em] transition"
                              style={{
                                background: active ? 'var(--brand-blue)' : 'transparent',
                                color: active ? 'white' : 'var(--admin-text-muted)',
                              }}
                            >
                              {opt.l}
                            </button>
                          );
                        })}
                      </div>

                      {(link.childrenSource ?? 'manual') === 'categories' ? (
                        <div className="p-2 rounded" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                          <p
                            className="text-[10px] uppercase tracking-[0.18em] mb-2"
                            style={{ color: 'var(--admin-text-faint)' }}
                          >
                            Rempli automatiquement depuis tes catégories Supabase
                          </p>
                          {categories.length === 0 ? (
                            <p className="text-[11px]" style={{ color: 'var(--admin-text-muted)' }}>
                              Aucune catégorie pour l&apos;instant — ajoute-les dans Admin → Produits.
                            </p>
                          ) : (
                            <ul className="space-y-1">
                              {categories.map((c) => (
                                <li
                                  key={c.id}
                                  className="text-[12px] flex items-center justify-between"
                                  style={{ color: 'var(--admin-text)' }}
                                >
                                  <span>{c.name}</span>
                                  <span
                                    className="text-[10px] opacity-60"
                                    style={{ fontFamily: 'monospace' }}
                                  >
                                    /shop?category={c.slug}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <>
                          {(link.children ?? []).map((child, ci) => (
                            <SubLinkEditor
                              key={ci}
                              index={ci}
                              child={child}
                              onChange={(patch) => updateChild(i, ci, patch)}
                              onRemove={() => removeChild(i, ci)}
                            />
                          ))}
                          <Button variant="ghost" size="sm" icon={Plus} onClick={() => addChild(i)}>
                            Ajouter un sous-lien
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Button variant="secondary" size="sm" icon={Plus} onClick={add}>
          Ajouter un lien
        </Button>
        <Button variant="ghost" size="sm" icon={Plus} href="/admin/pages/new">
          Créer une nouvelle page
        </Button>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  SubLinkEditor : sous-lien + son propre niveau imbriqué      */
/* ============================================================ */
function SubLinkEditor({
  index,
  child,
  onChange,
  onRemove,
}: {
  index: number;
  child: NavSubLink;
  onChange: (patch: Partial<NavSubLink>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const grandchildren = child.children ?? [];

  const addGc = () =>
    onChange({ children: [...grandchildren, { label: 'Élément', href: '/' }] });
  const updateGc = (gi: number, patch: Partial<NavSubLink>) => {
    const next = [...grandchildren];
    next[gi] = { ...next[gi], ...patch };
    onChange({ children: next });
  };
  const removeGc = (gi: number) => {
    onChange({ children: grandchildren.filter((_, idx) => idx !== gi) });
  };

  return (
    <div
      className="space-y-1.5 p-2 rounded"
      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: 'var(--admin-text-faint)' }}
        >
          Sous-lien {index + 1}
        </span>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-[#FEF2F2]"
          style={{ color: 'var(--admin-text-muted)' }}
          title="Supprimer ce sous-lien"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <Input
        placeholder="Libellé (ex. Colliers)"
        value={child.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />
      <Input
        placeholder="/shop?category=colliers"
        value={child.href}
        onChange={(e) => onChange({ href: e.target.value })}
      />

      {/* Sous-niveau imbriqué */}
      <div
        className="rounded-md"
        style={{ background: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-2.5 py-1.5"
        >
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            Sous-niveau ({grandchildren.length})
          </span>
          <ChevronDown
            size={12}
            style={{
              color: 'var(--admin-text-faint)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
        {expanded && (
          <div className="px-2.5 pb-2.5 space-y-2">
            {grandchildren.map((g, gi) => (
              <div
                key={gi}
                className="space-y-1 p-2 rounded"
                style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[10px] uppercase tracking-[0.14em]"
                    style={{ color: 'var(--admin-text-faint)' }}
                  >
                    Élément {gi + 1}
                  </span>
                  <button
                    onClick={() => removeGc(gi)}
                    className="p-1 rounded hover:bg-[#FEF2F2]"
                    style={{ color: 'var(--admin-text-muted)' }}
                    title="Supprimer cet élément"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
                <Input
                  placeholder="Libellé"
                  value={g.label}
                  onChange={(e) => updateGc(gi, { label: e.target.value })}
                />
                <Input
                  placeholder="/shop?category=…"
                  value={g.href}
                  onChange={(e) => updateGc(gi, { href: e.target.value })}
                />
              </div>
            ))}
            <Button variant="ghost" size="sm" icon={Plus} onClick={addGc}>
              Ajouter un élément
            </Button>
          </div>
        )}
      </div>
    </div>
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

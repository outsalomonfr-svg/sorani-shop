'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { imagePositionStyle } from '@/lib/image-position';
import { ArrowRight, Sparkles, Truck, Shield, Droplets, Star } from 'lucide-react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import type { HomeSection, SiteSettings } from '@/types/site-settings';
import type { HomeProduct, HomeCategory } from '@/lib/home-data';
import QuickAddButton from '@/components/product/QuickAddButton';
import CountUp from '@/components/animations/CountUp';
import HeroCarousel from './HeroCarousel';

function resolveTransition(s: { transition?: string; gradientToNext?: boolean; divider?: string } | undefined) {
  if (!s) return 'none' as const;
  if (s.transition && s.transition !== 'none') return s.transition;
  if (s.gradientToNext) return 'gradient' as const;
  if (s.divider && s.divider !== 'none') return s.divider as 'wave' | 'slant' | 'curve' | 'arrow';
  return 'none' as const;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return [r, g, b];
}

function mixColor(from: string, to: string, t: number): string {
  // accepte hex et rgb(a)
  const parseAny = (c: string): [number, number, number, number] => {
    if (c.startsWith('rgb')) {
      const m = c.match(/[\d.]+/g);
      if (m) {
        return [parseFloat(m[0]) || 0, parseFloat(m[1]) || 0, parseFloat(m[2]) || 0, m[3] ? parseFloat(m[3]) : 1];
      }
    }
    const [r, g, b] = hexToRgb(c);
    return [r, g, b, 1];
  };
  const a = parseAny(from);
  const b = parseAny(to);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  const alpha = a[3] + (b[3] - a[3]) * t;
  return alpha < 1 ? `rgba(${r}, ${g}, ${bl}, ${alpha.toFixed(2)})` : `rgb(${r}, ${g}, ${bl})`;
}

function smoothGradient(from: string, to: string): string {
  // Interpolation OKLAB = espace perceptuel uniforme (pas de marron/gris au milieu).
  // Le contenu garde du blanc sur ~25% en haut, puis fondu naturel jusqu'en bas.
  // Le 95% évite un "stop" net contre la section suivante.
  return `linear-gradient(in oklab to bottom, ${from} 0%, ${from} 28%, ${to} 95%)`;
}

function resolveSectionStyle(
  settings: SiteSettings,
  key: string,
  nextBg: string | undefined,
  defaults: { bg?: string; text?: string } = {}
) {
  const s = settings.sectionStyles?.[key] || {};
  const padding =
    s.padding === 'compact' ? '40px 0' : s.padding === 'spacious' ? '120px 0' : '80px 0';
  const bg = s.bgColor || defaults.bg || '#ffffff';
  const transition = resolveTransition(s);
  const background =
    transition === 'gradient' && nextBg
      ? smoothGradient(bg, nextBg)
      : bg;
  return {
    background,
    color: s.textColor || defaults.text,
    padding,
    textAlign: (s.align || 'left') as 'left' | 'center',
    borderRadius: s.rounded ? 24 : undefined,
    overflow: s.rounded ? 'hidden' : undefined,
    margin: s.rounded ? '12px' : undefined,
  };
}

function containerWidthClass(settings: SiteSettings, key: string): string {
  const s = settings.sectionStyles?.[key];
  return s?.width === 'full' ? 'w-full px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
}

function getNextBg(settings: SiteSettings, currentIdx: number): string | undefined {
  const sections = settings.homeLayout?.sections || [];
  for (let i = currentIdx + 1; i < sections.length; i++) {
    if (!sections[i].visible) continue;
    const key = sectionKeyForType(sections[i].type, settings);
    const s = settings.sectionStyles?.[key];
    if (s?.bgColor) return s.bgColor;
    return defaultBgForType(sections[i].type, settings);
  }
  return undefined;
}

function getPrevBg(settings: SiteSettings, currentIdx: number): string | undefined {
  const sections = settings.homeLayout?.sections || [];
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (!sections[i].visible) continue;
    const key = sectionKeyForType(sections[i].type, settings);
    const s = settings.sectionStyles?.[key];
    if (s?.bgColor) return s.bgColor;
    return defaultBgForType(sections[i].type, settings);
  }
  return undefined;
}

function sectionKeyForType(type: string, _s: SiteSettings): string {
  const map: Record<string, string> = {
    hero: 'hero',
    featured: 'featured',
    story: 'story',
    reasons: 'reasons',
    categories: 'categories',
    trust: 'trust',
    newsletter: 'newsletter',
  };
  return map[type] || type;
}

function defaultBgForType(type: string, settings: SiteSettings): string {
  switch (type) {
    case 'hero': return settings.colors.primary;
    case 'story': return settings.colors.primary;
    case 'newsletter': return settings.colors.primary;
    case 'categories': return '#f9fafb';
    default: return '#ffffff';
  }
}

function SectionDivider({ shape, color }: { shape?: string; color: string }) {
  if (!shape || shape === 'none') return null;
  const common = { display: 'block', width: '100%', height: '60px', fill: color } as React.CSSProperties;
  switch (shape) {
    case 'wave':
      return (
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={common} aria-hidden>
          <path d="M0,30 C360,60 720,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      );
    case 'slant':
      return (
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={common} aria-hidden>
          <path d="M0,0 L1440,60 L0,60 Z" />
        </svg>
      );
    case 'curve':
      return (
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={common} aria-hidden>
          <path d="M0,60 Q720,0 1440,60 Z" />
        </svg>
      );
    case 'arrow':
      return (
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={common} aria-hidden>
          <path d="M0,0 L720,60 L1440,0 L1440,60 L0,60 Z" />
        </svg>
      );
    default:
      return null;
  }
}

const trustIcons = { Sparkles, Droplets, Truck, Shield };

export default function HomePageClient({
  featuredProducts,
  categories,
}: {
  featuredProducts: HomeProduct[];
  categories: HomeCategory[];
}) {
  const settings = useSiteSettings();
  const sections = (settings.homeLayout?.sections || []).filter((s) => s.visible);

  // Scroll reveal via Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections.length]);

  return (
    <div>
      {sections.map((section) => {
        const allSections = settings.homeLayout?.sections || [];
        const idxInAll = allSections.findIndex((s) => s.id === section.id);
        const nextBg = getNextBg(settings, idxInAll);
        const key = sectionKeyForType(section.type, settings);
        const sStyle = settings.sectionStyles?.[key];
        const transition = resolveTransition(sStyle);
        const isShape = ['wave', 'slant', 'curve', 'arrow'].includes(transition);
        return (
          <div key={section.id} data-reveal>
            <SectionRenderer section={section} settings={settings} idx={idxInAll} featuredProducts={featuredProducts} categories={categories} />
            {isShape && nextBg && (
              <div style={{ background: sStyle?.bgColor || defaultBgForType(section.type, settings), marginTop: -1 }}>
                <SectionDivider shape={transition} color={nextBg} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionRenderer({ section, settings, idx, featuredProducts, categories }: { section: HomeSection; settings: SiteSettings; idx: number; featuredProducts: HomeProduct[]; categories: HomeCategory[] }) {
  switch (section.type) {
    case 'hero':       return <HeroSection settings={settings} idx={idx} />;
    case 'featured':   return <FeaturedSection settings={settings} idx={idx} products={featuredProducts} />;
    case 'story':      return <StorySection settings={settings} idx={idx} />;
    case 'reasons':    return <ReasonsSection settings={settings} idx={idx} />;
    case 'categories': return <CategoriesSection settings={settings} idx={idx} categories={categories} />;
    case 'trust':      return <TrustSection settings={settings} idx={idx} />;
    case 'newsletter': return <NewsletterSection settings={settings} idx={idx} />;
    case 'imageText':  return <ImageTextSection section={section} settings={settings} idx={idx} />;
    case 'banner':     return <BannerSection section={section} settings={settings} idx={idx} />;
    case 'gallery':    return <GallerySection section={section} settings={settings} idx={idx} />;
    case 'text':       return <TextBlockSection section={section} settings={settings} idx={idx} />;
    case 'quote':      return <QuoteSection section={section} settings={settings} idx={idx} />;
    case 'faq':        return <FaqSection section={section} settings={settings} idx={idx} />;
    case 'video':      return <VideoSection section={section} settings={settings} idx={idx} />;
    case 'stats':      return <StatsSection section={section} settings={settings} idx={idx} />;
    case 'cta':        return <CtaSection section={section} settings={settings} idx={idx} />;
    case 'logos':      return <LogosSection section={section} settings={settings} idx={idx} />;
    case 'spacer':     return <SpacerSection section={section} settings={settings} idx={idx} />;
    case 'columns3':   return <ColumnsSection section={section} settings={settings} idx={idx} />;
    default:           return null;
  }
}

/* ============================================================ */
function HeroSection({ settings, idx }: { settings: SiteSettings; idx: number }) {
  const heroImage = settings.hero.imageUrl || '/images/hero-1.png';
  const style = resolveSectionStyle(settings, 'hero', getNextBg(settings, idx), { bg: settings.colors.primary });

  // Mode carrousel : plusieurs slides qui défilent (sinon, image unique ci-dessous)
  const isCarousel = settings.hero.mode === 'carousel' && (settings.hero.slides?.some((s) => s.imageUrl) ?? false);
  if (isCarousel) {
    return <HeroCarousel settings={settings} bg={style.background as string} />;
  }

  return (
    <section
      className="relative h-[90vh] min-h-[600px] overflow-hidden"
      style={{ background: style.background }}
      data-sorani-edit="hero"
      data-sorani-field="imageUrl"
      data-sorani-label="Image du hero"
    >
      <Image
        src={heroImage}
        alt={settings.brand.name}
        fill
        sizes="100vw"
        className="object-cover animate-scale-in"
        style={imagePositionStyle(settings.hero.imagePosition)}
        priority
      />
      {settings.hero.overlayEnabled && (() => {
        const color = settings.hero.overlayColor || '#1B4965';
        const alpha = Math.max(0, Math.min(100, settings.hero.overlayOpacity ?? 50)) / 100;
        const rgba = (() => {
          const h = color.replace('#', '');
          const r = parseInt(h.slice(0, 2), 16);
          const g = parseInt(h.slice(2, 4), 16);
          const b = parseInt(h.slice(4, 6), 16);
          return (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
        })();
        const dir = settings.hero.overlayDirection || 'horizontal';
        let bg = rgba(alpha);
        if (dir === 'horizontal') {
          bg = `linear-gradient(to right, ${rgba(alpha)}, ${rgba(alpha * 0.5)}, ${rgba(0)})`;
        } else if (dir === 'vertical') {
          bg = `linear-gradient(to bottom, ${rgba(0)}, ${rgba(alpha * 0.4)}, ${rgba(alpha)})`;
        }
        return <div className="absolute inset-0 pointer-events-none" style={{ background: bg }} />;
      })()}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <p className="text-[12px] uppercase tracking-[0.4em] mb-6 text-white/80 animate-fade-in-up">
              {settings.brand.name}
            </p>
            <h1
              className="text-5xl md:text-7xl leading-[1.05] text-white animate-fade-in-up-delay"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}
              data-sorani-edit="hero" data-sorani-field="title" data-sorani-label="Titre du hero"
            >
              {settings.hero.title}
            </h1>
            <div className="w-12 h-px bg-white/60 mt-8 mb-8 animate-fade-in-up-delay-2" />
            <p
              className="text-lg md:text-xl text-white/90 max-w-lg leading-relaxed animate-fade-in-up-delay-2"
              data-sorani-edit="hero" data-sorani-field="subtitle" data-sorani-label="Sous-titre du hero"
            >
              {settings.hero.subtitle}
            </p>
            <div className="mt-10 animate-fade-in-up-delay-2">
              <Link
                href={settings.hero.ctaLink}
                className="cta-magnetic inline-flex items-center gap-3 bg-white text-[13px] uppercase tracking-[0.25em] px-10 py-4 transition-all hover:opacity-85"
                style={{ color: 'var(--brand-blue)' }}
                data-sorani-edit="hero" data-sorani-field="ctaLabel" data-sorani-label="Bouton du hero"
              >
                {settings.hero.ctaLabel}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ settings, idx, products }: { settings: SiteSettings; idx: number; products: HomeProduct[] }) {
  const style = resolveSectionStyle(settings, 'featured', getNextBg(settings, idx), { bg: '#ffffff' });
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-[0.32em] mb-4 opacity-60" style={{ color: 'inherit' }}>
            Notre sélection
          </p>
          <h2
            className="text-3xl md:text-5xl mb-4"
            style={{ color: 'var(--brand-blue)', fontFamily: 'var(--font-heading)' }}
            data-sorani-edit="featured" data-sorani-field="title" data-sorani-label="Titre — Coups de cœur"
          >
            {settings.featuredTitle}
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
            style={{ color: 'inherit' }}
          >
            Voir toute la collection
            <ArrowRight size={13} />
          </Link>
        </div>
        {products.length === 0 ? (
          <div
            className="text-center py-16 rounded-md bg-black/[0.02] border border-black/5"
            data-sorani-edit="featured"
            data-sorani-field="products"
            data-sorani-label="Aucun produit en avant"
          >
            <p className="text-sm opacity-60">
              Ajoute des produits dans <Link href="/admin/products" className="underline font-medium" style={{ color: 'var(--brand-blue)' }}>l’admin Produits</Link> et coche &laquo; Coup de cœur &raquo;.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-14 md:gap-x-12 md:gap-y-16"
            data-sorani-edit="featured"
            data-sorani-field="products"
            data-sorani-label="Produits (cocher dans Produits → Coup de cœur)"
            data-reveal-stagger
          >
            {products.map((product) => (
              <div key={product.id} className="group block hover-lift">
                <div className="relative aspect-square overflow-hidden mb-4 bg-gray-50">
                  <Link href={`/shop/product/${product.slug}`} className="absolute inset-0 block">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </Link>
                  {product.compare_at_price && (
                    <span
                      className="absolute top-3 left-3 z-10 text-[11px] tracking-wider uppercase px-2.5 py-1 rounded-sm font-medium"
                      style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--brand-blue)' }}
                    >
                      -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                    </span>
                  )}
                  {/* Ajout rapide : slide-up au survol (ordi), toujours visible (mobile) */}
                  <QuickAddButton product={product} className="absolute bottom-3 inset-x-3 z-10 py-2.5" />
                </div>
                <Link href={`/shop/product/${product.slug}`} className="block text-center px-1">
                  {product.category && (
                    <p
                      className="text-[10px] uppercase tracking-[0.18em] mb-1.5 opacity-60"
                      style={{ color: 'inherit' }}
                    >
                      {product.category}
                    </p>
                  )}
                  <h3
                    className="text-lg leading-tight"
                    style={{ fontFamily: 'var(--font-product)' }}
                  >
                    {product.name}
                  </h3>
                  <div
                    className="flex items-center justify-center gap-2 mt-1.5 text-sm"
                    style={{ fontFamily: 'var(--font-price)' }}
                  >
                    <span style={{ color: 'inherit' }}>{product.price.toFixed(2)} €</span>
                    {product.compare_at_price && (
                      <span className="opacity-40 line-through text-xs">
                        {product.compare_at_price.toFixed(2)} €
                      </span>
                    )}
                  </div>
                  {product.reviewCount > 0 && product.rating != null && (
                    <div className="flex items-center justify-center gap-1 mt-1.5 text-[11px] opacity-70">
                      <Star size={11} fill="currentColor" style={{ color: 'var(--brand-blue)' }} />
                      <span>{product.rating.toFixed(1)}</span>
                      <span className="opacity-60">({product.reviewCount})</span>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StorySection({ settings, idx }: { settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, 'story', getNextBg(settings, idx), { bg: settings.colors.primary, text: '#ffffff' });
  const txt = style.color || '#ffffff';
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div
            className="relative aspect-[4/5] overflow-hidden"
            data-sorani-edit="story" data-sorani-field="imageUrl" data-sorani-label="Image de l'histoire"
          >
            <Image
              src={settings.story.imageUrl || '/images/sorani-card.jpg'}
              alt={settings.story.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              style={imagePositionStyle(settings.story.imagePosition)}
            />
          </div>
          <div style={{ color: txt }} className="md:pr-8">
            <p className="text-[11px] uppercase tracking-[0.32em] mb-5 opacity-70">L’art SORANI</p>
            <h2 className="text-3xl md:text-5xl mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
              data-sorani-edit="story" data-sorani-field="title" data-sorani-label="Titre — Histoire">
              {settings.story.title}
            </h2>
            <div className="w-12 h-px mb-8" style={{ background: txt, opacity: 0.4 }} />
            <p className="leading-[1.8] mb-5 text-base md:text-[17px]" style={{ color: txt, opacity: 0.85, textAlign: 'justify' }}
              data-sorani-edit="story" data-sorani-field="paragraph1" data-sorani-label="Histoire — paragraphe 1">
              {settings.story.paragraph1}
            </p>
            <p className="leading-[1.8] mb-10 text-base md:text-[17px]" style={{ color: txt, opacity: 0.85, textAlign: 'justify' }}
              data-sorani-edit="story" data-sorani-field="paragraph2" data-sorani-label="Histoire — paragraphe 2">
              {settings.story.paragraph2}
            </p>
            <Link
              href={settings.story.ctaLink}
              className="inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] border-b pb-2 transition-opacity hover:opacity-70"
              style={{ color: txt, borderColor: txt }}
              data-sorani-edit="story" data-sorani-field="ctaLabel" data-sorani-label="Bouton — Histoire"
            >
              {settings.story.ctaLabel}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReasonsSection({ settings, idx }: { settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, 'reasons', getNextBg(settings, idx), { bg: '#ffffff' });
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-[0.32em] mb-4 opacity-60" style={{ color: 'inherit' }}>
            Pourquoi nous choisir
          </p>
          <h2 className="text-3xl md:text-5xl text-center mb-5"
            style={{ color: 'var(--brand-blue)', fontFamily: 'var(--font-heading)' }}
            data-sorani-edit="reasons" data-sorani-field="title" data-sorani-label="Titre — 4 raisons">
            {settings.reasons.title}
          </h2>
          <p className="text-center text-base max-w-lg mx-auto opacity-70 leading-relaxed"
            data-sorani-edit="reasons" data-sorani-field="subtitle" data-sorani-label="Sous-titre — 4 raisons">
            {settings.reasons.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-8" data-reveal-stagger>
          {settings.reasons.items.map((item, idx) => (
            <div key={idx} className="group"
              data-sorani-edit="reasons" data-sorani-field={`item-${idx}`} data-sorani-label={`Raison ${idx + 1}`}>
              <div className="relative aspect-square overflow-hidden mb-4">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-[1.04] transition-transform duration-[1400ms] ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="font-medium text-lg leading-tight">{item.title}</h3>
                  <p className="text-xs mt-1 text-white/80 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({ settings, idx, categories }: { settings: SiteSettings; idx: number; categories: HomeCategory[] }) {
  const style = resolveSectionStyle(settings, 'categories', getNextBg(settings, idx), { bg: '#f9fafb' });
  const hidden = new Set(settings.hiddenCategorySlugs || []);
  const visibleCats = categories.filter((c) => !hidden.has(c.slug));
  const list = visibleCats.length > 0
    ? visibleCats.slice(0, 8)
    : [
        { id: 'c', name: 'Colliers', slug: 'colliers', description: null },
        { id: 'b', name: 'Bracelets', slug: 'bracelets', description: null },
        { id: 'bo', name: "Boucles d'oreilles", slug: 'boucles-oreilles', description: null },
        { id: 'ba', name: 'Bagues', slug: 'bagues', description: null },
      ];
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-[0.32em] mb-4 opacity-60" style={{ color: 'inherit' }}>
            Explorer
          </p>
          <h2 className="text-3xl md:text-5xl text-center"
            style={{ color: 'var(--brand-blue)', fontFamily: 'var(--font-heading)' }}
            data-sorani-edit="categoriesTitle" data-sorani-label="Titre — Catégories">
            {settings.categoriesTitle}
          </h2>
        </div>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10"
          data-sorani-edit="categoriesTitle"
          data-sorani-label="Catégories (Supabase → categories)"
          data-reveal-stagger
        >
          {list.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group block text-center transition-opacity hover:opacity-70"
            >
              <div className="relative aspect-square rounded-2xl bg-white border border-black/10 flex items-center justify-center mb-5 overflow-hidden transition-all duration-500 group-hover:border-[var(--brand-blue)] group-hover:shadow-md">
                <span className="text-4xl md:text-5xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
                  {cat.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-base" style={{ color: 'inherit', fontFamily: 'var(--font-heading)' }}>
                {cat.name}
              </h3>
              <span className="text-[10px] uppercase tracking-[0.2em] mt-1.5 block opacity-50">
                Découvrir
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ settings, idx }: { settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, 'trust', getNextBg(settings, idx), { bg: '#ffffff' });
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10" data-reveal-stagger>
          {settings.trust.items.map((item, idx) => {
            const Icon = trustIcons[item.icon];
            return (
              <div key={idx} className="text-center group"
                data-sorani-edit="trust" data-sorani-field={`item-${idx}`} data-sorani-label={`Badge ${idx + 1}`}>
                <div className="inline-flex items-center justify-center w-14 h-14 mb-5 transition-transform duration-500 group-hover:scale-[1.06]"
                  style={{ color: 'var(--brand-blue)' }}>
                  <Icon size={36} strokeWidth={1} />
                </div>
                <h3 className="text-base mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                <p className="text-sm opacity-65 leading-relaxed max-w-[200px] mx-auto">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection({ settings, idx }: { settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, 'newsletter', getNextBg(settings, idx), { bg: settings.colors.primary, text: '#ffffff' });
  const txt = style.color || '#ffffff';
  return (
    <section style={style}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] mb-5 opacity-70" style={{ color: txt }}>
          Restons en contact
        </p>
        <h2 className="text-3xl md:text-5xl mb-5 leading-tight" style={{ color: txt, fontFamily: 'var(--font-heading)' }}
          data-sorani-edit="newsletter" data-sorani-field="title" data-sorani-label="Titre — Newsletter">
          {settings.newsletter.title}
        </h2>
        <div className="w-12 h-px mx-auto mb-7" style={{ background: txt, opacity: 0.4 }} />
        <p className="mb-9 max-w-md mx-auto text-base md:text-[17px] leading-relaxed" style={{ color: txt, opacity: 0.85 }}
          data-sorani-edit="newsletter" data-sorani-field="subtitle" data-sorani-label="Sous-titre — Newsletter">
          {settings.newsletter.subtitle}
        </p>
        <NewsletterForm ctaLabel={settings.newsletter.ctaLabel} />
      </div>
    </section>
  );
}

function NewsletterForm({ ctaLabel }: { ctaLabel: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { subscribeToNewsletter } = await import('@/app/actions/newsletter');
    const res = await subscribeToNewsletter(email);
    if (res.ok) {
      setStatus('success');
      setMessage('Merci, ton inscription est bien confirmée ✨');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(res.error || 'Erreur');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 max-w-md mx-auto"
      data-sorani-edit="newsletter"
      data-sorani-field="ctaLabel"
      data-sorani-label="Formulaire newsletter"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className="flex-1 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': 'var(--brand-blue-light)' } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 rounded-full font-semibold transition-all hover:opacity-85 disabled:opacity-60"
          style={{ background: '#ffffff', color: 'var(--brand-blue)' }}
        >
          {status === 'loading' ? '...' : ctaLabel}
        </button>
      </div>
      {status === 'success' && <p className="text-sm text-white/90">{message}</p>}
      {status === 'error' && <p className="text-sm text-red-200">{message}</p>}
    </form>
  );
}

/* ============================================================ */
/*  Sections additionnelles                                     */
/* ============================================================ */
function ImageTextSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const isRight = d.layout === 'right';
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isRight ? 'md:[direction:rtl] md:[&>*]:[direction:ltr]' : ''}`}>
          <div
            className="relative aspect-[4/3] overflow-hidden"
            data-sorani-edit={section.id} data-sorani-field="imageUrl" data-sorani-label="Image du bloc"
          >
            {d.imageUrl ? (
              <Image src={d.imageUrl} alt={d.title || ''} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                Cliquer pour ajouter une image
              </div>
            )}
          </div>
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--brand-blue)' }}
              data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre du bloc"
            >
              {d.title || 'Titre du bloc'}
            </h2>
            <p
              className="text-gray-600 leading-relaxed mb-6 text-lg"
              data-sorani-edit={section.id} data-sorani-field="body" data-sorani-label="Texte du bloc"
            >
              {d.body || 'Ton texte ici. Clique pour éditer.'}
            </p>
            {d.ctaLabel && (
              <Link
                href={d.ctaLink || '#'}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'var(--brand-blue)' }}
                data-sorani-edit={section.id} data-sorani-field="ctaLabel" data-sorani-label="Bouton du bloc"
              >
                {d.ctaLabel}
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  return (
    <section
      className="relative py-32"
      style={{
        background: d.imageUrl ? undefined : 'var(--brand-blue)',
      }}
    >
      {d.imageUrl && (
        <>
          <Image src={d.imageUrl} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2
          className="text-3xl md:text-5xl font-bold mb-4"
          data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre de la bannière"
        >
          {d.title || 'Titre de la bannière'}
        </h2>
        {d.subtitle && (
          <p
            className="text-lg text-white/85 mb-8 max-w-2xl mx-auto"
            data-sorani-edit={section.id} data-sorani-field="subtitle" data-sorani-label="Sous-titre"
          >
            {d.subtitle}
          </p>
        )}
        {d.ctaLabel && (
          <Link
            href={d.ctaLink || '#'}
            className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="ctaLabel" data-sorani-label="Bouton de la bannière"
          >
            {d.ctaLabel}
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </section>
  );
}

function GallerySection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const images = d.images || [];
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && (
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — Galerie"
          >
            {d.title}
          </h2>
        )}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          data-sorani-edit={section.id} data-sorani-field="images" data-sorani-label="Images de la galerie"
        >
          {images.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">
              Clique pour ajouter des photos
            </div>
          ) : (
            images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  Nouveaux blocs additionnels                                 */
/* ============================================================ */
function TextBlockSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  return (
    <section style={style}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {d.title && (
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre"
          >
            {d.title}
          </h2>
        )}
        <p
          className="text-lg text-gray-600 leading-relaxed whitespace-pre-line"
          data-sorani-edit={section.id} data-sorani-field="body" data-sorani-label="Contenu"
        >
          {d.body || 'Écris ton texte ici. Tu peux raconter une anecdote, présenter un produit, partager une valeur.'}
        </p>
      </div>
    </section>
  );
}

function QuoteSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  return (
    <section style={style}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" className="mx-auto mb-4 opacity-30" fill="currentColor" style={{ color: 'var(--brand-blue)' }}>
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
        <blockquote
          className="text-2xl md:text-3xl font-light italic leading-snug mb-6"
          style={{ color: 'var(--brand-blue)' }}
          data-sorani-edit={section.id} data-sorani-field="quote" data-sorani-label="Citation"
        >
          « {d.quote || 'Cette marque a complètement changé ma façon de porter des bijoux.'} »
        </blockquote>
        <p
          className="text-sm font-medium tracking-wider uppercase text-gray-500"
          data-sorani-edit={section.id} data-sorani-field="author" data-sorani-label="Auteur"
        >
          — {d.author || 'Marie L., cliente'}
        </p>
      </div>
    </section>
  );
}

function FaqSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const items = d.faqItems || [
    { question: 'Quel est le délai de livraison ?', answer: '2 à 5 jours ouvrés en France métropolitaine.' },
    { question: 'Les bijoux sont-ils waterproof ?', answer: 'Oui, tous nos bijoux résistent à l\'eau et ne ternissent pas.' },
    { question: 'Puis-je retourner un bijou ?', answer: 'Tu as 14 jours après réception pour nous retourner ta commande.' },
  ];
  return (
    <section style={style}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && (
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — FAQ"
          >
            {d.title}
          </h2>
        )}
        <div
          className="space-y-3"
          data-sorani-edit={section.id} data-sorani-field="faqItems" data-sorani-label="Questions"
        >
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl p-5 transition"
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
            >
              <summary className="cursor-pointer font-semibold text-gray-800 list-none flex items-center justify-between">
                {item.question}
                <span className="text-2xl font-light transition-transform group-open:rotate-45" style={{ color: 'var(--brand-blue)' }}>+</span>
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const url = d.videoUrl || '';
  const ytId = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
  const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
  const embed = ytId ? `https://www.youtube.com/embed/${ytId}` : vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
  return (
    <section style={style}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && (
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-8"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — Vidéo"
          >
            {d.title}
          </h2>
        )}
        <div
          className="relative aspect-video overflow-hidden"
          style={{ background: '#0a0a0a' }}
          data-sorani-edit={section.id} data-sorani-field="videoUrl" data-sorani-label="URL de la vidéo (YouTube ou Vimeo)"
        >
          {embed ? (
            <iframe src={embed} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/60 flex-col gap-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span className="text-sm">Clique pour ajouter une URL YouTube ou Vimeo</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const items = d.statsItems || [
    { value: '10k+', label: 'Clientes heureuses' },
    { value: '1500', label: 'Avis ★ 4,9/5' },
    { value: '48h', label: 'Expédition' },
    { value: '100%', label: 'Fait main' },
  ];
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && (
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — Stats"
          >
            {d.title}
          </h2>
        )}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          data-sorani-edit={section.id} data-sorani-field="statsItems" data-sorani-label="Chiffres clés"
        >
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl tracking-tight mb-2" style={{ color: 'var(--brand-blue)', fontFamily: 'var(--font-heading)' }}>
                <CountUp value={item.value} />
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] opacity-60">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  return (
    <section style={{ ...style, background: style.background || 'var(--brand-blue)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2
          className="text-3xl md:text-5xl font-bold mb-4"
          data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — CTA"
        >
          {d.title || 'Une question, une commande personnalisée ?'}
        </h2>
        {(d.subtitle || !d.title) && (
          <p
            className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
            data-sorani-edit={section.id} data-sorani-field="subtitle" data-sorani-label="Sous-titre — CTA"
          >
            {d.subtitle || 'Écris-nous, on répond sous 24 h ouvrées.'}
          </p>
        )}
        <Link
          href={d.ctaLink || '/contact'}
          className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
          style={{ color: 'var(--brand-blue)' }}
          data-sorani-edit={section.id} data-sorani-field="ctaLabel" data-sorani-label="Bouton — CTA"
        >
          {d.ctaLabel || 'Nous contacter'}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function LogosSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const logos = d.logos || [];
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && (
          <p
            className="text-center text-sm font-medium uppercase tracking-wider text-gray-400 mb-8"
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — Logos"
          >
            {d.title}
          </p>
        )}
        <div
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
          data-sorani-edit={section.id} data-sorani-field="logos" data-sorani-label="Logos / Presse"
        >
          {logos.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Clique pour ajouter des logos (presse, partenaires, certifications…)
            </div>
          ) : (
            logos.map((logo, i) => (
              <div key={i} className="relative h-10 w-32 grayscale hover:grayscale-0 transition opacity-70 hover:opacity-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="h-full w-full object-contain" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function SpacerSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const h = d.height || 80;
  return (
    <div
      style={{ height: `${h}px`, background: 'transparent' }}
      data-sorani-edit={section.id} data-sorani-field="height" data-sorani-label={`Espacement (${h}px)`}
    />
  );
}

function ColumnsSection({ section, settings, idx }: { section: HomeSection; settings: SiteSettings; idx: number }) {
  const style = resolveSectionStyle(settings, section.id, getNextBg(settings, idx));
  const d = section.custom || {};
  const items = d.columnsItems || [
    { title: 'Choisissez', description: 'Parcourez nos collections et trouvez le bijou qui vous ressemble.' },
    { title: 'Personnalisez', description: 'Choisissez votre taille, matière et personnalisations.' },
    { title: 'Recevez', description: 'Expédition rapide en écrin élégant, prêt à offrir.' },
  ];
  return (
    <section style={style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {d.title && (
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit={section.id} data-sorani-field="title" data-sorani-label="Titre — 3 colonnes"
          >
            {d.title}
          </h2>
        )}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          data-sorani-edit={section.id} data-sorani-field="columnsItems" data-sorani-label="3 colonnes"
        >
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="text-center">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-white font-bold"
                style={{ background: 'var(--brand-blue)' }}
              >
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { imagePositionStyle } from '@/lib/image-position';
import type { SiteSettings } from '@/types/site-settings';

// Dégradé d'overlay partagé (mêmes réglages que le hero simple)
function overlayBg(settings: SiteSettings): string | null {
  if (!settings.hero.overlayEnabled) return null;
  const color = settings.hero.overlayColor || '#1B4965';
  const alpha = Math.max(0, Math.min(100, settings.hero.overlayOpacity ?? 50)) / 100;
  const h = color.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
  const dir = settings.hero.overlayDirection || 'horizontal';
  if (dir === 'horizontal') return `linear-gradient(to right, ${rgba(alpha)}, ${rgba(alpha * 0.5)}, ${rgba(0)})`;
  if (dir === 'vertical') return `linear-gradient(to bottom, ${rgba(0)}, ${rgba(alpha * 0.4)}, ${rgba(alpha)})`;
  return rgba(alpha);
}

export default function HeroCarousel({ settings, bg }: { settings: SiteSettings; bg?: string }) {
  const hero = settings.hero;
  const slides = (hero.slides ?? []).filter((s) => s.imageUrl);
  const count = slides.length;
  const [index, setIndex] = useState(0);

  const autoplay = hero.autoplay !== false;
  const interval = Math.max(2, hero.interval ?? 5) * 1000;

  // Garde l'index dans les bornes si le nombre de slides change (édition live)
  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (!autoplay || count <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(t);
  }, [autoplay, interval, count]);

  if (count === 0) return null;

  const go = (i: number) => setIndex((i + count) % count);
  const ov = overlayBg(settings);

  return (
    <section
      className="relative h-[90vh] min-h-[600px] overflow-hidden"
      style={{ background: bg }}
      data-sorani-edit="hero"
      data-sorani-label="Carrousel du hero"
    >
      {slides.map((slide, i) => {
        const title = slide.title || hero.title;
        const subtitle = slide.subtitle ?? hero.subtitle;
        const ctaLabel = slide.ctaLabel || hero.ctaLabel;
        const ctaLink = slide.ctaLink || hero.ctaLink;
        const active = i === index;
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
            style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
            aria-hidden={!active}
          >
            <Image
              src={slide.imageUrl}
              alt={title || settings.brand.name}
              fill
              sizes="100vw"
              className="object-cover"
              style={imagePositionStyle(slide.imagePosition)}
              priority={i === 0}
            />
            {ov && <div className="absolute inset-0 pointer-events-none" style={{ background: ov }} />}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <p className="text-[12px] uppercase tracking-[0.4em] mb-6 text-white/80">
                    {settings.brand.name}
                  </p>
                  <h1
                    className="text-5xl md:text-7xl leading-[1.05] text-white"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}
                  >
                    {title}
                  </h1>
                  <div className="w-12 h-px bg-white/60 mt-8 mb-8" />
                  {subtitle && (
                    <p className="text-lg md:text-xl text-white/90 max-w-lg leading-relaxed">{subtitle}</p>
                  )}
                  {ctaLabel && (
                    <div className="mt-10">
                      <Link
                        href={ctaLink || '/shop'}
                        className="cta-magnetic inline-flex items-center gap-3 bg-white text-[13px] uppercase tracking-[0.25em] px-10 py-4 transition-all hover:opacity-85"
                        style={{ color: 'var(--brand-blue)' }}
                      >
                        {ctaLabel}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            onClick={() => go(index - 1)}
            aria-label="Slide précédent"
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:bg-white/25"
            style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="Slide suivant"
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:bg-white/25"
            style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' }}
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Aller au slide ${i + 1}`}
                className="transition-all rounded-full"
                style={{
                  width: i === index ? '26px' : '8px',
                  height: '8px',
                  background: i === index ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

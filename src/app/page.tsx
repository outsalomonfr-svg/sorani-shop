'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, Shield, Droplets } from 'lucide-react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import type { HomeSection, SiteSettings } from '@/types/site-settings';

const exampleProducts = [
  { id: '1', name: 'Collier Perles Soleil', price: 34.9, compare_at_price: 44.9, image: '/images/hero-2.png', category: 'Colliers' },
  { id: '2', name: 'Boucles Luna Perles', price: 28.9, image: '/images/hero-4.png', category: "Boucles d'oreilles" },
  { id: '3', name: 'Bracelet Doré Chaîne', price: 24.9, image: '/images/hero-5.png', category: 'Bracelets' },
  { id: '4', name: 'Collier Celestia Lune', price: 32.9, compare_at_price: 39.9, image: '/images/hero-1.png', category: 'Colliers' },
];

const trustIcons = { Sparkles, Droplets, Truck, Shield };

export default function HomePage() {
  const settings = useSiteSettings();
  const sections = settings.homeLayout?.sections || [];

  return (
    <div>
      {sections.filter((s) => s.visible).map((section) => (
        <SectionRenderer key={section.id} section={section} settings={settings} />
      ))}
    </div>
  );
}

function SectionRenderer({ section, settings }: { section: HomeSection; settings: SiteSettings }) {
  switch (section.type) {
    case 'hero':       return <HeroSection settings={settings} />;
    case 'featured':   return <FeaturedSection settings={settings} />;
    case 'story':      return <StorySection settings={settings} />;
    case 'reasons':    return <ReasonsSection settings={settings} />;
    case 'categories': return <CategoriesSection settings={settings} />;
    case 'trust':      return <TrustSection settings={settings} />;
    case 'newsletter': return <NewsletterSection settings={settings} />;
    case 'imageText':  return <ImageTextSection section={section} />;
    case 'banner':     return <BannerSection section={section} />;
    case 'gallery':    return <GallerySection section={section} />;
    default:           return null;
  }
}

/* ============================================================ */
function HeroSection({ settings }: { settings: SiteSettings }) {
  const heroImage = settings.hero.imageUrl || '/images/hero-1.png';
  return (
    <section
      className="relative h-[90vh] min-h-[600px] overflow-hidden"
      data-sorani-edit="hero"
      data-sorani-field="imageUrl"
      data-sorani-label="Image du hero"
    >
      <Image src={heroImage} alt={settings.brand.name} fill className="object-cover animate-scale-in" priority />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to right, ${settings.colors.primary}CC, ${settings.colors.primary}80, transparent)` }}
      />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <h1
              className="text-5xl md:text-7xl font-bold leading-tight text-white animate-fade-in-up"
              data-sorani-edit="hero" data-sorani-field="title" data-sorani-label="Titre du hero"
            >
              {settings.hero.title}
            </h1>
            <p
              className="mt-6 text-lg text-white/80 max-w-lg animate-fade-in-up-delay"
              data-sorani-edit="hero" data-sorani-field="subtitle" data-sorani-label="Sous-titre du hero"
            >
              {settings.hero.subtitle}
            </p>
            <div className="mt-8 animate-fade-in-up-delay-2">
              <Link
                href={settings.hero.ctaLink}
                className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                style={{ color: 'var(--brand-blue)' }}
                data-sorani-edit="hero" data-sorani-field="ctaLabel" data-sorani-label="Bouton du hero"
              >
                {settings.hero.ctaLabel}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit="featured" data-sorani-field="title" data-sorani-label="Titre — Coups de cœur"
          >
            {settings.featuredTitle}
          </h2>
          <Link href="/shop" className="hover:underline font-medium flex items-center gap-1" style={{ color: 'var(--brand-blue)' }}>
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {exampleProducts.map((product) => (
            <Link key={product.id} href="/shop" className="group">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  {product.compare_at_price && (
                    <span className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--brand-blue)' }}>
                      -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--brand-blue)' }}>{product.category}</p>
                  <h3 className="font-semibold text-gray-800 transition">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold" style={{ color: 'var(--brand-blue)' }}>{product.price.toFixed(2)} €</span>
                    {product.compare_at_price && <span className="text-gray-400 line-through text-sm">{product.compare_at_price.toFixed(2)} €</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="py-20" style={{ background: 'var(--brand-blue)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div
            className="relative h-[500px] rounded-2xl overflow-hidden"
            data-sorani-edit="story" data-sorani-field="imageUrl" data-sorani-label="Image de l'histoire"
          >
            <Image src={settings.story.imageUrl || '/images/sorani-card.jpg'} alt={settings.story.title} fill className="object-cover" />
          </div>
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6"
              data-sorani-edit="story" data-sorani-field="title" data-sorani-label="Titre — Histoire">
              {settings.story.title}
            </h2>
            <p className="text-white/80 leading-relaxed mb-4 text-lg"
              data-sorani-edit="story" data-sorani-field="paragraph1" data-sorani-label="Histoire — paragraphe 1">
              {settings.story.paragraph1}
            </p>
            <p className="text-white/80 leading-relaxed mb-8 text-lg"
              data-sorani-edit="story" data-sorani-field="paragraph2" data-sorani-label="Histoire — paragraphe 2">
              {settings.story.paragraph2}
            </p>
            <Link
              href={settings.story.ctaLink}
              className="inline-flex items-center gap-2 bg-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105"
              style={{ color: 'var(--brand-blue)' }}
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

function ReasonsSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4"
          style={{ color: 'var(--brand-blue)' }}
          data-sorani-edit="reasons" data-sorani-field="title" data-sorani-label="Titre — 4 raisons">
          {settings.reasons.title}
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-md mx-auto"
          data-sorani-edit="reasons" data-sorani-field="subtitle" data-sorani-label="Sous-titre — 4 raisons">
          {settings.reasons.subtitle}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {settings.reasons.items.map((item, idx) => (
            <div key={idx} className="group"
              data-sorani-edit="reasons" data-sorani-field={`item-${idx}`} data-sorani-label={`Raison ${idx + 1}`}>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: 'var(--brand-blue)' }}
          data-sorani-edit="categoriesTitle" data-sorani-label="Titre — Catégories">
          {settings.categoriesTitle}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Colliers', slug: 'colliers' },
            { name: 'Bracelets', slug: 'bracelets' },
            { name: "Boucles d'oreilles", slug: 'boucles-oreilles' },
            { name: 'Bagues', slug: 'bagues' },
          ].map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--brand-blue)' }}>{cat.name}</h3>
              <span className="text-sm text-gray-400 mt-2 block group-hover:text-[#1B4965] transition">Découvrir →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {settings.trust.items.map((item, idx) => {
            const Icon = trustIcons[item.icon];
            return (
              <div key={idx} className="text-center group"
                data-sorani-edit="trust" data-sorani-field={`item-${idx}`} data-sorani-label={`Badge ${idx + 1}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: 'var(--brand-blue)' }}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="py-20" style={{ background: 'var(--brand-blue)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4"
          data-sorani-edit="newsletter" data-sorani-field="title" data-sorani-label="Titre — Newsletter">
          {settings.newsletter.title}
        </h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto"
          data-sorani-edit="newsletter" data-sorani-field="subtitle" data-sorani-label="Sous-titre — Newsletter">
          {settings.newsletter.subtitle}
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" placeholder="Votre adresse email"
            className="flex-1 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--brand-blue-light)' } as React.CSSProperties} />
          <button type="submit"
            className="px-8 py-4 rounded-full font-semibold hover:bg-white transition-all hover:scale-105"
            style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}
            data-sorani-edit="newsletter" data-sorani-field="ctaLabel" data-sorani-label="Bouton — Newsletter">
            {settings.newsletter.ctaLabel}
          </button>
        </form>
      </div>
    </section>
  );
}

/* ============================================================ */
/*  Sections additionnelles                                     */
/* ============================================================ */
function ImageTextSection({ section }: { section: HomeSection }) {
  const d = section.custom || {};
  const isRight = d.layout === 'right';
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isRight ? 'md:[direction:rtl] md:[&>*]:[direction:ltr]' : ''}`}>
          <div
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
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

function BannerSection({ section }: { section: HomeSection }) {
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

function GallerySection({ section }: { section: HomeSection }) {
  const d = section.custom || {};
  const images = d.images || [];
  return (
    <section className="bg-white py-20">
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
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, Shield, Droplets } from 'lucide-react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

const exampleProducts = [
  {
    id: '1',
    name: 'Collier Perles Soleil',
    price: 34.9,
    compare_at_price: 44.9,
    image: '/images/hero-2.png',
    category: 'Colliers',
  },
  {
    id: '2',
    name: 'Boucles Luna Perles',
    price: 28.9,
    image: '/images/hero-4.png',
    category: "Boucles d'oreilles",
  },
  {
    id: '3',
    name: 'Bracelet Doré Chaîne',
    price: 24.9,
    image: '/images/hero-5.png',
    category: 'Bracelets',
  },
  {
    id: '4',
    name: 'Collier Celestia Lune',
    price: 32.9,
    compare_at_price: 39.9,
    image: '/images/hero-1.png',
    category: 'Colliers',
  },
];

const trustIcons = { Sparkles, Droplets, Truck, Shield };

export default function HomePage() {
  const settings = useSiteSettings();
  const heroImage = settings.hero.imageUrl || '/images/hero-1.png';

  return (
    <div>
      {/* Hero Section - Full width image */}
      <section
        className="relative h-[90vh] min-h-[600px] overflow-hidden"
        data-sorani-edit="hero"
        data-sorani-field="imageUrl"
        data-sorani-label="Image du hero"
      >
        <Image
          src={heroImage}
          alt={settings.brand.name}
          fill
          className="object-cover animate-scale-in"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${settings.colors.primary}CC, ${settings.colors.primary}80, transparent)`,
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1
                className="text-5xl md:text-7xl font-bold leading-tight text-white animate-fade-in-up"
                data-sorani-edit="hero"
                data-sorani-field="title"
                data-sorani-label="Titre du hero"
              >
                {settings.hero.title}
              </h1>
              <p
                className="mt-6 text-lg text-white/80 max-w-lg animate-fade-in-up-delay"
                data-sorani-edit="hero"
                data-sorani-field="subtitle"
                data-sorani-label="Sous-titre du hero"
              >
                {settings.hero.subtitle}
              </p>
              <div className="mt-8 animate-fade-in-up-delay-2">
                <Link
                  href={settings.hero.ctaLink}
                  className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
                  style={{ color: 'var(--brand-blue)' }}
                  data-sorani-edit="hero"
                  data-sorani-field="ctaLabel"
                  data-sorani-label="Bouton du hero"
                >
                  {settings.hero.ctaLabel}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--brand-blue)' }}
              data-sorani-edit="featured"
              data-sorani-field="title"
              data-sorani-label="Titre — Coups de cœur"
            >
              {settings.featuredTitle}
            </h2>
            <Link
              href="/shop"
              className="hover:underline font-medium flex items-center gap-1"
              style={{ color: 'var(--brand-blue)' }}
            >
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {exampleProducts.map((product) => (
              <Link key={product.id} href="/shop" className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.compare_at_price && (
                      <span
                        className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: 'var(--brand-blue)' }}
                      >
                        -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--brand-blue)' }}>
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-gray-800 transition">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold" style={{ color: 'var(--brand-blue)' }}>
                        {product.price.toFixed(2)} €
                      </span>
                      {product.compare_at_price && (
                        <span className="text-gray-400 line-through text-sm">
                          {product.compare_at_price.toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20" style={{ background: 'var(--brand-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div
              className="relative h-[500px] rounded-2xl overflow-hidden"
              data-sorani-edit="story"
              data-sorani-field="imageUrl"
              data-sorani-label="Image de l'histoire"
            >
              <Image
                src={settings.story.imageUrl || '/images/sorani-card.jpg'}
                alt={settings.story.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-white">
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                data-sorani-edit="story"
                data-sorani-field="title"
                data-sorani-label="Titre — Histoire"
              >
                {settings.story.title}
              </h2>
              <p
                className="text-white/80 leading-relaxed mb-4 text-lg"
                data-sorani-edit="story"
                data-sorani-field="paragraph1"
                data-sorani-label="Histoire — paragraphe 1"
              >
                {settings.story.paragraph1}
              </p>
              <p
                className="text-white/80 leading-relaxed mb-8 text-lg"
                data-sorani-edit="story"
                data-sorani-field="paragraph2"
                data-sorani-label="Histoire — paragraphe 2"
              >
                {settings.story.paragraph2}
              </p>
              <Link
                href={settings.story.ctaLink}
                className="inline-flex items-center gap-2 bg-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105"
                style={{ color: 'var(--brand-blue)' }}
                data-sorani-edit="story"
                data-sorani-field="ctaLabel"
                data-sorani-label="Bouton — Histoire"
              >
                {settings.story.ctaLabel}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Reasons */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-4"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit="reasons"
            data-sorani-field="title"
            data-sorani-label="Titre — 4 raisons"
          >
            {settings.reasons.title}
          </h2>
          <p
            className="text-center text-gray-500 mb-12 max-w-md mx-auto"
            data-sorani-edit="reasons"
            data-sorani-field="subtitle"
            data-sorani-label="Sous-titre — 4 raisons"
          >
            {settings.reasons.subtitle}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {settings.reasons.items.map((item, idx) => (
              <div
                key={idx}
                className="group"
                data-sorani-edit="reasons"
                data-sorani-field={`item-${idx}`}
                data-sorani-label={`Raison ${idx + 1}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
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

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: 'var(--brand-blue)' }}
            data-sorani-edit="categoriesTitle"
            data-sorani-label="Titre — Catégories"
          >
            {settings.categoriesTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Colliers', slug: 'colliers' },
              { name: 'Bracelets', slug: 'bracelets' },
              { name: "Boucles d'oreilles", slug: 'boucles-oreilles' },
              { name: 'Bagues', slug: 'bagues' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <h3 className="font-semibold text-lg" style={{ color: 'var(--brand-blue)' }}>
                  {cat.name}
                </h3>
                <span className="text-sm text-gray-400 mt-2 block group-hover:text-[#1B4965] transition">
                  Découvrir →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {settings.trust.items.map((item, idx) => {
              const Icon = trustIcons[item.icon];
              return (
                <div
                  key={idx}
                  className="text-center group"
                  data-sorani-edit="trust"
                  data-sorani-field={`item-${idx}`}
                  data-sorani-label={`Badge ${idx + 1}`}
                >
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: 'var(--brand-blue)' }}
                  >
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

      {/* Newsletter */}
      <section className="py-20" style={{ background: 'var(--brand-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold text-white mb-4"
            data-sorani-edit="newsletter"
            data-sorani-field="title"
            data-sorani-label="Titre — Newsletter"
          >
            {settings.newsletter.title}
          </h2>
          <p
            className="text-white/70 mb-8 max-w-md mx-auto"
            data-sorani-edit="newsletter"
            data-sorani-field="subtitle"
            data-sorani-label="Sous-titre — Newsletter"
          >
            {settings.newsletter.subtitle}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--brand-blue-light)' } as React.CSSProperties}
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-full font-semibold hover:bg-white transition-all hover:scale-105"
              style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}
              data-sorani-edit="newsletter"
              data-sorani-field="ctaLabel"
              data-sorani-label="Bouton — Newsletter"
            >
              {settings.newsletter.ctaLabel}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

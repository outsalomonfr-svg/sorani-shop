'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/types';
import QuickAddButton from './QuickAddButton';

export default function ProductCard({
  product,
  rating,
  reviewCount = 0,
}: {
  product: Product;
  rating?: number | null;
  reviewCount?: number;
}) {
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="group block">
      <div className="relative aspect-square overflow-hidden mb-4 bg-gray-50">
        <Link href={`/shop/product/${product.slug}`} className="absolute inset-0 block">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
          )}
        </Link>
        {discount > 0 && (
          <span
            className="absolute top-3 left-3 z-10 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--brand-blue)' }}
          >
            −{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <span className="bg-white text-[11px] uppercase tracking-[0.25em] px-4 py-2">
              Rupture
            </span>
          </div>
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
            {product.category.name}
          </p>
        )}
        <h3 className="text-lg leading-tight" style={{ fontFamily: 'var(--font-product)' }}>
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
        {reviewCount > 0 && rating != null && (
          <div className="flex items-center justify-center gap-1 mt-1.5 text-[11px] opacity-70">
            <Star size={11} fill="currentColor" style={{ color: 'var(--brand-blue)' }} />
            <span>{rating.toFixed(1)}</span>
            <span className="opacity-60">({reviewCount})</span>
          </div>
        )}
      </Link>
    </div>
  );
}

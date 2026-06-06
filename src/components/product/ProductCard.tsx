'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <Link href={`/shop/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden mb-4 bg-gray-50">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
        )}
        {discount > 0 && (
          <span
            className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--brand-blue)' }}
          >
            −{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white text-[11px] uppercase tracking-[0.25em] px-4 py-2">
              Rupture
            </span>
          </div>
        )}
      </div>
      <div className="text-center px-1">
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
      </div>
    </Link>
  );
}

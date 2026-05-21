'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import * as pixel from '@/lib/meta-pixel';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCart();
    pixel.addToCart({
      content_name: product.name,
      content_ids: [product.id],
      value: product.price,
      currency: 'EUR',
    });
  };

  return (
    <Link href={`/shop/product/${product.slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-4 py-2 rounded font-medium">Rupture de stock</span>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="absolute bottom-3 right-3 bg-white p-2.5 rounded-full shadow-md hover:bg-[#1B4965] hover:text-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-800 group-hover:text-[#1B4965] transition">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#1B4965] font-bold">{product.price.toFixed(2)} EUR</span>
            {product.compare_at_price && (
              <span className="text-gray-400 line-through text-sm">
                {product.compare_at_price.toFixed(2)} EUR
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

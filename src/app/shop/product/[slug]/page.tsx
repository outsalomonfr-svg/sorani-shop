'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';
import * as pixel from '@/lib/meta-pixel';
import type { Product } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', params.slug)
        .single();

      if (data) {
        setProduct(data);
        pixel.viewContent({
          content_name: data.name,
          content_ids: [data.id],
          value: data.price,
          currency: 'EUR',
        });
      }
    };
    fetchProduct();
  }, [params.slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
    pixel.addToCart({
      content_name: product.name,
      content_ids: [product.id],
      value: product.price * quantity,
      currency: 'EUR',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B4965] mb-8">
        <ArrowLeft size={18} />
        Retour a la boutique
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === i ? 'border-[#1B4965]' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-sm text-[#1B4965] font-medium mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-[#1B4965]">{product.price.toFixed(2)} EUR</span>
            {product.compare_at_price && (
              <span className="text-xl text-gray-400 line-through">
                {product.compare_at_price.toFixed(2)} EUR
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

          {product.materials && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Materiaux: </span>
              <span className="text-sm text-gray-600">{product.materials}</span>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-[#1B4965] text-white py-4 rounded-lg font-semibold hover:bg-[#153a52] transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={20} />
            {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {product.stock > 0 ? `${product.stock} en stock` : 'Indisponible'}
          </p>
        </div>
      </div>
    </div>
  );
}

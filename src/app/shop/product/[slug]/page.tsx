'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';
import * as pixel from '@/lib/meta-pixel';
import type { Product, ProductVariant } from '@/types';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
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
        // Charge les variantes
        const { data: vs } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_active', true)
          .order('position', { ascending: true });
        const list = (vs as ProductVariant[]) || [];
        setVariants(list);
        // Pré-sélectionne la première variante si présente
        if (list.length > 0) setSelectedVariantId(list[0].id);
      }
    };
    fetchProduct();
  }, [params.slug]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || null,
    [variants, selectedVariantId]
  );

  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const effectiveCompareAt = selectedVariant?.compare_at_price ?? product?.compare_at_price ?? null;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const effectiveImage = selectedVariant?.image || product?.images?.[selectedImage] || product?.images?.[0];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    openCart();
    pixel.addToCart({
      content_name: product.name,
      content_ids: [product.id],
      value: effectivePrice * quantity,
      currency: 'EUR',
    });
  };

  const isColor = product.variant_type?.toLowerCase().includes('couleur');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B4965] mb-8">
        <ArrowLeft size={18} />
        Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {effectiveImage && (
              <Image src={effectiveImage} alt={product.name} fill className="object-cover" />
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
            <span className="text-3xl font-bold text-[#1B4965]">{effectivePrice.toFixed(2)} €</span>
            {effectiveCompareAt && effectiveCompareAt > effectivePrice && (
              <span className="text-xl text-gray-400 line-through">
                {effectiveCompareAt.toFixed(2)} €
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {product.materials && (
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Matériaux : </span>
              <span className="text-sm text-gray-600">{product.materials}</span>
            </div>
          )}

          {/* Variantes */}
          {variants.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {product.variant_type || 'Variante'} :
                </span>
                {selectedVariant && (
                  <span className="text-sm text-gray-500">{selectedVariant.name}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const isOut = v.stock <= 0;
                  if (isColor && v.color_hex) {
                    return (
                      <button
                        key={v.id}
                        onClick={() => !isOut && setSelectedVariantId(v.id)}
                        disabled={isOut}
                        title={`${v.name}${isOut ? ' — rupture' : ''}`}
                        className="relative w-10 h-10 rounded-full transition disabled:opacity-30"
                        style={{
                          background: v.color_hex,
                          boxShadow: isSelected
                            ? '0 0 0 2px white, 0 0 0 4px #1B4965'
                            : '0 0 0 1px rgba(0,0,0,0.1)',
                          cursor: isOut ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isOut && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs">✕</span>
                        )}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isOut && setSelectedVariantId(v.id)}
                      disabled={isOut}
                      className="px-4 py-2 rounded-full text-sm transition border-2"
                      style={{
                        borderColor: isSelected ? '#1B4965' : '#E5E7EB',
                        background: isSelected ? '#1B4965' : 'white',
                        color: isSelected ? 'white' : '#374151',
                        opacity: isOut ? 0.4 : 1,
                        textDecoration: isOut ? 'line-through' : 'none',
                        cursor: isOut ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50">
                <Minus size={16} />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={effectiveStock === 0}
            className="w-full bg-[#1B4965] text-white py-4 rounded-lg font-semibold hover:bg-[#153a52] transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={20} />
            {effectiveStock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {effectiveStock > 0 ? `${effectiveStock} en stock` : 'Indisponible'}
          </p>
        </div>
      </div>
    </div>
  );
}

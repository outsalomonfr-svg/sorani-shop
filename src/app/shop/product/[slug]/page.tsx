'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ArrowLeft, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/useCart';
import * as pixel from '@/lib/meta-pixel';
import type { Product, ProductVariant } from '@/types';
import ProductReviews from '@/components/reviews/ProductReviews';

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
        const { data: vs } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_active', true)
          .order('position', { ascending: true });
        const list = (vs as ProductVariant[]) || [];
        setVariants(list);
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
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] opacity-50">Chargement…</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] opacity-60 hover:opacity-100 transition mb-10"
      >
        <ArrowLeft size={13} />
        Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 overflow-hidden mb-4">
            {effectiveImage && (
              <Image src={effectiveImage} alt={product.name} fill className="object-cover" priority />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className="relative aspect-square overflow-hidden transition-opacity"
                  style={{
                    opacity: selectedImage === i ? 1 : 0.5,
                    border: selectedImage === i ? '1px solid var(--brand-blue)' : '1px solid transparent',
                  }}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:pt-4">
          {product.category && (
            <p
              className="text-[11px] uppercase tracking-[0.32em] mb-4 opacity-60"
              style={{ color: 'inherit' }}
            >
              {product.category.name}
            </p>
          )}
          <h1
            className="text-3xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
          >
            {product.name}
          </h1>
          <div className="w-12 h-px mb-6 opacity-30" style={{ background: 'currentColor' }} />

          <div className="flex items-baseline gap-3 mb-8" style={{ fontFamily: 'var(--font-price)' }}>
            <span className="text-2xl" style={{ color: 'var(--brand-blue)' }}>
              {effectivePrice.toFixed(2)} €
            </span>
            {effectiveCompareAt && effectiveCompareAt > effectivePrice && (
              <span className="text-base opacity-50 line-through">
                {effectiveCompareAt.toFixed(2)} €
              </span>
            )}
          </div>

          <p className="text-[15px] leading-[1.8] opacity-80 mb-8">{product.description}</p>

          {product.materials && (
            <div className="mb-8 pb-8 border-b border-black/10">
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-50 mb-2">Matériaux</p>
              <p className="text-sm">{product.materials}</p>
            </div>
          )}

          {/* Variantes */}
          {variants.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">
                  {product.variant_type || 'Variante'}
                </p>
                {selectedVariant && (
                  <p className="text-xs opacity-70" style={{ fontFamily: 'var(--font-heading)' }}>
                    {selectedVariant.name}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
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
                        className="relative w-9 h-9 rounded-full transition disabled:opacity-30"
                        style={{
                          background: v.color_hex,
                          boxShadow: isSelected
                            ? '0 0 0 1.5px white, 0 0 0 3px var(--brand-blue)'
                            : '0 0 0 1px rgba(0,0,0,0.1)',
                          cursor: isOut ? 'not-allowed' : 'pointer',
                        }}
                      />
                    );
                  }
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isOut && setSelectedVariantId(v.id)}
                      disabled={isOut}
                      className="min-w-[60px] px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] transition"
                      style={{
                        border: isSelected ? '1px solid var(--brand-blue)' : '1px solid rgba(0,0,0,0.15)',
                        background: isSelected ? 'var(--brand-blue)' : 'transparent',
                        color: isSelected ? 'white' : 'inherit',
                        opacity: isOut ? 0.35 : 1,
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

          {product?.show_add_to_cart !== false ? (
            <>
              {/* Quantity */}
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">Quantité</p>
                <div className="flex items-center border border-black/15">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-black/5 transition">
                    <Minus size={13} />
                  </button>
                  <span className="px-4 text-sm" style={{ fontFamily: 'var(--font-price)' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-black/5 transition">
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={effectiveStock === 0}
                className="cta-magnetic w-full text-white py-4 transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed text-[12px] uppercase tracking-[0.28em]"
                style={{ background: 'var(--brand-blue)' }}
              >
                {effectiveStock === 0 ? 'Indisponible' : 'Ajouter au panier'}
              </button>
            </>
          ) : (
            /* Bouton panier masqué depuis l'admin — produit en présentation / sur commande */
            <div
              className="w-full py-4 text-center text-[11px] uppercase tracking-[0.25em] border"
              style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'var(--brand-blue)' }}
            >
              Sur commande — nous contacter
            </div>
          )}

          <p className="text-[10px] uppercase tracking-[0.25em] opacity-50 mt-4 text-center">
            {effectiveStock > 0
              ? `${effectiveStock} ${effectiveStock > 1 ? 'pièces disponibles' : 'pièce disponible'}`
              : 'En rupture pour le moment'}
          </p>

          {/* Reassurance */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-black/10">
            {[
              { label: 'Fait à la commande', Icon: Sparkles },
              { label: 'Livraison soignée', Icon: Truck },
              { label: 'Paiement sécurisé', Icon: ShieldCheck },
            ].map((r) => (
              <div key={r.label} className="flex flex-col items-center text-center gap-2.5">
                <r.Icon size={20} strokeWidth={1.4} style={{ color: 'var(--brand-blue)' }} />
                <p className="text-[10px] uppercase tracking-[0.16em] opacity-70 leading-relaxed">
                  {r.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Avis clients */}
      <ProductReviews productId={product.id} />
    </div>
  );
}

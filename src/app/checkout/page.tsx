'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, Tag, X, Check, Lock, Minus, Plus, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as pixel from '@/lib/meta-pixel';
import { validatePromoCode, type PromoValidation } from '@/app/actions/promo';

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoValidation | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoChecking, setPromoChecking] = useState(false);

  const subtotal = totalPrice();
  const count = totalItems();
  const discount = promo?.ok ? promo.discountAmount ?? 0 : 0;
  const total = Math.max(0, subtotal - discount);

  const applyPromo = async () => {
    setPromoError('');
    setPromoChecking(true);
    const result = await validatePromoCode(promoInput, subtotal);
    setPromoChecking(false);
    if (result.ok) {
      setPromo(result);
      setPromoInput('');
    } else {
      setPromoError(result.error || 'Code invalide');
    }
  };

  const startPayment = async () => {
    setLoading(true);
    setError('');
    pixel.initiateCheckout({ value: total, currency: 'EUR', num_items: items.length });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, promoCode: promo?.ok ? promo.code : undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Impossible de démarrer le paiement.');
        setLoading(false);
      }
    } catch {
      setError('Erreur réseau. Réessaie.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
          Votre panier est vide
        </h1>
        <p className="text-sm opacity-60 mb-8">Il n’attend que vos plus belles trouvailles.</p>
        <Link
          href="/shop"
          className="inline-flex rounded-full text-white py-3.5 px-10 text-[11px] uppercase tracking-[0.22em] transition hover:opacity-90"
          style={{ background: 'var(--brand-blue)' }}
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] opacity-50 hover:opacity-100 transition mb-8"
      >
        <ArrowLeft size={14} />
        Continuer mes achats
      </Link>

      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-50 mb-2">Votre commande</p>
        <h1 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
          Panier
          <span className="text-lg align-middle ml-3 opacity-40" style={{ fontFamily: 'var(--font-price)' }}>
            {count} article{count > 1 ? 's' : ''}
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
        {/* Articles */}
        <div className="space-y-3">
          {items.map((item) => {
            const price = item.variant?.price ?? item.product.price;
            const image = item.variant?.image || item.product.images[0];
            const vId = item.variant?.id ?? null;
            return (
              <div
                key={`${item.product.id}-${vId ?? 'base'}`}
                className="group relative flex gap-4 sm:gap-5 p-3 sm:p-4 rounded-2xl transition-colors hover:bg-black/[0.015]"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                  {image && <Image src={image} alt={item.product.name} fill sizes="112px" className="object-cover" />}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg leading-tight truncate" style={{ fontFamily: 'var(--font-product)' }}>
                        {item.product.name}
                      </h3>
                      {item.variant && (
                        <p className="text-xs opacity-55 mt-0.5">
                          {item.product.variant_type ? `${item.product.variant_type} : ` : ''}
                          {item.variant.name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, vId)}
                      className="p-1 rounded-full opacity-40 hover:opacity-100 hover:bg-black/[0.05] transition"
                      aria-label="Retirer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="mt-auto pt-3 flex items-end justify-between">
                    {/* Stepper quantité */}
                    <div className="inline-flex items-center rounded-full" style={{ border: '1px solid rgba(0,0,0,0.15)' }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, vId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition"
                        aria-label="Diminuer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm" style={{ fontFamily: 'var(--font-price)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, vId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition"
                        aria-label="Augmenter"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-base" style={{ fontFamily: 'var(--font-price)', color: 'var(--brand-blue)' }}>
                      {(price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé */}
        <div
          className="rounded-2xl p-6 lg:sticky lg:top-24 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}
        >
          <h2 className="text-xl mb-5" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
            Résumé
          </h2>

          {/* Code promo */}
          <div className="mb-5">
            {promo?.ok ? (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-green-200 bg-green-50">
                <div className="flex items-center gap-2 min-w-0">
                  <Check size={14} className="text-green-700 flex-shrink-0" />
                  <p className="font-mono font-semibold text-sm text-green-800 truncate">{promo.code}</p>
                </div>
                <button onClick={() => setPromo(null)} className="p-1 rounded hover:bg-green-100 text-green-700" title="Retirer">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-full" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                    <Tag size={13} className="opacity-40" />
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                      placeholder="Code promo"
                      className="flex-1 outline-none bg-transparent text-sm font-mono uppercase tracking-wide"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    disabled={!promoInput.trim() || promoChecking}
                    className="px-5 rounded-full text-[11px] uppercase tracking-[0.14em] transition hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'rgba(56,69,173,0.08)', color: 'var(--brand-blue)' }}
                  >
                    {promoChecking ? '…' : 'OK'}
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-600 mt-1.5">{promoError}</p>}
              </>
            )}
          </div>

          <div className="space-y-3 text-sm border-t pt-5" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <div className="flex justify-between">
              <span className="opacity-55">Sous-total</span>
              <span style={{ fontFamily: 'var(--font-price)' }}>{subtotal.toFixed(2)} €</span>
            </div>
            {promo?.ok && discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Remise ({promo.code})</span>
                <span style={{ fontFamily: 'var(--font-price)' }}>−{discount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="opacity-55">Livraison</span>
              <span className="opacity-55 text-right">Calculée au paiement</span>
            </div>
          </div>

          <div className="border-t mt-5 pt-5 flex justify-between items-baseline" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            <span className="text-[11px] uppercase tracking-[0.22em] opacity-60">Total</span>
            <span className="text-3xl" style={{ fontFamily: 'var(--font-price)', color: 'var(--brand-blue)' }}>
              {total.toFixed(2)} €
            </span>
          </div>

          {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}

          <button
            onClick={startPayment}
            disabled={loading}
            className="w-full mt-6 rounded-full text-white py-4 text-[12px] uppercase tracking-[0.24em] transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--brand-blue)', boxShadow: '0 8px 24px rgba(56,69,173,0.28)' }}
          >
            <Lock size={14} />
            {loading ? 'Redirection…' : 'Paiement'}
          </button>

          {/* Réassurance */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
            {[
              { Icon: Lock, label: 'Paiement sécurisé' },
              { Icon: Truck, label: 'Livraison suivie' },
              { Icon: RotateCcw, label: 'Retours 14 j' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5">
                <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--brand-blue)' }} />
                <span className="text-[9px] uppercase tracking-[0.1em] opacity-55 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

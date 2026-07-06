'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, Tag, X, Check, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as pixel from '@/lib/meta-pixel';
import { validatePromoCode, type PromoValidation } from '@/app/actions/promo';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoValidation | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoChecking, setPromoChecking] = useState(false);

  const subtotal = totalPrice();
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
        <Link
          href="/shop"
          className="inline-flex mt-4 rounded-full text-white py-3 px-8 text-[11px] uppercase tracking-[0.22em] transition hover:opacity-90"
          style={{ background: 'var(--brand-blue)' }}
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const labelCls = 'text-[10px] uppercase tracking-[0.22em] opacity-60';
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] opacity-60 hover:opacity-100 transition mb-8"
      >
        <ArrowLeft size={14} />
        Continuer mes achats
      </Link>

      <div className="text-center mb-10 md:mb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] opacity-60 mb-3">Votre commande</p>
        <h1 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
          Récapitulatif
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* Articles */}
        <div className="space-y-5">
          {items.map((item) => {
            const price = item.variant?.price ?? item.product.price;
            const image = item.variant?.image || item.product.images[0];
            return (
              <div
                key={`${item.product.id}-${item.variant?.id ?? 'base'}`}
                className="flex gap-5 pb-5 border-b"
                style={{ borderColor: 'rgba(0,0,0,0.08)' }}
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                  {image && <Image src={image} alt={item.product.name} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg leading-tight" style={{ fontFamily: 'var(--font-product)' }}>
                    {item.product.name}
                  </h3>
                  {item.variant && (
                    <p className="text-xs opacity-60 mt-0.5">
                      {item.product.variant_type ? `${item.product.variant_type} : ` : ''}
                      {item.variant.name}
                    </p>
                  )}
                  <p className="text-xs opacity-60 mt-1">Quantité : {item.quantity}</p>
                </div>
                <p className="text-base whitespace-nowrap" style={{ fontFamily: 'var(--font-price)', color: 'var(--brand-blue)' }}>
                  {(price * item.quantity).toFixed(2)} €
                </p>
              </div>
            );
          })}
        </div>

        {/* Résumé */}
        <div
          className="h-fit rounded-2xl p-6 lg:sticky lg:top-24"
          style={{ background: '#FAF6EF', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <h2 className="text-xl mb-5" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
            Résumé
          </h2>

          <div className="mb-5">
            <p className={`${labelCls} mb-2`}>Code promo</p>
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
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-full bg-white" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                    <Tag size={13} className="opacity-40" />
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                      placeholder="Ton code"
                      className="flex-1 outline-none bg-transparent text-sm font-mono uppercase tracking-wide"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    disabled={!promoInput.trim() || promoChecking}
                    className="px-5 rounded-full text-[11px] uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'var(--brand-blue)' }}
                  >
                    {promoChecking ? '…' : 'Appliquer'}
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-600 mt-1.5">{promoError}</p>}
              </>
            )}
          </div>

          <div className="space-y-2.5 text-sm border-t pt-4" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="flex justify-between">
              <span className="opacity-60">Sous-total</span>
              <span style={{ fontFamily: 'var(--font-price)' }}>{subtotal.toFixed(2)} €</span>
            </div>
            {promo?.ok && discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Remise ({promo.code})</span>
                <span>−{discount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="opacity-60">Livraison</span>
              <span className="opacity-60 text-right">Calculée au paiement</span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between items-baseline" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
            <span className="text-[11px] uppercase tracking-[0.22em] opacity-70">Total</span>
            <span className="text-2xl" style={{ fontFamily: 'var(--font-price)', color: 'var(--brand-blue)' }}>
              {total.toFixed(2)} €
            </span>
          </div>

          {error && <p className="text-xs text-red-600 mt-3 text-center">{error}</p>}

          <button
            onClick={startPayment}
            disabled={loading}
            className="w-full mt-6 rounded-full text-white py-4 text-[12px] uppercase tracking-[0.22em] transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--brand-blue)' }}
          >
            <Lock size={14} />
            {loading ? 'Redirection…' : 'Paiement'}
          </button>

          <p className="text-[10px] uppercase tracking-[0.18em] opacity-40 text-center mt-3">
            Paiement 100 % sécurisé
          </p>
        </div>
      </div>
    </div>
  );
}

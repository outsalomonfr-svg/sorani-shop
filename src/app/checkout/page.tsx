'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, Lock, Tag, X, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as pixel from '@/lib/meta-pixel';
import { validatePromoCode, type PromoValidation } from '@/app/actions/promo';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
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

  const removePromo = () => {
    setPromo(null);
    setPromoError('');
  };

  const handleCheckout = async () => {
    setLoading(true);
    pixel.initiateCheckout({
      value: total,
      currency: 'EUR',
      num_items: items.length,
    });

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: email,
          promoCode: promo?.ok ? promo.code : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/shop" className="text-[#1B4965] hover:underline">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B4965] mb-8">
        <ArrowLeft size={18} />
        Continuer mes achats
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Récapitulatif</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.variant?.price ?? item.product.price;
            const image = item.variant?.image || item.product.images[0];
            return (
              <div key={`${item.product.id}-${item.variant?.id ?? 'base'}`} className="bg-white p-4 rounded-xl flex gap-4">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {image && (
                    <Image src={image} alt={item.product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-gray-500">
                      {item.product.variant_type ? `${item.product.variant_type} : ` : ''}
                      {item.variant.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                </div>
                <p className="font-semibold text-[#1B4965]">
                  {(price * item.quantity).toFixed(2)} €
                </p>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl h-fit">
          <h2 className="font-semibold text-lg mb-4">Résumé</h2>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
          />

          {/* Code promo */}
          <div className="mb-4">
            {promo?.ok ? (
              <div className="flex items-center justify-between gap-2 p-3 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center gap-2 min-w-0">
                  <Check size={14} className="text-green-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-sm text-green-800 truncate">
                      {promo.code}
                    </p>
                    {promo.description && (
                      <p className="text-xs text-green-700 truncate">{promo.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={removePromo}
                  className="p-1 rounded hover:bg-green-100 text-green-700"
                  title="Retirer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <Tag size={14} className="text-gray-400" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyPromo();
                        }
                      }}
                      placeholder="Code promo"
                      className="flex-1 outline-none text-sm font-mono uppercase tracking-wide"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    disabled={!promoInput.trim() || promoChecking}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'var(--brand-blue)' }}
                  >
                    {promoChecking ? '...' : 'Appliquer'}
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-red-600 mt-1.5">{promoError}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            {promo?.ok && discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Remise ({promo.code})</span>
                <span>−{discount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span className="text-green-600">Calculée à l’étape suivante</span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-[#1B4965]">{total.toFixed(2)} €</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 bg-[#1B4965] text-white py-3 rounded-lg font-semibold hover:bg-[#153a52] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock size={16} />
            {loading ? 'Redirection...' : 'Payer avec Stripe'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Paiement 100 % sécurisé par Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

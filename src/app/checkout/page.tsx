'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as pixel from '@/lib/meta-pixel';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    pixel.initiateCheckout({
      value: totalPrice(),
      currency: 'EUR',
      num_items: items.length,
    });

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail: email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
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
          Retour a la boutique
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

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Recapitulatif</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white p-4 rounded-xl flex gap-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-500">Quantite: {item.quantity}</p>
              </div>
              <p className="font-semibold text-[#1B4965]">
                {(item.product.price * item.quantity).toFixed(2)} EUR
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl h-fit">
          <h2 className="font-semibold text-lg mb-4">Resume</h2>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
          />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span>{totalPrice().toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span className="text-green-600">Calcule a l&apos;etape suivante</span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-[#1B4965]">{totalPrice().toFixed(2)} EUR</span>
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
            Paiement 100% securise par Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

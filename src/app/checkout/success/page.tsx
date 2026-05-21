'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import * as pixel from '@/lib/meta-pixel';

export default function SuccessPage() {
  const { items, totalPrice, clearCart } = useCart();

  useEffect(() => {
    if (items.length > 0) {
      pixel.purchase({
        value: totalPrice(),
        currency: 'EUR',
        content_ids: items.map((i) => i.product.id),
      });
      clearCart();
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Merci pour votre commande !</h1>
      <p className="text-gray-600 mb-8">
        Votre commande a bien ete enregistree. Vous recevrez un email de confirmation avec les details de votre commande.
      </p>
      <Link
        href="/shop"
        className="inline-block bg-[#1B4965] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#153a52] transition"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}

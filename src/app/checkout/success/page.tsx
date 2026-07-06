'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center" data-reveal>
      <div
        className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center text-white"
        style={{ background: '#16A34A' }}
      >
        <Check size={34} strokeWidth={2.5} />
      </div>

      <p className="text-[11px] uppercase tracking-[0.28em] opacity-60 mb-4">Commande confirmée</p>
      <h1
        className="text-4xl md:text-5xl leading-tight mb-6"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}
      >
        Merci pour votre commande&nbsp;!
      </h1>
      <div className="w-12 h-px mx-auto mb-6 bg-black/20" />
      <p className="text-sm md:text-base opacity-70 max-w-md mx-auto leading-relaxed mb-10">
        Votre commande a bien été enregistrée. Vous recevrez un email de confirmation avec tous les
        détails. Chaque bijou étant fait avec soin, nous préparons le vôtre avec amour.
      </p>

      <Link
        href="/shop"
        className="inline-flex items-center justify-center rounded-full text-white py-3.5 px-10 text-[11px] uppercase tracking-[0.22em] transition hover:opacity-90"
        style={{ background: 'var(--brand-blue)' }}
      >
        Continuer mes achats
      </Link>

      <p className="text-[11px] uppercase tracking-[0.18em] opacity-40 mt-8">
        Une question&nbsp;?{' '}
        <Link href="/contact" className="underline underline-offset-2 hover:opacity-100">
          Contacte-nous
        </Link>
      </p>
    </div>
  );
}

'use client';

import { X, Plus, Minus, ShoppingBag, Lock, Truck, RotateCcw, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart();

  if (!isOpen) return null;

  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 backdrop-blur-md"
        style={{ background: 'rgba(20, 20, 30, 0.35)', animation: 'fadeIn 0.2s ease-out forwards' }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col"
        style={{
          boxShadow: '-12px 0 40px rgba(0,0,0,0.14)',
          animation: 'slideInRight 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-xl" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-blue)' }}>
              Panier
            </h2>
            <span className="text-[11px] uppercase tracking-[0.18em] opacity-45">
              {count} article{count > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 -mr-2 rounded-full transition hover:bg-black/[0.05]"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center text-center py-20">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(56,69,173,0.07)' }}
              >
                <ShoppingBag size={26} strokeWidth={1.5} style={{ color: 'var(--brand-blue)' }} />
              </div>
              <p className="text-base mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                Votre panier est vide
              </p>
              <p className="text-sm opacity-55 mb-7 max-w-[240px]">
                Il n’attend que vos plus belles trouvailles.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex rounded-full text-white py-3 px-8 text-[11px] uppercase tracking-[0.2em] transition hover:opacity-90"
                style={{ background: 'var(--brand-blue)' }}
              >
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const linePrice = item.variant?.price ?? item.product.price;
                const image = item.variant?.image || item.product.images[0];
                const variantId = item.variant?.id ?? null;
                return (
                  <div
                    key={`${item.product.id}-${variantId ?? 'base'}`}
                    className="group relative flex gap-4 p-3 rounded-2xl transition-colors hover:bg-black/[0.015]"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                      {image && <Image src={image} alt={item.product.name} fill sizes="80px" className="object-cover" />}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[15px] leading-tight truncate" style={{ fontFamily: 'var(--font-product)' }}>
                            {item.product.name}
                          </h3>
                          {item.variant && (
                            <p className="text-xs opacity-55 mt-0.5 truncate">
                              {item.product.variant_type ? `${item.product.variant_type} : ` : ''}
                              {item.variant.name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, variantId)}
                          className="p-1 -mt-0.5 rounded-full opacity-40 hover:opacity-100 hover:bg-black/[0.05] transition"
                          aria-label="Retirer"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="mt-auto pt-2 flex items-end justify-between">
                        <div
                          className="inline-flex items-center rounded-full"
                          style={{ border: '1px solid rgba(0,0,0,0.15)' }}
                        >
                          <button
                            onClick={() => updateQuantity(item.product.id, variantId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition"
                            aria-label="Diminuer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm" style={{ fontFamily: 'var(--font-price)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, variantId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition"
                            aria-label="Augmenter"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-[15px]" style={{ fontFamily: 'var(--font-price)', color: 'var(--brand-blue)' }}>
                          {(linePrice * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 pt-4 pb-5" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-[0.22em] opacity-55">Total</span>
              <span className="text-2xl" style={{ fontFamily: 'var(--font-price)', color: 'var(--brand-blue)' }}>
                {totalPrice().toFixed(2)} €
              </span>
            </div>
            <p className="text-[11px] opacity-45 mb-4">Livraison calculée au paiement</p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full rounded-full text-white py-4 text-[12px] uppercase tracking-[0.22em] transition hover:opacity-90 active:scale-[0.99]"
              style={{ background: 'var(--brand-blue)', boxShadow: '0 8px 24px rgba(56,69,173,0.28)' }}
            >
              Commander
              <ArrowRight size={15} />
            </Link>

            <button
              onClick={closeCart}
              className="block w-full text-center text-[11px] uppercase tracking-[0.18em] opacity-50 hover:opacity-100 transition mt-3"
            >
              Continuer mes achats
            </button>

            {/* Réassurance */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              {[
                { Icon: Lock, label: 'Paiement sécurisé' },
                { Icon: Truck, label: 'Livraison suivie' },
                { Icon: RotateCcw, label: 'Retours 14 j' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon size={15} strokeWidth={1.5} style={{ color: 'var(--brand-blue)' }} />
                  <span className="text-[9px] uppercase tracking-[0.08em] opacity-55 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

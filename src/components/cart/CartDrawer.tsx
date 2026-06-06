'use client';

import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 backdrop-blur-md animate-fade-in"
        style={{ background: 'rgba(20, 20, 30, 0.35)', animation: 'fadeIn 0.2s ease-out forwards' }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col"
        style={{
          boxShadow: '-12px 0 32px rgba(0,0,0,0.12)',
          animation: 'slideInRight 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} />
            Panier ({items.length})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Votre panier est vide</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-4 inline-block text-[#1B4965] hover:underline"
              >
                Decouvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const linePrice = item.variant?.price ?? item.product.price;
                const image = item.variant?.image || item.product.images[0];
                const variantId = item.variant?.id ?? null;
                return (
                  <div key={`${item.product.id}-${variantId ?? 'base'}`} className="flex gap-4 py-3 border-b">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {image && (
                        <Image src={image} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.product.variant_type ? `${item.product.variant_type} : ` : ''}
                          {item.variant.name}
                        </p>
                      )}
                      <p className="text-[#1B4965] font-semibold text-sm mt-1">
                        {linePrice.toFixed(2)} €
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, variantId, item.quantity - 1)}
                          className="p-1 border rounded hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, variantId, item.quantity + 1)}
                          className="p-1 border rounded hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, variantId)}
                      className="text-gray-400 hover:text-red-500 self-start"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{totalPrice().toFixed(2)} EUR</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-[#1B4965] text-white text-center py-3 rounded-lg hover:bg-[#153a52] transition font-medium"
            >
              Commander
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

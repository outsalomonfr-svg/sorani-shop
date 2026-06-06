'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

// Une "ligne" du panier est identifiée par product.id + variant.id (sinon juste product.id)
function lineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

function itemKey(item: CartItem): string {
  return lineKey(item.product.id, item.variant?.id);
}

function effectivePrice(item: CartItem): number {
  return item.variant?.price ?? item.product.price;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const items = get().items;
        const key = lineKey(product.id, variant?.id);
        const existing = items.find((i) => itemKey(i) === key);

        if (existing) {
          set({
            items: items.map((i) =>
              itemKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...items, { product, variant: variant ?? null, quantity }] });
        }
      },

      removeItem: (productId, variantId) => {
        const key = lineKey(productId, variantId);
        set({ items: get().items.filter((i) => itemKey(i) !== key) });
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        const key = lineKey(productId, variantId);
        set({
          items: get().items.map((i) => (itemKey(i) === key ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + effectivePrice(i) * i.quantity, 0),
    }),
    { name: 'sorani-cart' }
  )
);

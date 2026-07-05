'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { Product, ProductVariant } from '@/types';

// Forme minimale nécessaire à l'ajout au panier — satisfaite par Product
// et par le DTO d'accueil enrichi.
export type QuickAddProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  variant_type?: string | null;
  variants?: ProductVariant[] | null;
  show_add_to_cart?: boolean;
};

/**
 * Bouton d'ajout rapide au panier, à poser sur une carte produit.
 * - Produit avec options (variant_type) → lien vers la fiche pour choisir
 * - Rupture de stock → désactivé
 * - Option "bouton panier masqué" (show_add_to_cart=false) → rien affiché
 * IMPORTANT: doit être placé EN DEHORS du <Link> de la carte (pas d'imbrication d'éléments interactifs).
 */
export default function QuickAddButton({
  product,
  className = '',
}: {
  product: QuickAddProduct;
  className?: string;
}) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  // Option désactivée depuis l'admin
  if (product.show_add_to_cart === false) return null;

  const hasOptions = Boolean(product.variant_type) || (product.variants?.length ?? 0) > 0;
  const outOfStock = product.stock === 0;

  const base =
    'flex items-center justify-center gap-1.5 rounded-full text-[10px] uppercase tracking-[0.14em] shadow-sm transition-all hover:shadow-md';

  // Produit à options → on renvoie vers la fiche pour choisir la variante
  if (hasOptions) {
    return (
      <Link
        href={`/shop/product/${product.slug}`}
        className={`${base} text-white ${className}`}
        style={{ background: 'var(--brand-blue)' }}
      >
        <SlidersHorizontal size={13} />
        Choisir
      </Link>
    );
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || added) return;
    // La forme minimale couvre tout ce que lit le panier (id, name, price, images…)
    addItem(product as unknown as Product, null, 1);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      className={`${base} text-white disabled:opacity-60 ${className}`}
      style={{ background: outOfStock ? '#9CA3AF' : 'var(--brand-blue)' }}
      aria-label={`Ajouter ${product.name} au panier`}
    >
      {outOfStock ? (
        'Rupture'
      ) : added ? (
        <>
          <Check size={13} /> Ajouté
        </>
      ) : (
        <>
          <ShoppingBag size={13} /> Ajouter
        </>
      )}
    </button>
  );
}

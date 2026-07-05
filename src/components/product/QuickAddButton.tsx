'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { DEFAULT_SETTINGS } from '@/types/site-settings';
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

const RADIUS: Record<string, string> = {
  full: 'rounded-full',
  md: 'rounded-lg',
  square: 'rounded-none',
};

/**
 * Bouton d'ajout rapide au panier, à poser sur une carte produit.
 * Design & apparition pilotés depuis l'admin (customizer → "Bouton panier").
 * IMPORTANT: doit être placé EN DEHORS du <Link> de la carte.
 */
export default function QuickAddButton({
  product,
  className = '',
}: {
  product: QuickAddProduct;
  className?: string;
}) {
  const settings = useSiteSettings();
  const qa = settings.quickAdd ?? DEFAULT_SETTINGS.quickAdd!;
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  // Désactivé globalement depuis l'admin, ou masqué pour ce produit
  if (!qa.enabled || product.show_add_to_cart === false) return null;

  const hasOptions = Boolean(product.variant_type) || (product.variants?.length ?? 0) > 0;
  const outOfStock = product.stock === 0;

  // Classes d'apparition : au survol (ordi) ou toujours visible
  const reveal = qa.alwaysVisible
    ? 'opacity-100'
    : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100';

  const base = `flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.14em] shadow-sm transition-all hover:shadow-md ${RADIUS[qa.radius] || 'rounded-full'} ${reveal} ${className}`;

  // Style plein ou contour
  const solidStyle: CSSProperties = { background: qa.bgColor, color: qa.textColor };
  const outlineStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.92)',
    color: qa.bgColor,
    border: `1px solid ${qa.bgColor}`,
  };
  const designStyle = qa.style === 'outline' ? outlineStyle : solidStyle;

  // Produit à options → lien vers la fiche pour choisir la variante
  if (hasOptions) {
    return (
      <Link href={`/shop/product/${product.slug}`} className={base} style={designStyle}>
        <SlidersHorizontal size={13} />
        {qa.chooseLabel}
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
      className={`${base} disabled:opacity-60`}
      style={outOfStock ? { background: '#9CA3AF', color: '#fff' } : designStyle}
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
          <ShoppingBag size={13} /> {qa.addLabel}
        </>
      )}
    </button>
  );
}

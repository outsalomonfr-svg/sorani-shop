'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, ExternalLink, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { revalidatePublic } from '@/app/actions/revalidate';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
};

export default function FeaturedProductPicker() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, images, is_featured, is_active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFeatured = async (id: string, current: boolean) => {
    setBusyId(id);
    const supabase = createClient();
    await supabase.from('products').update({ is_featured: !current }).eq('id', id);
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, is_featured: !current } : p)));
    // Rafraîchit l'accueil tout de suite (plus d'attente de ~5 min)
    await revalidatePublic().catch(() => {});
    setBusyId(null);
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const featuredCount = products.filter((p) => p.is_featured).length;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: 'var(--admin-text)' }}>
            Produits à mettre en avant
          </p>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full"
            style={{
              background: featuredCount > 0 ? '#FEF2F2' : 'var(--admin-hover)',
              color: featuredCount > 0 ? '#DC2626' : 'var(--admin-text-muted)',
            }}
          >
            {featuredCount} sélectionné{featuredCount > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border-strong)' }}>
          <Search size={12} style={{ color: 'var(--admin-text-faint)' }} />
          <input
            type="text"
            placeholder="Rechercher un produit…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: 'var(--admin-text)' }}
          />
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto admin-scroll p-1">
        {loading ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
            {products.length === 0 ? (
              <>
                Aucun produit. <Link href="/admin/products/new" className="underline font-medium" style={{ color: 'var(--brand-blue)' }}>Créer un produit</Link>
              </>
            ) : (
              'Aucun produit ne correspond.'
            )}
          </div>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleFeatured(p.id, p.is_featured)}
              disabled={busyId === p.id}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left hover:bg-black/[0.04] transition disabled:opacity-50"
            >
              <div
                className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 relative"
                style={{ background: 'var(--admin-hover)' }}
              >
                {p.images?.[0] && (
                  <Image src={p.images[0]} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                  {p.name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--admin-text-muted)' }}>
                  {p.price.toFixed(2)} € {!p.is_active && '• inactif'}
                </p>
              </div>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition"
                style={{
                  background: p.is_featured ? '#FECACA' : 'transparent',
                  color: p.is_featured ? '#DC2626' : 'var(--admin-text-faint)',
                }}
              >
                <Heart size={13} fill={p.is_featured ? 'currentColor' : 'none'} />
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
        <Link
          href="/admin/products/new"
          className="text-xs font-medium flex items-center gap-1 hover:underline"
          style={{ color: 'var(--brand-blue)' }}
        >
          <Plus size={12} />
          Créer un produit
        </Link>
        <Link
          href="/admin/products"
          target="_blank"
          className="text-xs flex items-center gap-1 hover:underline"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          Tout gérer
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}

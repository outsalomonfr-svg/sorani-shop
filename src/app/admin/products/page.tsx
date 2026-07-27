'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  GripVertical,
  ShoppingCart,
  Copy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { revalidatePublic } from '@/app/actions/revalidate';
import { useToast } from '@/components/admin/Toast';
import type { Product } from '@/types';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  EmptyState,
  Table,
  THead,
  Th,
  Tr,
  Td,
  LoadingState,
} from '@/components/admin/ui';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });
    // Tri par ordre d'affichage manuel si la colonne existe (sinon ordre par défaut)
    const sorted = (data || []).sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    setProducts(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('products').update({ is_active: !isActive }).eq('id', id);
    await revalidatePublic().catch(() => {});
    fetchProducts();
  };

  const toggleAddToCart = async (id: string, current: boolean) => {
    // Optimiste : on met à jour l'UI tout de suite
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, show_add_to_cart: !current } : p))
    );
    const supabase = createClient();
    await supabase.from('products').update({ show_add_to_cart: !current }).eq('id', id);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  // Duplique une fiche produit (+ ses variantes), en brouillon, puis ouvre l'édition.
  const duplicateProduct = async (id: string) => {
    setDuplicatingId(id);
    const supabase = createClient();
    try {
      // 1. Copie complète de la fiche source (toutes les colonnes)
      const { data: full, error: readErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (readErr || !full) throw new Error(readErr?.message || 'produit introuvable');

      const src = full as Record<string, unknown>;
      // On retire les champs propres à la ligne d'origine
      const {
        id: _id,
        created_at: _c,
        updated_at: _u,
        display_order: _d,
        ...rest
      } = src;
      void _id; void _c; void _u; void _d;

      const suffix = Date.now().toString(36).slice(-5);
      const newProduct = {
        ...rest,
        name: `${String(full.name || 'Produit').trim()} (copie)`,
        slug: `${String(full.slug || 'produit')}-copie-${suffix}`,
        is_active: false, // brouillon : invisible sur la boutique tant que non publié
        is_featured: false,
      };

      const { data: inserted, error: insErr } = await supabase
        .from('products')
        .insert(newProduct)
        .select('id')
        .single();
      if (insErr || !inserted) throw new Error(insErr?.message || 'création impossible');

      // 2. Copie des variantes éventuelles
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id);
      if (variants && variants.length > 0) {
        const copies = variants.map((v) => {
          const {
            id: _vid,
            product_id: _pid,
            created_at: _vc,
            updated_at: _vu,
            ...vrest
          } = v as Record<string, unknown>;
          void _vid; void _pid; void _vc; void _vu;
          return { ...vrest, product_id: inserted.id };
        });
        await supabase.from('product_variants').insert(copies);
      }

      toast('Fiche dupliquée — à toi de la personnaliser puis publier');
      router.push(`/admin/products/${inserted.id}`);
    } catch (e) {
      setDuplicatingId(null);
      toast('Duplication impossible : ' + (e instanceof Error ? e.message : 'erreur'), 'error');
    }
  };

  // --- Glisser-déposer pour réordonner ---
  const handleDrop = async (targetIdx: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from === null || from === targetIdx) return;

    const reordered = [...products];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(targetIdx, 0, moved);
    setProducts(reordered);

    // Persiste le nouvel ordre (display_order = position dans la liste)
    setSavingOrder(true);
    const supabase = createClient();
    await Promise.all(
      reordered.map((p, i) =>
        p.display_order === i
          ? Promise.resolve()
          : supabase.from('products').update({ display_order: i }).eq('id', p.id)
      )
    );
    setProducts((prev) => prev.map((p, i) => ({ ...p, display_order: i })));
    setSavingOrder(false);
  };

  return (
    <div>
      <PageHeader
        title="Produits"
        description={`${products.length} produit${products.length > 1 ? 's' : ''} dans ton catalogue`}
        action={
          <Button href="/admin/products/new" variant="primary" icon={Plus}>
            Ajouter un produit
          </Button>
        }
      />

      {products.length > 0 && (
        <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: 'var(--admin-text-muted)' }}>
          <GripVertical size={13} />
          Glisse une ligne pour changer l’ordre d’affichage sur la boutique.
          {savingOrder && <span style={{ color: 'var(--brand-blue)' }}>· Enregistrement…</span>}
        </p>
      )}

      <Card noPadding>
        {loading ? (
          <LoadingState />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucun produit"
            description="Commence par ajouter ton premier bijou au catalogue."
            action={
              <Button href="/admin/products/new" variant="primary" icon={Plus} size="sm">
                Ajouter un produit
              </Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <Th> </Th>
              <Th>Produit</Th>
              <Th>Prix</Th>
              <Th>Stock</Th>
              <Th>Catégorie</Th>
              <Th align="center">Bouton panier</Th>
              <Th>Statut</Th>
              <Th align="right">Actions</Th>
            </THead>
            <tbody>
              {products.map((product, idx) => {
                const cartOn = product.show_add_to_cart !== false;
                return (
                  <Tr
                    key={product.id}
                    isFirst={idx === 0}
                    draggable
                    onDragStart={() => {
                      dragIndex.current = idx;
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (overIndex !== idx) setOverIndex(idx);
                    }}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={() => {
                      dragIndex.current = null;
                      setOverIndex(null);
                    }}
                    className="cursor-grab active:cursor-grabbing"
                    style={
                      overIndex === idx
                        ? { background: 'var(--admin-hover)', boxShadow: 'inset 0 2px 0 var(--brand-blue)' }
                        : undefined
                    }
                  >
                    <Td>
                      <GripVertical size={15} style={{ color: 'var(--admin-text-faint)' }} />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--admin-hover)' }}
                        >
                          {product.images[0] && (
                            <Image
                              src={product.images[0]}
                              alt=""
                              fill
                              draggable={false}
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--admin-text)' }}>
                          {product.name}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--admin-text)' }}>{product.price.toFixed(2)} €</span>
                    </Td>
                    <Td>
                      {product.stock <= 5 ? (
                        <Badge variant="warning">{product.stock} restants</Badge>
                      ) : (
                        <span style={{ color: 'var(--admin-text)' }}>{product.stock}</span>
                      )}
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--admin-text-muted)' }}>
                        {product.category?.name || '—'}
                      </span>
                    </Td>
                    <Td align="center">
                      <button
                        onClick={() => toggleAddToCart(product.id, cartOn)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition"
                        style={{
                          background: cartOn ? '#E8F5E9' : 'var(--admin-hover)',
                          color: cartOn ? '#1B5E20' : 'var(--admin-text-faint)',
                        }}
                        title={
                          cartOn
                            ? 'Bouton « Ajouter au panier » visible — cliquer pour masquer'
                            : 'Bouton masqué — cliquer pour afficher'
                        }
                      >
                        <ShoppingCart size={13} />
                        {cartOn ? 'Visible' : 'Masqué'}
                      </button>
                    </Td>
                    <Td>
                      {product.is_active ? (
                        <Badge variant="success">Actif</Badge>
                      ) : (
                        <Badge variant="muted">Brouillon</Badge>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className="p-1.5 rounded-md hover:bg-black/[0.04]"
                          style={{ color: 'var(--admin-text-muted)' }}
                          title={product.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {product.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}`}
                          draggable={false}
                          className="p-1.5 rounded-md hover:bg-black/[0.04]"
                          style={{ color: 'var(--admin-text-muted)' }}
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => duplicateProduct(product.id)}
                          disabled={duplicatingId === product.id}
                          className="p-1.5 rounded-md hover:bg-black/[0.04] disabled:opacity-50"
                          style={{ color: 'var(--admin-text-muted)' }}
                          title="Dupliquer cette fiche"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 rounded-md hover:bg-[#FEF2F2]"
                          style={{ color: 'var(--admin-text-muted)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

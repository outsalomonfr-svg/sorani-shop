'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('products').update({ is_active: !isActive }).eq('id', id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
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
              <Th>Produit</Th>
              <Th>Prix</Th>
              <Th>Stock</Th>
              <Th>Catégorie</Th>
              <Th>Statut</Th>
              <Th align="right">Actions</Th>
            </THead>
            <tbody>
              {products.map((product, idx) => (
                <Tr key={product.id} isFirst={idx === 0}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div
                        className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--admin-hover)' }}
                      >
                        {product.images[0] && (
                          <Image src={product.images[0]} alt="" fill className="object-cover" />
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
                        className="p-1.5 rounded-md hover:bg-black/[0.04]"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        <Edit size={14} />
                      </Link>
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
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

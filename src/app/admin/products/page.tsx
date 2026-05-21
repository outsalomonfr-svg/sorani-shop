'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

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

  useEffect(() => { fetchProducts(); }, []);

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

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produits</h1>
          <p className="text-gray-600">{products.length} produit(s)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#1B4965] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#153a52] transition"
        >
          <Plus size={18} />
          Ajouter un produit
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Categorie</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucun produit. Commencez par en ajouter un !
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.price.toFixed(2)} EUR</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={product.stock <= 5 ? 'text-red-600 font-medium' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(product.id, product.is_active)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title={product.is_active ? 'Desactiver' : 'Activer'}
                      >
                        {product.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link href={`/admin/products/${product.id}`} className="p-2 text-gray-400 hover:text-[#1B4965]">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    images: [''],
    category_id: '',
    stock: '10',
    is_active: true,
    is_featured: false,
    materials: '',
    weight: '',
    dimensions: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm({ ...form, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from('products').insert({
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      images: form.images.filter(Boolean),
      category_id: form.category_id || null,
      stock: parseInt(form.stock),
      is_active: form.is_active,
      is_featured: form.is_featured,
      materials: form.materials || null,
      weight: form.weight || null,
      dimensions: form.dimensions || null,
    });

    if (!error) {
      router.push('/admin/products');
    } else {
      alert('Erreur: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B4965] mb-6">
        <ArrowLeft size={18} />
        Retour aux produits
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-8">Nouveau produit</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Informations generales</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
            >
              <option value="">Sans categorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materiaux</label>
            <input
              type="text"
              value={form.materials}
              onChange={(e) => setForm({ ...form, materials: e.target.value })}
              placeholder="Ex: Or 18k, Argent 925..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Prix et stock</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (EUR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ancien prix (barre)</label>
              <input
                type="number"
                step="0.01"
                value={form.compare_at_price}
                onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Images</h2>
          <p className="text-sm text-gray-500">Collez les URLs des images du produit</p>

          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={img}
                onChange={(e) => {
                  const newImages = [...form.images];
                  newImages[i] = e.target.value;
                  setForm({ ...form, images: newImages });
                }}
                placeholder="https://..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm({ ...form, images: [...form.images, ''] })}
            className="text-[#1B4965] text-sm hover:underline"
          >
            + Ajouter une image
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Options</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Produit actif (visible sur le site)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Coup de coeur (affiche en page d&apos;accueil)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B4965] text-white py-3 rounded-lg font-semibold hover:bg-[#153a52] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Enregistrement...' : 'Creer le produit'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types';
import { PageHeader, Card, CardHeader, Button, Label, Input, Textarea } from '@/components/admin/ui';
import ImageUpload from '@/components/admin/ImageUpload';

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
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setForm({ ...form, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.from('products').insert({
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
    }).select().single();

    if (!error && data) {
      // Redirige vers la page d'édition pour pouvoir ajouter des variantes
      router.push(`/admin/products/${data.id}`);
    } else {
      alert('Erreur: ' + (error?.message || 'Erreur inconnue'));
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs mb-4 transition"
        style={{ color: 'var(--admin-text-muted)' }}
      >
        <ArrowLeft size={13} />
        Retour aux produits
      </Link>

      <PageHeader title="Nouveau produit" description="Ajoute un bijou à ton catalogue." />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        <Card noPadding>
          <CardHeader title="Informations générales" />
          <div className="p-5 space-y-4">
            <div>
              <Label>Nom du produit</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  background: 'var(--admin-surface)',
                  border: '1px solid var(--admin-border-strong)',
                  color: 'var(--admin-text)',
                }}
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Matériaux</Label>
              <Input
                value={form.materials}
                onChange={(e) => setForm({ ...form, materials: e.target.value })}
                placeholder="Or 18k, Argent 925…"
              />
            </div>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Prix et stock" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Prix (€)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Ancien prix (barré)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.compare_at_price}
                onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Stock disponible</Label>
              <Input
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Images" description="La première image est la principale" />
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.images.map((img, i) => (
                <ImageUpload
                  key={i}
                  value={img}
                  folder="products"
                  aspectRatio="square"
                  onChange={(url) => {
                    const newImages = [...form.images];
                    newImages[i] = url;
                    setForm({ ...form, images: newImages });
                  }}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() => setForm({ ...form, images: [...form.images, ''] })}
            >
              Ajouter un emplacement
            </Button>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Options" />
          <div className="p-5 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded accent-[#1B4965]"
              />
              <span className="text-sm" style={{ color: 'var(--admin-text)' }}>
                Produit actif (visible sur le site)
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded accent-[#1B4965]"
              />
              <span className="text-sm" style={{ color: 'var(--admin-text)' }}>
                Coup de cœur (affiché en page d’accueil)
              </span>
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" href="/admin/products">
            Annuler
          </Button>
          <Button variant="primary" type="submit" icon={Save} disabled={loading}>
            {loading ? 'Enregistrement…' : 'Créer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
}

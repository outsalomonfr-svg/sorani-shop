'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { revalidatePublic } from '@/app/actions/revalidate';
import { ensureUniqueProductSlug } from '@/lib/unique-slug';
import type { Category, Product } from '@/types';
import { PageHeader, Card, CardHeader, Button, Label, Input, Textarea } from '@/components/admin/ui';
import ImageUpload from '@/components/admin/ImageUpload';
import ProductVariantsEditor from '@/components/admin/ProductVariantsEditor';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const [productRes, catsRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('*').order('name'),
      ]);
      if (productRes.data) {
        setForm(productRes.data as Product);
      }
      setCategories(catsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const update = (patch: Partial<Product>) => setForm({ ...form, ...patch });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const uniqueSlug = await ensureUniqueProductSlug(supabase, form.slug || form.name || '', id);
    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        slug: uniqueSlug,
        description: form.description,
        price: form.price,
        compare_at_price: form.compare_at_price || null,
        images: (form.images || []).filter(Boolean),
        category_id: form.category_id || null,
        stock: form.stock,
        is_active: form.is_active,
        is_featured: form.is_featured,
        materials: form.materials || null,
        weight: form.weight || null,
        dimensions: form.dimensions || null,
        variant_type: form.variant_type || null,
      })
      .eq('id', id);
    if (!error) {
      await revalidatePublic().catch(() => {});
      router.push('/admin/products');
    } else {
      alert(`Erreur: ${error.message}`);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement « ${form.name} » et toutes ses variantes ?`)) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    router.push('/admin/products');
  };

  if (loading) {
    return <div className="text-center py-12 text-sm" style={{ color: 'var(--admin-text-muted)' }}>Chargement…</div>;
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs mb-4"
        style={{ color: 'var(--admin-text-muted)' }}
      >
        <ArrowLeft size={13} />
        Retour aux produits
      </Link>

      <PageHeader
        title={form.name || 'Produit'}
        description={form.slug ? `/${form.slug}` : ''}
        action={
          <div className="flex gap-2">
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        <Card noPadding>
          <CardHeader title="Informations générales" />
          <div className="p-5 space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name || ''} onChange={(e) => update({ name: e.target.value })} required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug || ''} onChange={(e) => update({ slug: e.target.value })} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={4} value={form.description || ''} onChange={(e) => update({ description: e.target.value })} />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={form.category_id || ''}
                onChange={(e) => update({ category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border-strong)', color: 'var(--admin-text)' }}
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Matériaux</Label>
              <Input value={form.materials || ''} onChange={(e) => update({ materials: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Prix et stock par défaut" description="Les variantes peuvent surcharger ces valeurs" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Prix (€)</Label>
              <Input type="number" step="0.01" required value={form.price ?? ''} onChange={(e) => update({ price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Ancien prix (barré)</Label>
              <Input type="number" step="0.01" value={form.compare_at_price ?? ''} onChange={(e) => update({ compare_at_price: e.target.value ? parseFloat(e.target.value) : undefined })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Stock par défaut</Label>
              <Input type="number" required value={form.stock ?? 0} onChange={(e) => update({ stock: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Variantes (couleur, taille, etc.)" description="Définis les déclinaisons : matière, longueur, couleur…" />
          <div className="p-5">
            <ProductVariantsEditor
              productId={id}
              variantType={form.variant_type || ''}
              onVariantTypeChange={(t) => update({ variant_type: t })}
              basePrice={Number(form.price || 0)}
            />
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Images" description="La 1re photo est la principale (vignette). Utilise les flèches pour changer l’ordre." />
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(form.images || []).map((img, i) => {
                const images = form.images || [];
                const move = (to: number) => {
                  if (to < 0 || to >= images.length) return;
                  const next = [...images];
                  const [m] = next.splice(i, 1);
                  next.splice(to, 0, m);
                  update({ images: next });
                };
                return (
                  <div key={i} className="relative">
                    {i === 0 && img && (
                      <span
                        className="absolute top-1.5 left-1.5 z-10 text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium"
                        style={{ background: 'var(--brand-blue)', color: '#fff' }}
                      >
                        Principale
                      </span>
                    )}
                    <ImageUpload
                      value={img}
                      folder="products"
                      aspectRatio="square"
                      onChange={(url) => {
                        const next = [...images];
                        next[i] = url;
                        update({ images: next });
                      }}
                    />
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => move(i - 1)}
                        disabled={i === 0}
                        title="Déplacer avant"
                        className="p-1 rounded hover:bg-black/[0.05] disabled:opacity-25 disabled:cursor-not-allowed"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i + 1)}
                        disabled={i === images.length - 1}
                        title="Déplacer après"
                        className="p-1 rounded hover:bg-black/[0.05] disabled:opacity-25 disabled:cursor-not-allowed"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        <ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => update({ images: images.filter((_, k) => k !== i) })}
                        title="Retirer cette photo"
                        className="p-1 rounded hover:bg-[#FEF2F2]"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => update({ images: [...(form.images || []), ''] })}>
              Ajouter un emplacement
            </Button>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader title="Options" />
          <div className="p-5 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => update({ is_active: e.target.checked })} className="rounded accent-[#1B4965]" />
              <span className="text-sm" style={{ color: 'var(--admin-text)' }}>Produit actif (visible sur le site)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.is_featured ?? false} onChange={(e) => update({ is_featured: e.target.checked })} className="rounded accent-[#1B4965]" />
              <span className="text-sm" style={{ color: 'var(--admin-text)' }}>Coup de cœur (affiché en page d’accueil)</span>
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" href="/admin/products">Annuler</Button>
          <Button variant="primary" type="submit" icon={Save} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

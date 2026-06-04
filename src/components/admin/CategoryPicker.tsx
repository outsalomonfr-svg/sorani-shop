'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Trash2, GripVertical, Eye, EyeOff, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoryPicker({
  hiddenSlugs,
  onChangeHidden,
}: {
  hiddenSlugs: string[];
  onChangeHidden: (slugs: string[]) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('name');
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleVisible = (slug: string) => {
    const set = new Set(hiddenSlugs);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    onChangeHidden(Array.from(set));
  };

  const createCategory = async () => {
    if (!newName.trim()) return;
    const slug = slugify(newName);
    if (!slug) return;
    setBusy('new');
    const supabase = createClient();
    const { error } = await supabase.from('categories').insert({ name: newName.trim(), slug });
    if (!error) {
      setNewName('');
      await fetchCategories();
    } else if (error.code === '23505') {
      alert('Une catégorie avec ce nom existe déjà.');
    } else {
      alert(`Erreur : ${error.message}`);
    }
    setBusy(null);
  };

  const saveRename = async (id: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    setBusy(id);
    const supabase = createClient();
    await supabase.from('categories').update({ name: editingName.trim() }).eq('id', id);
    setEditingId(null);
    await fetchCategories();
    setBusy(null);
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie « ${name} » ? Les produits associés ne seront plus liés à une catégorie.`)) return;
    setBusy(id);
    const supabase = createClient();
    await supabase.from('categories').delete().eq('id', id);
    await fetchCategories();
    setBusy(null);
  };

  const visibleCount = categories.filter((c) => !hiddenSlugs.includes(c.slug)).length;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium" style={{ color: 'var(--admin-text)' }}>
            Catégories affichées
          </p>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--admin-hover)', color: 'var(--admin-text-muted)' }}
          >
            {visibleCount} / {categories.length}
          </span>
        </div>
      </div>

      <div className="max-h-[280px] overflow-y-auto admin-scroll p-1">
        {loading ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--admin-text-muted)' }}>Chargement…</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
            Aucune catégorie pour l’instant. Crée la première ci-dessous.
          </div>
        ) : (
          categories.map((cat) => {
            const hidden = hiddenSlugs.includes(cat.slug);
            const isEditing = editingId === cat.id;
            return (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md group hover:bg-black/[0.03] transition"
                style={{ opacity: hidden ? 0.5 : 1 }}
              >
                <GripVertical size={11} style={{ color: 'var(--admin-text-faint)' }} />
                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(cat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 px-1.5 py-0.5 text-xs rounded outline-none"
                      style={{
                        background: 'var(--admin-surface)',
                        border: '1px solid var(--brand-blue)',
                        color: 'var(--admin-text)',
                      }}
                    />
                    <button onClick={() => saveRename(cat.id)} className="p-1 rounded text-green-600 hover:bg-green-50">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-black/[0.04]" style={{ color: 'var(--admin-text-muted)' }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--admin-text)' }}>{cat.name}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--admin-text-faint)' }}>/{cat.slug}</p>
                    </button>
                    <button
                      onClick={() => toggleVisible(cat.slug)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/[0.04] transition"
                      style={{ color: 'var(--admin-text-muted)' }}
                      title={hidden ? 'Afficher' : 'Masquer'}
                    >
                      {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      disabled={busy === cat.id}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#FEF2F2] transition disabled:opacity-30"
                      style={{ color: 'var(--admin-text-muted)' }}
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New category */}
      <div className="border-t p-2" style={{ borderColor: 'var(--admin-border)' }}>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createCategory();
            }}
            placeholder="Nouvelle catégorie (ex : Pendentifs)"
            className="flex-1 px-2 py-1.5 text-xs rounded outline-none"
            style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border-strong)',
              color: 'var(--admin-text)',
            }}
          />
          <button
            onClick={createCategory}
            disabled={!newName.trim() || busy === 'new'}
            className="px-2 py-1.5 rounded text-xs font-medium text-white disabled:opacity-50"
            style={{ background: 'var(--brand-blue)' }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-t flex items-center justify-end" style={{ borderColor: 'var(--admin-border)' }}>
        <Link
          href="/admin/products"
          target="_blank"
          className="text-xs flex items-center gap-1 hover:underline"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          Associer aux produits
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ProductVariant } from '@/types';
import { Label, Input, Button } from '@/components/admin/ui';
import ImageUpload from './ImageUpload';

const TYPE_PRESETS = [
  'Taille',
  'Couleur',
  'Matériau',
  'Longueur',
  'Finition',
  'Style',
];

export default function ProductVariantsEditor({
  productId,
  variantType,
  onVariantTypeChange,
  basePrice,
}: {
  productId: string | null;
  variantType: string;
  onVariantTypeChange: (t: string) => void;
  basePrice: number;
}) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Charge les variantes
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('position', { ascending: true });
      setVariants((data as ProductVariant[]) || []);
      setLoading(false);
    })();
  }, [productId]);

  if (!productId) {
    return (
      <div
        className="p-4 rounded-lg text-center text-sm"
        style={{ background: 'var(--admin-bg)', border: '1px dashed var(--admin-border-strong)', color: 'var(--admin-text-muted)' }}
      >
        Enregistre d’abord le produit pour pouvoir ajouter des variantes.
      </div>
    );
  }

  const addVariant = async () => {
    setBusy('new');
    const supabase = createClient();
    const newVariant = {
      product_id: productId,
      name: variants.length === 0 ? 'Variante 1' : `Variante ${variants.length + 1}`,
      stock: 0,
      position: variants.length,
      is_active: true,
    };
    const { data, error } = await supabase
      .from('product_variants')
      .insert(newVariant)
      .select()
      .single();
    if (!error && data) {
      setVariants([...variants, data as ProductVariant]);
    }
    setBusy(null);
  };

  const updateVariant = async (id: string, patch: Partial<ProductVariant>) => {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    const supabase = createClient();
    await supabase.from('product_variants').update(patch).eq('id', id);
  };

  const deleteVariant = async (id: string, name: string) => {
    if (!confirm(`Supprimer la variante « ${name} » ?`)) return;
    setBusy(id);
    const supabase = createClient();
    await supabase.from('product_variants').delete().eq('id', id);
    setVariants((vs) => vs.filter((v) => v.id !== id));
    setBusy(null);
  };

  const reorder = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const next = [...variants];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const reindexed = next.map((v, i) => ({ ...v, position: i }));
    setVariants(reindexed);
    const supabase = createClient();
    await Promise.all(
      reindexed.map((v) =>
        supabase.from('product_variants').update({ position: v.position }).eq('id', v.id)
      )
    );
  };

  const isColorVariant = variantType.toLowerCase().includes('couleur');

  return (
    <div className="space-y-3">
      {/* Type de variante */}
      <div
        className="p-3 rounded-lg mb-1"
        style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}
      >
        <p className="text-[12px] leading-relaxed" style={{ color: '#1D4ED8' }}>
          <strong>Comment ça marche :</strong> le « type » est la question posée au client
          (ex. <em>Couleur</em>, <em>Pendentif</em>, <em>Taille</em>). Ajoute ensuite chaque
          <strong> option</strong> en dessous (ex. <em>Or</em>, <em>Argent</em>) avec son prix et son stock.
        </p>
      </div>
      <div>
        <Label>Type de variante — la question posée au client</Label>
        <Input
          value={variantType}
          onChange={(e) => onVariantTypeChange(e.target.value)}
          placeholder="Ex. Couleur, Pendentif, Taille…"
          list="variant-type-presets"
        />
        <datalist id="variant-type-presets">
          {TYPE_PRESETS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>
          Laisse vide si le produit n’a pas de variante.
        </p>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--admin-text-muted)' }}>
          Chargement…
        </p>
      ) : variants.length === 0 ? (
        <div
          className="p-4 rounded-lg text-center text-sm"
          style={{ background: 'var(--admin-bg)', border: '1px dashed var(--admin-border-strong)', color: 'var(--admin-text-muted)' }}
        >
          Aucune variante. Clique sur « Ajouter une variante ».
        </div>
      ) : (
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div
              key={v.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) reorder(dragIdx, i);
                setDragIdx(null);
              }}
              onDragEnd={() => setDragIdx(null)}
              className="p-3 rounded-lg"
              style={{
                background: 'var(--admin-bg)',
                border: '1px solid var(--admin-border)',
                opacity: dragIdx === i ? 0.4 : v.is_active ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <GripVertical size={13} style={{ color: 'var(--admin-text-faint)', cursor: 'grab' }} />
                <Input
                  placeholder={variantType ? `Nom de l'option (ex. Or)` : "Nom de l'option"}
                  value={v.name}
                  onChange={(e) => updateVariant(v.id, { name: e.target.value })}
                  className="font-medium"
                />
                <button
                  onClick={() => updateVariant(v.id, { is_active: !v.is_active })}
                  className="p-1 text-xs rounded hover:bg-black/[0.04]"
                  style={{ color: 'var(--admin-text-muted)' }}
                  title={v.is_active ? 'Désactiver' : 'Activer'}
                >
                  {v.is_active ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => deleteVariant(v.id, v.name)}
                  disabled={busy === v.id}
                  className="p-1 rounded hover:bg-[#FEF2F2]"
                  style={{ color: 'var(--admin-text-muted)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Prix (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={v.price ?? ''}
                    onChange={(e) =>
                      updateVariant(v.id, { price: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    placeholder={basePrice.toFixed(2)}
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(v.id, { stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={v.sku || ''}
                    onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                    placeholder="OPT-001"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {isColorVariant && (
                <div className="mt-2 flex items-center gap-2">
                  <Label>Pastille couleur</Label>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-7 h-7 rounded-md border relative overflow-hidden"
                      style={{
                        background: v.color_hex || '#cccccc',
                        borderColor: 'var(--admin-border-strong)',
                      }}
                    >
                      <input
                        type="color"
                        value={v.color_hex || '#cccccc'}
                        onChange={(e) => updateVariant(v.id, { color_hex: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={v.color_hex || ''}
                      onChange={(e) => updateVariant(v.id, { color_hex: e.target.value })}
                      placeholder="#1B4965"
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="mt-2">
                <Label>Image spécifique (optionnel)</Label>
                <ImageUpload
                  value={v.image || ''}
                  onChange={(url) => updateVariant(v.id, { image: url })}
                  folder="variants"
                  aspectRatio="square"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="ghost" size="sm" icon={Plus} onClick={addVariant} disabled={busy === 'new'}>
        Ajouter une variante
      </Button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { PromoCode } from '@/types';
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Badge,
  EmptyState,
  Label,
  Input,
  Textarea,
  LoadingState,
} from '@/components/admin/ui';

export default function AdminPromosPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>('new'); // 'new' = formulaire d'ajout visible
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCodes = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setCodes((data as PromoCode[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleActive = async (id: string, current: boolean) => {
    setBusy(id);
    const supabase = createClient();
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id);
    setCodes((cs) => cs.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
    setBusy(null);
  };

  const deleteCode = async (id: string, code: string) => {
    if (!confirm(`Supprimer le code « ${code} » ?`)) return;
    setBusy(id);
    const supabase = createClient();
    await supabase.from('promo_codes').delete().eq('id', id);
    setCodes((cs) => cs.filter((c) => c.id !== id));
    setBusy(null);
  };

  return (
    <div>
      <PageHeader
        title="Codes promo"
        description={`${codes.length} code${codes.length > 1 ? 's' : ''} (${codes.filter((c) => c.is_active).length} actif${codes.filter((c) => c.is_active).length > 1 ? 's' : ''})`}
        action={
          editingId !== 'new' && (
            <Button variant="primary" icon={Plus} onClick={() => setEditingId('new')}>
              Nouveau code
            </Button>
          )
        }
      />

      <div className="space-y-4">
        {/* Nouveau code form */}
        {editingId === 'new' && (
          <PromoForm
            onSaved={() => {
              setEditingId(null);
              fetchCodes();
            }}
            onCancel={() => setEditingId(null)}
          />
        )}

        {loading ? (
          <Card>
            <LoadingState />
          </Card>
        ) : codes.length === 0 ? (
          <Card>
            <EmptyState
              icon={Tag}
              title="Aucun code promo"
              description="Crée un code pour offrir une remise à tes clientes."
              action={
                <Button variant="primary" icon={Plus} size="sm" onClick={() => setEditingId('new')}>
                  Nouveau code
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {codes.map((c) =>
              editingId === c.id ? (
                <PromoForm
                  key={c.id}
                  initial={c}
                  onSaved={() => {
                    setEditingId(null);
                    fetchCodes();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <Card key={c.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="flex items-center gap-1.5 font-mono text-sm font-semibold px-2 py-1 rounded-md transition"
                          style={{
                            background: 'var(--admin-hover)',
                            color: 'var(--brand-blue)',
                          }}
                        >
                          {c.code}
                          {copied === c.code ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                        {c.is_active ? (
                          <Badge variant="success">Actif</Badge>
                        ) : (
                          <Badge variant="muted">Inactif</Badge>
                        )}
                      </div>
                      {c.label && (
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                          {c.label}
                        </p>
                      )}
                      {c.description && (
                        <p className="text-xs truncate" style={{ color: 'var(--admin-text-muted)' }}>
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--admin-text-faint)' }}>
                        Remise
                      </p>
                      <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {c.discount_type === 'percentage'
                          ? `-${c.discount_value}%`
                          : `-${c.discount_value.toFixed(2)} €`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--admin-text-faint)' }}>
                        Mini panier
                      </p>
                      <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {c.min_order > 0 ? `${c.min_order.toFixed(2)} €` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--admin-text-faint)' }}>
                        Utilisations
                      </p>
                      <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {c.used_count}
                        {c.max_uses ? ` / ${c.max_uses}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--admin-text-faint)' }}>
                        Expire
                      </p>
                      <p className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(c.id, c.is_active)}
                      disabled={busy === c.id}
                    >
                      {c.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(c.id)}>
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => deleteCode(c.id, c.code)}
                      disabled={busy === c.id}
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
function PromoForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: PromoCode;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    code: initial?.code || '',
    label: initial?.label || '',
    description: initial?.description || '',
    discount_type: initial?.discount_type || 'percentage',
    discount_value: initial?.discount_value || 10,
    min_order: initial?.min_order || 0,
    expires_at: initial?.expires_at ? initial.expires_at.slice(0, 10) : '',
    max_uses: initial?.max_uses ?? '',
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    if (!form.code.trim()) {
      setError('Le code est obligatoire');
      setSaving(false);
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      label: form.label || null,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order) || 0,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      max_uses: form.max_uses ? parseInt(String(form.max_uses)) : null,
      is_active: form.is_active,
    };

    const supabase = createClient();
    const { error: e } = initial
      ? await supabase.from('promo_codes').update(payload).eq('id', initial.id)
      : await supabase.from('promo_codes').insert(payload);

    if (e) {
      setError(e.code === '23505' ? 'Ce code existe déjà' : e.message);
      setSaving(false);
      return;
    }

    onSaved();
  };

  return (
    <Card noPadding className="md:col-span-2">
      <CardHeader title={initial ? `Modifier ${initial.code}` : 'Nouveau code promo'} />
      <div className="p-5 space-y-3">
        {error && (
          <div
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: '#FEF2F2', color: '#991B1B' }}
          >
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Code (en majuscules)</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Libellé (optionnel)</Label>
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Bienvenue"
            />
          </div>
        </div>
        <div>
          <Label>Description (visible côté client)</Label>
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="10% sur ta première commande"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Type de remise</Label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border-strong)',
                color: 'var(--admin-text)',
              }}
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe (€)</option>
            </select>
          </div>
          <div>
            <Label>{form.discount_type === 'percentage' ? 'Pourcentage' : 'Montant (€)'}</Label>
            <Input
              type="number"
              step={form.discount_type === 'percentage' ? '1' : '0.01'}
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Panier minimum (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Expire le (optionnel)</Label>
            <Input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>
          <div>
            <Label>Utilisations max (optionnel)</Label>
            <Input
              type="number"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="illimité"
            />
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded accent-[#1B4965]"
          />
          <span className="text-sm" style={{ color: 'var(--admin-text)' }}>Code actif</span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? '…' : initial ? 'Enregistrer' : 'Créer le code'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

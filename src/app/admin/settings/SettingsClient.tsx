'use client';

import { useState } from 'react';
import { Save, CheckCircle2, Lock, Plus, Trash2, Truck } from 'lucide-react';
import { PageHeader, Card, CardHeader, Button, Label, Input, Textarea } from '@/components/admin/ui';
import { saveShippingZones } from './actions';
import type { SiteSettings, ShippingZone } from '@/types/site-settings';

export default function SettingsClient({ initialSettings }: { initialSettings: SiteSettings }) {
  const [zones, setZones] = useState<ShippingZone[]>(initialSettings.shipping?.zones || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateZone = (index: number, patch: Partial<ShippingZone>) => {
    setZones((prev) => prev.map((z, i) => (i === index ? { ...z, ...patch } : z)));
  };

  const addZone = () => {
    // id unique déterministe basé sur le plus grand suffixe existant (pas de Date.now/random)
    const maxN = zones.reduce((max, z) => {
      const m = /^zone-(\d+)$/.exec(z.id);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    setZones((prev) => [
      ...prev,
      {
        id: `zone-${maxN + 1}`,
        label: 'Nouvelle zone',
        enabled: true,
        countries: [],
        price: 0,
        freeAbove: 0,
        deliveryMinDays: undefined,
        deliveryMaxDays: undefined,
      },
    ]);
  };

  const removeZone = (index: number) => {
    const zone = zones[index];
    if (!confirm(`Supprimer la zone « ${zone.label || zone.id} » ?`)) return;
    setZones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveShippingZones(zones);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(res.error || 'Erreur inconnue');
    }
  };

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration des services connectés à la boutique"
      />

      <div className="max-w-3xl space-y-4">
        <Card noPadding>
          <CardHeader
            title="Stripe (paiements)"
            description="Configuré via les variables d’environnement .env.local"
          />
          <div className="p-5">
            <Label>Clé publique</Label>
            <div className="flex items-center gap-2">
              <Input
                disabled
                value="••••••••••••  configuré dans .env.local"
                style={{ background: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
              />
              <Lock size={14} style={{ color: 'var(--admin-text-faint)' }} />
            </div>
          </div>
        </Card>

        <Card noPadding>
          <CardHeader
            title="Meta Pixel"
            description="Pour le tracking Instagram / Facebook Ads"
          />
          <div className="p-5">
            <Label>Pixel ID</Label>
            <div className="flex items-center gap-2">
              <Input
                disabled
                value="••••••••••••  configuré dans .env.local"
                style={{ background: 'var(--admin-bg)', color: 'var(--admin-text-muted)' }}
              />
              <Lock size={14} style={{ color: 'var(--admin-text-faint)' }} />
            </div>
          </div>
        </Card>

        {/* Livraison — gestion complète des zones */}
        <Card noPadding>
          <CardHeader
            title="Livraison"
            description="Zones, tarifs et pays proposés au moment du paiement (Stripe)"
          />
          <div className="p-5 space-y-4">
            {zones.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                Aucune zone de livraison. Ajoutes-en une pour permettre le paiement.
              </p>
            )}

            {zones.map((zone, zi) => (
              <div
                key={zone.id}
                className="rounded-xl p-4 space-y-4"
                style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
              >
                {/* En-tête de zone : activation + suppression */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => updateZone(zi, { enabled: !zone.enabled })}
                    className="flex items-center gap-2"
                    title={zone.enabled ? 'Zone active' : 'Zone désactivée'}
                  >
                    <span
                      className="w-9 h-5 rounded-full p-0.5 transition flex"
                      style={{
                        background: zone.enabled ? '#1B4965' : '#D9D9D6',
                        justifyContent: zone.enabled ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                      <Truck size={14} style={{ color: 'var(--admin-text-muted)' }} />
                      {zone.enabled ? 'Active' : 'Désactivée'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeZone(zi)}
                    className="p-1.5 rounded-lg hover:bg-[#FEF2F2]"
                    style={{ color: 'var(--admin-text-muted)' }}
                    title="Supprimer la zone"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <Label>Nom de la zone (visible au checkout)</Label>
                  <Input
                    value={zone.label}
                    onChange={(e) => updateZone(zi, { label: e.target.value })}
                    placeholder="France métropolitaine"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Prix de livraison (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(zone.price)}
                      onChange={(e) => updateZone(zi, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Gratuite à partir de (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(zone.freeAbove ?? 0)}
                      onChange={(e) => updateZone(zi, { freeAbove: parseFloat(e.target.value) || 0 })}
                      placeholder="0 = jamais offerte"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Délai min. (jours ouvrés)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={String(zone.deliveryMinDays ?? '')}
                      onChange={(e) =>
                        updateZone(zi, {
                          deliveryMinDays: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="ex. 2"
                    />
                  </div>
                  <div>
                    <Label>Délai max. (jours ouvrés)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={String(zone.deliveryMaxDays ?? '')}
                      onChange={(e) =>
                        updateZone(zi, {
                          deliveryMaxDays: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="ex. 4"
                    />
                  </div>
                </div>

                <div>
                  <Label>Pays couverts (codes ISO à 2 lettres, séparés par des virgules)</Label>
                  <Textarea
                    rows={2}
                    className="font-mono text-xs uppercase"
                    value={zone.countries.join(', ')}
                    onChange={(e) =>
                      updateZone(zi, {
                        countries: e.target.value
                          .split(',')
                          .map((c) => c.trim().toUpperCase())
                          .filter(Boolean),
                      })
                    }
                    placeholder="FR, MC, BE, DE, ES…"
                  />
                  <p className="text-[11px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>
                    Ex. FR = France, BE = Belgique, DE = Allemagne, US = États-Unis. Un pays ne doit
                    figurer que dans une seule zone.
                  </p>
                </div>
              </div>
            ))}

            <Button variant="secondary" size="sm" icon={Plus} onClick={addZone}>
              Ajouter une zone
            </Button>
          </div>
        </Card>

        {error && (
          <p className="text-sm" style={{ color: '#991B1B' }}>
            Erreur de sauvegarde : {error}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            icon={saved ? CheckCircle2 : Save}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Save, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader, Card, CardHeader, Button, Label, Input } from '@/components/admin/ui';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

        <Card noPadding>
          <CardHeader
            title="Livraison"
            description="Tarifs appliqués lors du checkout"
          />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Livraison standard (€)</Label>
              <Input type="number" step="0.01" defaultValue="4.90" />
            </div>
            <div>
              <Label>Gratuite à partir de (€)</Label>
              <Input type="number" step="0.01" defaultValue="50.00" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button variant="primary" icon={saved ? CheckCircle2 : Save} onClick={handleSave}>
            {saved ? 'Sauvegardé' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
}

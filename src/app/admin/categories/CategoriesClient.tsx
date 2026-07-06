'use client';

import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/admin/ui';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { saveHiddenCategories } from './actions';

export default function CategoriesClient({ initialHidden }: { initialHidden: string[] }) {
  const [hidden, setHidden] = useState<string[]>(initialHidden);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveHiddenCategories(hidden);
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
        title="Catégories"
        description="Crée, renomme et choisis les catégories affichées (menu, filtres, accueil)"
        action={
          <Button
            variant="primary"
            size="sm"
            icon={saved ? CheckCircle2 : Save}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement…' : saved ? 'Enregistré' : 'Enregistrer l’affichage'}
          </Button>
        }
      />

      <div className="max-w-2xl space-y-3">
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--admin-text-muted)' }}>
          Utilise l’œil 👁️ pour <strong>afficher ou masquer</strong> une catégorie du site (menu déroulant
          « Boutique », filtres de la boutique, section catégories de l’accueil). Clique ensuite sur
          <strong> « Enregistrer l’affichage »</strong>.
          <br />
          Les catégories <strong>sans produit</strong> sont automatiquement masquées.
        </p>

        <Card noPadding>
          <div className="p-4">
            <CategoryPicker hiddenSlugs={hidden} onChangeHidden={setHidden} />
          </div>
        </Card>

        {error && (
          <p className="text-sm" style={{ color: '#991B1B' }}>
            Erreur : {error}
          </p>
        )}
      </div>
    </div>
  );
}

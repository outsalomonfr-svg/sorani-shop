'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';
import { PageHeader, Card, Button, Label, Input, Textarea, EmptyState } from '@/components/admin/ui';
import { saveFaq } from './actions';
import type { FaqItem } from '@/types/site-settings';

export default function FaqEditorClient({ initialFaq }: { initialFaq: FaqItem[] }) {
  const [items, setItems] = useState<FaqItem[]>(initialFaq);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<FaqItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const add = () => setItems((prev) => [...prev, { question: '', answer: '' }]);

  const remove = (i: number) => {
    if (!confirm('Supprimer cette question ?')) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: -1 | 1) => {
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveFaq(items);
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
        title="FAQ"
        description="Gère les questions / réponses affichées sur la page /faq"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={ExternalLink} href="/faq">
              Voir la page
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={saved ? CheckCircle2 : Save}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement…' : saved ? 'Enregistré' : 'Enregistrer'}
            </Button>
          </div>
        }
      />

      <div className="max-w-3xl space-y-3">
        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon={HelpCircle}
              title="Aucune question"
              description="Ajoute ta première question pour construire ta FAQ."
              action={
                <Button variant="primary" size="sm" icon={Plus} onClick={add}>
                  Ajouter une question
                </Button>
              }
            />
          </Card>
        ) : (
          items.map((item, i) => (
            <Card key={i} noPadding>
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-0.5 pt-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-black/[0.04] disabled:opacity-30"
                      style={{ color: 'var(--admin-text-muted)' }}
                      title="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      className="p-1 rounded hover:bg-black/[0.04] disabled:opacity-30"
                      style={{ color: 'var(--admin-text-muted)' }}
                      title="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div>
                      <Label>Question {i + 1}</Label>
                      <Input
                        value={item.question}
                        onChange={(e) => update(i, { question: e.target.value })}
                        placeholder="Ex. Quels sont les délais de livraison ?"
                        className="font-medium"
                      />
                    </div>
                    <div>
                      <Label>Réponse</Label>
                      <Textarea
                        rows={3}
                        value={item.answer}
                        onChange={(e) => update(i, { answer: e.target.value })}
                        placeholder="La réponse à afficher…"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => remove(i)}
                    className="p-1.5 rounded-lg hover:bg-[#FEF2F2] mt-6"
                    style={{ color: 'var(--admin-text-muted)' }}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}

        {items.length > 0 && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={add}>
            Ajouter une question
          </Button>
        )}

        {error && (
          <p className="text-sm" style={{ color: '#991B1B' }}>
            Erreur : {error}
          </p>
        )}
      </div>
    </div>
  );
}

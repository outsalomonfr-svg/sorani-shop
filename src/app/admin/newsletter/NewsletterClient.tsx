'use client';

import { useState } from 'react';
import { Send, Users, AlertTriangle, Mail, Check } from 'lucide-react';
import { PageHeader, Card, Button, Label, Input, Textarea, Badge } from '@/components/admin/ui';
import { useToast } from '@/components/admin/Toast';
import { sendNewsletter } from './actions';

export type Campaign = {
  id: string;
  subject: string;
  recipients_count: number;
  sent_count: number;
  created_at: string;
};

export default function NewsletterClient({
  subscriberCount,
  campaigns,
  resendConfigured,
}: {
  subscriberCount: number;
  campaigns: Campaign[];
  resendConfigured: boolean;
}) {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Campaign[]>(campaigns);

  const canSend = subject.trim() && message.trim() && subscriberCount > 0;

  const doSend = async () => {
    setSending(true);
    const res = await sendNewsletter(subject, message);
    setSending(false);
    setConfirming(false);
    if (res.ok) {
      toast(`Newsletter envoyée à ${res.sent} abonné${(res.sent ?? 0) > 1 ? 's' : ''} ✨`, 'success');
      setHistory([
        {
          id: 'local-' + subject,
          subject: subject.trim(),
          recipients_count: res.total ?? 0,
          sent_count: res.sent ?? 0,
          created_at: new Date().toISOString(),
        },
        ...history,
      ]);
      setSubject('');
      setMessage('');
    } else {
      toast(res.error || 'Échec de l’envoi', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Newsletter"
        description="Écris un message et envoie-le à tous tes abonnés."
      />

      {/* Abonnés */}
      <div className="flex items-center gap-2 mb-5">
        <Badge>
          <Users size={13} className="inline mr-1 -mt-0.5" />
          {subscriberCount} abonné{subscriberCount > 1 ? 's' : ''} actif{subscriberCount > 1 ? 's' : ''}
        </Badge>
      </div>

      {!resendConfigured && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-5 text-sm"
          style={{ background: '#FEF3C7', color: '#92400E' }}
        >
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">L’envoi d’emails n’est pas encore activé.</p>
            <p className="mt-1 opacity-90">
              Ajoute la clé <code className="font-mono">RESEND_API_KEY</code> sur Vercel (je te guide) pour
              pouvoir envoyer. Tu peux déjà préparer ton message ci-dessous.
            </p>
          </div>
        </div>
      )}

      <Card>
        <div className="p-5 space-y-4">
          <div>
            <Label>Objet de l’email</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex : Nouvelle collection été ✨"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                'Bonjour,\n\nÉcris ton message ici. Laisse une ligne vide entre deux paragraphes.\n\nÀ très vite,\nSofia'
              }
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--admin-text-muted)' }}>
              Le message sera mis en forme automatiquement dans un joli modèle SORANI, avec un lien de
              désabonnement.
            </p>
          </div>

          {!confirming ? (
            <Button onClick={() => setConfirming(true)} disabled={!canSend}>
              <Send size={15} />
              Envoyer la newsletter
            </Button>
          ) : (
            <div
              className="p-4 rounded-lg space-y-3"
              style={{ background: 'var(--admin-hover)', border: '1px solid var(--admin-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--admin-text)' }}>
                Envoyer <strong>« {subject.trim()} »</strong> à{' '}
                <strong>
                  {subscriberCount} abonné{subscriberCount > 1 ? 's' : ''}
                </strong>{' '}
                ? Cette action est définitive.
              </p>
              <div className="flex gap-2">
                <Button onClick={doSend} disabled={sending}>
                  <Check size={15} />
                  {sending ? 'Envoi en cours…' : 'Oui, envoyer'}
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)} disabled={sending}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Historique */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--admin-text)' }}>
            Dernières campagnes
          </h2>
          <div className="space-y-2">
            {history.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(56,69,173,0.08)', color: 'var(--brand-blue)' }}
                >
                  <Mail size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                    {c.subject}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--admin-text-muted)' }}>
                  {c.sent_count}/{c.recipients_count} envoyé{c.sent_count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

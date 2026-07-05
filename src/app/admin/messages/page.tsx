'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, MailOpen, CornerUpLeft, Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Card, Badge, EmptyState, LoadingState, Button } from '@/components/admin/ui';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const setRead = async (id: string, is_read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read } : m)));
    const supabase = createClient();
    await supabase.from('contact_messages').update({ is_read }).eq('id', id);
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    const supabase = createClient();
    await supabase.from('contact_messages').delete().eq('id', id);
  };

  const unread = messages.filter((m) => !m.is_read).length;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div>
      <PageHeader
        title="Messages"
        description={
          messages.length === 0
            ? 'Messages reçus via le formulaire de contact'
            : `${messages.length} message${messages.length > 1 ? 's' : ''}${unread > 0 ? ` · ${unread} non lu${unread > 1 ? 's' : ''}` : ''}`
        }
      />

      {loading ? (
        <Card>
          <LoadingState />
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Aucun message"
            description="Les messages envoyés depuis la page Contact apparaîtront ici."
          />
        </Card>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {messages.map((m) => (
            <Card key={m.id} noPadding>
              <div
                className="p-4"
                style={{
                  borderLeft: m.is_read ? '3px solid transparent' : '3px solid var(--brand-blue)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium" style={{ color: 'var(--admin-text)' }}>
                        {m.name}
                      </span>
                      {!m.is_read && <Badge variant="info">Nouveau</Badge>}
                    </div>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--admin-text-muted)' }}
                    >
                      {m.email}
                    </a>
                  </div>
                  <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--admin-text-faint)' }}>
                    {fmtDate(m.created_at)}
                  </span>
                </div>

                {m.subject && (
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                    {m.subject}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--admin-text-muted)' }}>
                  {m.message}
                </p>

                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={CornerUpLeft}
                    href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Votre message'))}`}
                  >
                    Répondre
                  </Button>
                  <button
                    onClick={() => setRead(m.id, !m.is_read)}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04]"
                    style={{ color: 'var(--admin-text-muted)' }}
                  >
                    {m.is_read ? <Mail size={13} /> : <MailOpen size={13} />}
                    {m.is_read ? 'Marquer non lu' : 'Marquer lu'}
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    className="ml-auto p-1.5 rounded-lg hover:bg-[#FEF2F2]"
                    style={{ color: 'var(--admin-text-muted)' }}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

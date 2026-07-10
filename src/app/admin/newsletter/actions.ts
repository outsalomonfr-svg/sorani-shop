'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNewsletterBatch } from '@/lib/email';
import { unsubscribeUrl } from '@/lib/unsubscribe-token';

export type SendResult = {
  ok: boolean;
  sent?: number;
  total?: number;
  error?: string;
};

export async function sendNewsletter(subject: string, message: string): Promise<SendResult> {
  // Vérifie que l'appel vient d'un admin connecté
  const authed = await createClient();
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return { ok: false, error: 'Non autorisé' };

  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();
  if (!cleanSubject || !cleanMessage) {
    return { ok: false, error: 'Objet et message sont obligatoires.' };
  }

  const admin = createAdminClient();
  const { data: subs, error } = await admin
    .from('subscribers')
    .select('email')
    .eq('is_active', true);

  if (error) return { ok: false, error: error.message };
  const recipients = (subs || [])
    .map((s) => s.email as string)
    .filter(Boolean)
    .map((email) => ({ email, unsubscribeUrl: unsubscribeUrl(email) }));

  if (recipients.length === 0) {
    return { ok: false, error: 'Aucun abonné actif pour le moment.' };
  }

  const { sent, error: sendErr } = await sendNewsletterBatch(recipients, cleanSubject, cleanMessage);

  // Historique (même en cas d'envoi partiel)
  await admin.from('newsletter_campaigns').insert({
    subject: cleanSubject,
    body: cleanMessage,
    recipients_count: recipients.length,
    sent_count: sent,
  });

  if (sendErr) {
    const hint =
      sendErr === 'RESEND_API_KEY missing'
        ? 'La clé Resend n’est pas encore configurée (RESEND_API_KEY sur Vercel).'
        : sendErr;
    return { ok: false, sent, total: recipients.length, error: hint };
  }

  return { ok: true, sent, total: recipients.length };
}

import { createAdminClient } from '@/lib/supabase/admin';
import NewsletterClient, { type Campaign } from './NewsletterClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsletterPage() {
  const admin = createAdminClient();

  const { count } = await admin
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // La table newsletter_campaigns peut ne pas encore exister (migration non lancée)
  let campaigns: Campaign[] = [];
  const { data } = await admin
    .from('newsletter_campaigns')
    .select('id, subject, recipients_count, sent_count, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  if (data) campaigns = data as Campaign[];

  return (
    <NewsletterClient
      subscriberCount={count ?? 0}
      campaigns={campaigns}
      resendConfigured={!!process.env.RESEND_API_KEY}
    />
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReviewInvite } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Envoie l'email "laisse un avis" quelques jours après une commande.
// Déclenché chaque jour par le Cron Vercel (voir vercel.json).
export async function GET(request: NextRequest) {
  // Sécurité : autorisé si le secret correspond, ou si l'appel vient du Cron Vercel.
  const auth = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') !== null;
  const secretOk = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && !secretOk && !isVercelCron) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const delayDays = parseInt(process.env.REVIEW_INVITE_DELAY_DAYS || '5', 10);
  const now = Date.now();
  const cutoff = new Date(now - delayDays * 86400000).toISOString(); // commandes plus vieilles que N jours
  const floor = new Date(now - 30 * 86400000).toISOString(); // ne pas remonter au-delà de 30 jours

  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from('orders')
    .select('id, customer_email, customer_name, created_at')
    .is('review_invite_sent_at', null)
    .in('status', ['paid', 'processing', 'shipped', 'delivered'])
    .lte('created_at', cutoff)
    .gte('created_at', floor)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const order of orders || []) {
    if (!order.customer_email) {
      skipped++;
      continue;
    }

    // Premier article de la commande (+ slug produit pour le lien vers l'avis)
    const { data: items } = await admin
      .from('order_items')
      .select('product_name, products(slug)')
      .eq('order_id', order.id)
      .limit(1);

    const item = items?.[0] as
      | { product_name?: string; products?: { slug?: string } | { slug?: string }[] | null }
      | undefined;
    const productName = item?.product_name || 'ta commande';
    const prod = item?.products;
    const productSlug = Array.isArray(prod) ? prod[0]?.slug : prod?.slug;

    const result = await sendReviewInvite({
      to: order.customer_email,
      customerName: order.customer_name,
      productName,
      productSlug: productSlug || '',
    });

    if (result.ok) {
      await admin
        .from('orders')
        .update({ review_invite_sent_at: new Date().toISOString() })
        .eq('id', order.id);
      sent++;
    } else {
      // Clé Resend absente ou envoi échoué : on ne marque pas, on réessaiera demain.
      skipped++;
    }
  }

  // Purge des statistiques de visite de plus de 25 mois (duree maximale
  // autorisee par la CNIL pour la mesure d'audience).
  const analyticsCutoff = new Date(now - 25 * 30 * 86400000).toISOString();
  const { error: purgeError } = await admin
    .from('page_views')
    .delete()
    .lt('created_at', analyticsCutoff);
  if (purgeError) {
    // Table absente ou erreur : sans consequence pour l'envoi des emails.
    console.warn('[cron] purge page_views:', purgeError.message);
  }

  return NextResponse.json({ ok: true, candidates: orders?.length || 0, sent, skipped, delayDays });
}

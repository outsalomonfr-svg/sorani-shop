'use server';

import { createClient } from '@/lib/supabase/server';
import { sendOrderProcessing, sendOrderShipped } from '@/lib/email';

/**
 * Prévient la cliente quand le statut de sa commande change.
 * - "processing" → e-mail « en préparation »
 * - "shipped"    → e-mail « expédiée » (avec le suivi s'il est renseigné)
 *
 * Lecture via le client à cookies : la RLS (is_admin) sert de garde-fou, donc
 * seule une administratrice connectée peut déclencher l'envoi.
 */
export async function notifyOrderStatus(
  orderId: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  if (status !== 'processing' && status !== 'shipped') return { ok: true };

  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('customer_email, customer_name, tracking_number')
    .eq('id', orderId)
    .single();

  if (!order?.customer_email) return { ok: false, error: 'Commande introuvable' };

  const { data: itemsData } = await supabase
    .from('order_items')
    .select('product_name, quantity')
    .eq('order_id', orderId);

  const items = (itemsData || []).map((i) => ({
    name: i.product_name as string,
    quantity: i.quantity as number,
  }));

  if (status === 'processing') {
    return sendOrderProcessing({
      to: order.customer_email,
      customerName: order.customer_name,
      items,
    });
  }

  return sendOrderShipped({
    to: order.customer_email,
    customerName: order.customer_name,
    items,
    tracking: order.tracking_number,
  });
}

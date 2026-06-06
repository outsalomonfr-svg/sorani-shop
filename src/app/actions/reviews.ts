'use server';

import { createClient } from '@/lib/supabase/server';
import { notifyAdminNewReview, sendReviewInvite } from '@/lib/email';

export async function submitReview({
  productId,
  customerEmail,
  customerName,
  rating,
  title,
  comment,
}: {
  productId: string;
  customerEmail: string;
  customerName?: string;
  rating: number;
  title?: string;
  comment?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cleanEmail = customerEmail.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Email invalide' };
  }
  if (rating < 1 || rating > 5) return { ok: false, error: 'Note invalide' };

  const supabase = await createClient();

  // Vérifie que le produit existe
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('id', productId)
    .single();

  if (!product) return { ok: false, error: 'Produit introuvable' };

  // Insert l'avis (status pending par défaut, trigger vérifie l'achat)
  const { error: insertErr } = await supabase.from('product_reviews').insert({
    product_id: productId,
    customer_email: cleanEmail,
    customer_name: customerName?.trim() || null,
    rating,
    title: title?.trim() || null,
    comment: comment?.trim() || null,
    status: 'pending',
  });

  if (insertErr) return { ok: false, error: insertErr.message };

  // Notifie l'admin (best-effort, ne bloque pas si email échoue)
  notifyAdminNewReview({
    productName: product.name,
    productSlug: product.slug,
    rating,
    title,
    comment,
    customerName,
    customerEmail: cleanEmail,
  }).catch((e) => console.error('Notify admin failed:', e));

  return { ok: true };
}

/* Invite tous les clients d'une commande livrée à laisser un avis */
export async function inviteReviewsForOrder(orderId: string): Promise<{ ok: boolean; sent: number; error?: string }> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('id, customer_email, customer_name, status')
    .eq('id', orderId)
    .single();

  if (!order) return { ok: false, sent: 0, error: 'Commande introuvable' };
  if (order.status !== 'delivered') {
    return { ok: false, sent: 0, error: 'La commande doit être en statut "livrée"' };
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, product:products(name, slug)')
    .eq('order_id', orderId);

  if (!items || items.length === 0) return { ok: false, sent: 0, error: 'Aucun produit dans la commande' };

  let sent = 0;
  for (const it of items) {
    const product = it.product as { name?: string; slug?: string } | null;
    if (!product?.name || !product?.slug) continue;
    const res = await sendReviewInvite({
      to: order.customer_email,
      customerName: order.customer_name,
      productName: product.name,
      productSlug: product.slug,
    });
    if (res.ok) sent++;
  }

  return { ok: sent > 0, sent };
}

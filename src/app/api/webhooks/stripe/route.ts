import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createResilientClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Client résilient : service_role si propre, sinon repli clé anon (la RLS autorise
  // l'insertion des commandes). Évite l'échec silencieux si la clé Vercel est corrompue.
  const supabase = createResilientClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const items: Array<{ id: string; qty: number }> = JSON.parse(session.metadata?.items || '[]');

    const sAny = session as unknown as {
      collected_information?: { shipping_details?: { address?: unknown } };
      shipping_details?: { address?: unknown };
    };
    const shippingAddress =
      sAny.collected_information?.shipping_details?.address ?? sAny.shipping_details?.address ?? null;

    const customerEmail = session.customer_details?.email ?? null;
    const customerName = session.customer_details?.name ?? null;
    const subtotal = (session.amount_subtotal || 0) / 100;
    const shippingCost = (session.total_details?.amount_shipping || 0) / 100;
    const total = (session.amount_total || 0) / 100;

    // ID généré côté serveur → pas besoin de relire la ligne après insertion (compatible RLS)
    const orderId = randomUUID();

    const { error: orderErr } = await supabase.from('orders').insert({
      id: orderId,
      customer_email: customerEmail,
      customer_name: customerName,
      shipping_address: shippingAddress,
      subtotal,
      shipping_cost: shippingCost,
      total,
      status: 'paid',
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
    });

    if (orderErr) {
      console.error('[webhook] échec création commande:', orderErr.message);
      // On renvoie 500 pour que Stripe réessaie automatiquement
      return NextResponse.json({ error: 'order insert failed' }, { status: 500 });
    }

    // Articles de la commande (+ email de confirmation)
    const confirmationItems: { name: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('name, images, price')
        .eq('id', item.id)
        .single();

      const name = product?.name || 'Bijou';
      const price = product?.price ?? 0;
      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.id,
        product_name: name,
        product_image: product?.images?.[0] || '',
        price,
        quantity: item.qty,
      });
      confirmationItems.push({ name, quantity: item.qty, price });

      // Décrément de stock — best-effort (n'empêche jamais l'enregistrement)
      try {
        await supabase.rpc('decrement_stock', { product_id: item.id, qty: item.qty });
      } catch {
        /* ignore */
      }
    }

    // Email de confirmation au client (best-effort)
    if (customerEmail) {
      try {
        await sendOrderConfirmation({
          to: customerEmail,
          customerName,
          items: confirmationItems,
          subtotal,
          shippingCost,
          total,
          shippingAddress: shippingAddress as never,
        });
      } catch (err) {
        console.error('[webhook] envoi email confirmation échoué:', err);
      }
    }

    // Compteur de code promo — best-effort
    const promoId = session.metadata?.promo_id;
    if (promoId) {
      try {
        const res = await supabase.rpc('increment_promo_usage', { p_id: promoId });
        if (res.error) {
          const { data: cur } = await supabase
            .from('promo_codes')
            .select('used_count')
            .eq('id', promoId)
            .single();
          if (cur) {
            await supabase
              .from('promo_codes')
              .update({ used_count: (cur.used_count || 0) + 1 })
              .eq('id', promoId);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  return NextResponse.json({ received: true });
}

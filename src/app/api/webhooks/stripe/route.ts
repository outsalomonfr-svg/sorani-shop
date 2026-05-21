import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const items = JSON.parse(session.metadata?.items || '[]');

    // Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        shipping_address: session.shipping_details?.address,
        subtotal: (session.amount_subtotal || 0) / 100,
        shipping_cost: (session.total_details?.amount_shipping || 0) / 100,
        total: (session.amount_total || 0) / 100,
        status: 'paid',
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
      })
      .select()
      .single();

    if (order) {
      // Create order items
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('name, images, price')
          .eq('id', item.id)
          .single();

        if (product) {
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.id,
            product_name: product.name,
            product_image: product.images?.[0] || '',
            price: product.price,
            quantity: item.qty,
          });

          // Update stock
          await supabase.rpc('decrement_stock', {
            product_id: item.id,
            qty: item.qty,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

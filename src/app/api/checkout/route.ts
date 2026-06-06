import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type { CartItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail }: { items: CartItem[]; customerEmail?: string } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    const lineItems = items.map((item) => {
      const price = item.variant?.price ?? item.product.price;
      const variantSuffix = item.variant
        ? ` — ${item.product.variant_type ? item.product.variant_type + ' : ' : ''}${item.variant.name}`
        : '';
      const image = item.variant?.image || item.product.images[0];
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${item.product.name}${variantSuffix}`,
            images: image ? [image] : [],
            description: item.product.description?.substring(0, 500),
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 490, currency: 'eur' },
            display_name: 'Livraison standard',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Livraison gratuite',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
      ],
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({
            id: i.product.id,
            variant_id: i.variant?.id ?? null,
            variant_name: i.variant?.name ?? null,
            qty: i.quantity,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erreur lors du checkout' }, { status: 500 });
  }
}

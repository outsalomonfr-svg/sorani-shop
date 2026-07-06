import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { validatePromoCode } from '@/app/actions/promo';
import { getSiteSettings } from '@/lib/site-settings';
import type { CartItem } from '@/types';
import type { ShippingZone } from '@/types/site-settings';

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail, promoCode }: { items: CartItem[]; customerEmail?: string; promoCode?: string } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    // Calcul du sous-total
    const subtotal = items.reduce((acc, item) => {
      const price = item.variant?.price ?? item.product.price;
      return acc + price * item.quantity;
    }, 0);

    // Validation du code promo côté serveur (anti-tampering)
    let validatedPromo: Awaited<ReturnType<typeof validatePromoCode>> | null = null;
    if (promoCode) {
      validatedPromo = await validatePromoCode(promoCode, subtotal);
      if (!validatedPromo.ok) {
        return NextResponse.json(
          { error: `Code promo invalide : ${validatedPromo.error}` },
          { status: 400 }
        );
      }
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

    // Création du coupon Stripe (one-shot) si code promo
    let discounts: { coupon: string }[] | undefined;
    if (validatedPromo?.ok) {
      const coupon = await stripe.coupons.create({
        name: `Code ${validatedPromo.code}`,
        ...(validatedPromo.discountType === 'percentage'
          ? { percent_off: validatedPromo.discountValue }
          : { amount_off: Math.round((validatedPromo.discountValue || 0) * 100), currency: 'eur' }),
        duration: 'once',
        metadata: { promo_id: validatedPromo.promoId || '', code: validatedPromo.code || '' },
      });
      discounts = [{ coupon: coupon.id }];
    }

    // Charge les zones de livraison configurées dans le customizer
    const siteSettings = await getSiteSettings();
    const zones: ShippingZone[] = (siteSettings.shipping?.zones || []).filter(
      (z) => z.enabled && z.countries.length > 0
    );

    const allowedCountries = Array.from(
      new Set(zones.flatMap((z) => z.countries))
    );
    if (allowedCountries.length === 0) {
      allowedCountries.push('FR');
    }

    const shippingOptions = zones.flatMap((z): Array<{
      shipping_rate_data: {
        type: 'fixed_amount';
        fixed_amount: { amount: number; currency: string };
        display_name: string;
        delivery_estimate?: {
          minimum: { unit: 'business_day'; value: number };
          maximum: { unit: 'business_day'; value: number };
        };
      };
    }> => {
      const isFree = z.freeAbove && z.freeAbove > 0 && subtotal >= z.freeAbove;
      const baseEstimate =
        z.deliveryMinDays && z.deliveryMaxDays
          ? {
              minimum: { unit: 'business_day' as const, value: z.deliveryMinDays },
              maximum: { unit: 'business_day' as const, value: z.deliveryMaxDays },
            }
          : undefined;
      return [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: isFree ? 0 : Math.round(z.price * 100),
              currency: 'eur',
            },
            display_name: isFree
              ? `${z.label} — Offerte`
              : `${z.label} — ${z.price.toFixed(2).replace('.', ',')} €`,
            ...(baseEstimate ? { delivery_estimate: baseEstimate } : {}),
          },
        },
      ];
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sorani-shop.vercel.app';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      ...(discounts ? { discounts } : {}),
      shipping_address_collection: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allowed_countries: allowedCountries as any,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shipping_options: shippingOptions as any,
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({
            id: i.product.id,
            variant_id: i.variant?.id ?? null,
            variant_name: i.variant?.name ?? null,
            qty: i.quantity,
          }))
        ),
        promo_code: validatedPromo?.code || '',
        promo_id: validatedPromo?.promoId || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erreur lors du checkout' }, { status: 500 });
  }
}

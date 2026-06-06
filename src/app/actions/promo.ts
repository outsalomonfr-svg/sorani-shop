'use server';

import { createClient } from '@/lib/supabase/server';

export type PromoValidation = {
  ok: boolean;
  error?: string;
  code?: string;
  promoId?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number; // calculé sur le subtotal
  label?: string;
  description?: string;
};

export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<PromoValidation> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { ok: false, error: 'Code requis' };

  try {
    const supabase = await createClient();
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !promo) return { ok: false, error: 'Code invalide' };

    if (!promo.is_active) return { ok: false, error: 'Code désactivé' };

    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) {
      return { ok: false, error: 'Code pas encore actif' };
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return { ok: false, error: 'Code expiré' };
    }
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return { ok: false, error: 'Code épuisé' };
    }
    if (subtotal < Number(promo.min_order || 0)) {
      return {
        ok: false,
        error: `Panier minimum requis : ${Number(promo.min_order).toFixed(2)} €`,
      };
    }

    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = Math.round(subtotal * Number(promo.discount_value)) / 100;
    } else {
      discountAmount = Math.min(Number(promo.discount_value), subtotal);
    }

    return {
      ok: true,
      code: promo.code,
      promoId: promo.id,
      discountType: promo.discount_type,
      discountValue: Number(promo.discount_value),
      discountAmount: Math.round(discountAmount * 100) / 100,
      label: promo.label || undefined,
      description: promo.description || undefined,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

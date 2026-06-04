'use server';

import { createClient } from '@/lib/supabase/server';

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'Adresse email invalide' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('subscribers')
      .upsert({ email: trimmed, is_active: true }, { onConflict: 'email' });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
  }
}

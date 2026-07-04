'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_SETTINGS, type SiteSettings, type ShippingZone } from '@/types/site-settings';

// Sauvegarde UNIQUEMENT les zones de livraison, sans toucher au reste des réglages.
// On relit les données brutes en base (sans le merge des liens de nav CMS effectué
// par getSiteSettings) pour éviter toute duplication de la navigation.
export async function saveShippingZones(
  zones: ShippingZone[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { ok: false, error: 'forbidden' };

  const { data: existing } = await supabase
    .from('site_settings')
    .select('data')
    .eq('id', 1)
    .single();

  const base: SiteSettings = (existing?.data as SiteSettings) ?? DEFAULT_SETTINGS;
  const next: SiteSettings = { ...base, shipping: { zones } };

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, data: next, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types/site-settings';

export async function saveSiteSettings(settings: SiteSettings): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { ok: false, error: 'forbidden' };

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, data: settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

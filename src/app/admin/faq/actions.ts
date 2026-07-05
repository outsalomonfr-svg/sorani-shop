'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_SETTINGS, type SiteSettings, type FaqItem } from '@/types/site-settings';

// Sauvegarde uniquement la FAQ (relit les réglages bruts pour ne rien écraser d'autre).
export async function saveFaq(items: FaqItem[]): Promise<{ ok: boolean; error?: string }> {
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
  const clean = items
    .map((i) => ({ question: i.question.trim(), answer: i.answer.trim() }))
    .filter((i) => i.question || i.answer);
  const next: SiteSettings = { ...base, faq: clean };

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, data: next, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  revalidatePath('/faq');
  return { ok: true };
}

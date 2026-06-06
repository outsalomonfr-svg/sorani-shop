import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Renvoie un slug unique pour la table `products` en ajoutant -2, -3… si nécessaire.
 * Si `currentId` est fourni, on ignore les conflits avec ce produit (utile en édition).
 */
export async function ensureUniqueProductSlug(
  supabase: SupabaseClient,
  baseSlug: string,
  currentId?: string
): Promise<string> {
  const clean = (baseSlug || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'produit';

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? clean : `${clean}-${i + 1}`;
    let query = supabase.from('products').select('id').eq('slug', candidate).limit(1);
    if (currentId) query = query.neq('id', currentId);
    const { data } = await query;
    if (!data || data.length === 0) return candidate;
  }
  // Fallback : timestamp
  return `${clean}-${Date.now()}`;
}

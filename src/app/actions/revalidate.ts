'use server';

import { revalidatePath } from 'next/cache';

/**
 * Rafraîchit immédiatement les pages publiques (accueil + boutique) au lieu
 * d'attendre le délai de cache. Appelé après un changement fait directement
 * depuis l'admin (coup de cœur, activation d'un produit, édition d'une fiche…).
 */
export async function revalidatePublic() {
  revalidatePath('/', 'layout');
  revalidatePath('/shop');
}

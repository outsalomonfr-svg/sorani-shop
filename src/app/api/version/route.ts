import { NextResponse } from 'next/server';
import { serviceRoleKeyStatus } from '@/lib/supabase/admin';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/public-config';

export const dynamic = 'force-dynamic';

/**
 * Indique quelle version du code est en ligne et si la configuration serveur
 * est exploitable. Aucun secret n'est expose : uniquement des etats
 * ("ok" / "manquante" / "invalide") et des longueurs, jamais les valeurs.
 */
export async function GET() {
  const rawService = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  return NextResponse.json({
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE?.split('\n')[0] || null,
    env: process.env.VERCEL_ENV || 'development',
    config: {
      supabaseUrl: supabaseUrl(),
      anonKeyLength: supabaseAnonKey().length,
      serviceRoleKey: serviceRoleKeyStatus(),
      serviceRoleKeyLength: rawService.length,
      // Aide au diagnostic des copier-coller : un caractere de masquage "•"
      // (ou tout caractere non ASCII) rend la cle inutilisable.
      serviceRoleKeyHasWeirdChars: [...rawService].some((c) => c.charCodeAt(0) > 127),
    },
  });
}

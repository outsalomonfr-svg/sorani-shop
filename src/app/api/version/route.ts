import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Indique quelle version du code est reellement en ligne.
 * Utile pour verifier en un coup d'oeil qu'un correctif a bien ete deploye
 * (sans secret : uniquement l'identifiant de commit et la date de build).
 */
export async function GET() {
  return NextResponse.json({
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE?.split('\n')[0] || null,
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ? undefined : 'dev',
    env: process.env.VERCEL_ENV || 'development',
  });
}

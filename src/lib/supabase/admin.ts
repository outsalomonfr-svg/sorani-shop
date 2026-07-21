import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './public-config';

const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// Client Supabase "service role" — contourne la RLS.
// À n'utiliser QUE côté serveur (routes API, actions), jamais exposé au client.
export function createAdminClient() {
  // URL via le résolveur robuste (la variable d'env a déjà été corrompue une fois
  // dans Vercel ; une URL invalide fait échouer toutes les requêtes serveur).
  return createClient(
    supabaseUrl(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    { auth: { persistSession: false } }
  );
}

/** Indique si la clé service_role est exploitable (diagnostic des routes serveur). */
export function serviceRoleKeyStatus(): 'ok' | 'manquante' | 'invalide' {
  const svc = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!svc) return 'manquante';
  return JWT_RE.test(svc) ? 'ok' : 'invalide';
}

// Client PUBLIC sans cookies — pour les lectures de données publiques (produits,
// réglages, pages) côté serveur. Sans cookies, Next peut mettre les pages en cache (ISR)
// → beaucoup plus rapide. Respecte la RLS (clé anon), avec repli robuste.
export function createPublicClient() {
  return createClient(supabaseUrl(), supabaseAnonKey(), { auth: { persistSession: false } });
}

// Client "résilient" pour les traitements serveur critiques (ex. webhook Stripe) :
// utilise le service_role s'il est propre, sinon retombe sur la clé anon publique
// (validée/repli codé en dur). Les insertions de commandes sont autorisées par la RLS.
export function createResilientClient() {
  const svc = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const key = JWT_RE.test(svc) ? svc : supabaseAnonKey();
  return createClient(supabaseUrl(), key, { auth: { persistSession: false } });
}

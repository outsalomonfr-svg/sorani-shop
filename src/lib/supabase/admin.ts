import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './public-config';

const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// Client Supabase "service role" — contourne la RLS.
// À n'utiliser QUE côté serveur (routes API, actions), jamais exposé au client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Client "résilient" pour les traitements serveur critiques (ex. webhook Stripe) :
// utilise le service_role s'il est propre, sinon retombe sur la clé anon publique
// (validée/repli codé en dur). Les insertions de commandes sont autorisées par la RLS.
export function createResilientClient() {
  const svc = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const key = JWT_RE.test(svc) ? svc : supabaseAnonKey();
  return createClient(supabaseUrl(), key, { auth: { persistSession: false } });
}

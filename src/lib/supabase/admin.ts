import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Client Supabase "service role" — contourne la RLS.
// À n'utiliser QUE côté serveur (routes API, actions), jamais exposé au client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

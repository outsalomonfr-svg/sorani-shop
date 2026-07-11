import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from './public-config';

export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}

// URL et clé ANON de Supabase — toutes deux PUBLIQUES (la clé anon est conçue pour
// être exposée côté client ; la sécurité est assurée par la RLS).
// On garde un repli codé en dur pour survivre à une variable d'environnement
// manquante ou mal collée (ex. caractères de masquage « • » copiés par erreur).
const FALLBACK_URL = 'https://fgrtiflnuntqyblvcjkg.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncnRpZmxudW50cXlibHZjamtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE3MjQsImV4cCI6MjA5NDk2NzcyNH0.zfYnNKSXw89wjBCsy1x2QwKSR6Rt8R2AvNZDaKZOYdg';

// Un JWT valide = 3 segments base64url séparés par des points, uniquement en ASCII.
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export function supabaseUrl(): string {
  const u = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  return /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(u) ? u : FALLBACK_URL;
}

export function supabaseAnonKey(): string {
  const k = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  return JWT_RE.test(k) ? k : FALLBACK_ANON;
}

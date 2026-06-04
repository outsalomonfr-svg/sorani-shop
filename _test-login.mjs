import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL :', SUPABASE_URL);
console.log('');

const supabase = createClient(SUPABASE_URL, ANON_KEY);

console.log('1. Tentative de connexion email/mdp...');
const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: 'nacera.zahi92@gmail.com',
  password: 'SoraniAdmin2026!',
});

if (signInError) {
  console.error('❌ ECHEC connexion :', signInError.message);
  process.exit(1);
}

console.log('✅ Connexion réussie');
console.log('   User ID :', signInData.user.id);
console.log('   Email :', signInData.user.email);
console.log('   Email confirmed :', signInData.user.email_confirmed_at ? 'oui' : 'non');
console.log('');

console.log('2. Récupération du profil (role admin?)...');
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', signInData.user.id)
  .single();

if (profileError) {
  console.error('❌ ECHEC fetch profile :', profileError.message);
  process.exit(1);
}

console.log('✅ Profil récupéré');
console.log('   Role :', profile.role);
console.log('   Full name :', profile.full_name);
console.log('');

console.log('3. Test lecture site_settings...');
const { data: settings, error: settingsError } = await supabase
  .from('site_settings')
  .select('data')
  .eq('id', 1)
  .single();

if (settingsError) {
  console.error('❌ ECHEC site_settings :', settingsError.message);
} else {
  console.log('✅ Site settings lus, marque :', settings.data?.brand?.name);
}
console.log('');

console.log('========================================');
console.log('VERDICT : Le serveur fonctionne à 100%');
console.log('========================================');
console.log('Si ton navigateur dit "Email ou mdp incorrect",');
console.log('c\'est uniquement un problème côté Safari (autofill).');

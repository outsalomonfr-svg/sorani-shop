-- ============================================================
-- SORANI - Creer le compte admin (version robuste)
-- ============================================================
-- Email   : nacera.zahi92@gmail.com
-- Pwd     : SoraniAdmin2026!
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Cleanup : si un user existe deja avec cet email, on le degage proprement
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'nacera.zahi92@gmail.com'
);
DELETE FROM public.profiles WHERE email = 'nacera.zahi92@gmail.com';
DELETE FROM auth.users WHERE email = 'nacera.zahi92@gmail.com';

-- 2. Creation du user + identity + profile en admin
DO $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  -- auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    new_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'nacera.zahi92@gmail.com',
    crypt('SoraniAdmin2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sofia"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  -- auth.identities : on tente d'abord avec provider_id (nouvelle version Supabase)
  BEGIN
    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_id,
      new_id::text,
      jsonb_build_object(
        'sub', new_id::text,
        'email', 'nacera.zahi92@gmail.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(), now(), now()
    );
  EXCEPTION
    WHEN undefined_column THEN
      -- Fallback ancienne version Supabase (sans provider_id)
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        new_id,
        jsonb_build_object(
          'sub', new_id::text,
          'email', 'nacera.zahi92@gmail.com',
          'email_verified', true
        ),
        'email',
        now(), now(), now()
      );
  END;

  -- public.profiles : force role admin (le trigger handle_new_user a peut-etre cree une row, on la remplace)
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (new_id, 'nacera.zahi92@gmail.com', 'Sofia', 'admin', now(), now())
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin', full_name = 'Sofia', updated_at = now();

  RAISE NOTICE 'Compte cree avec ID %', new_id;
END $$;

-- 3. Verification : tu dois voir 1 ligne avec role=admin, confirmed=true, identities_count>=1
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirme,
  u.encrypted_password IS NOT NULL AS mot_de_passe_ok,
  p.role,
  p.full_name,
  (SELECT count(*) FROM auth.identities WHERE user_id = u.id) AS nb_identities
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'nacera.zahi92@gmail.com';

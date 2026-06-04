-- ============================================================
-- FIX : recursion infinie dans la policy "Admins can read all profiles"
-- ============================================================
-- Probleme : la policy interrogeait la table profiles depuis une
-- policy SUR la table profiles -> boucle infinie quand PostgreSQL
-- evalue la policy.
--
-- Solution : utiliser une fonction SECURITY DEFINER qui bypass RLS
-- pour faire le check admin sans declencher la recursion.
-- ============================================================

-- 1. Drop la policy buguee
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- 2. Helper function : is_admin() bypass RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Recree la policy proprement en utilisant la fonction
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT
  USING (public.is_admin());

-- 4. Mise a jour des autres policies qui faisaient un EXISTS direct
--    (par precaution, pour utiliser la fonction au lieu du EXISTS)

DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;
CREATE POLICY "Only admins can update site settings"
  ON site_settings FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage pages" ON pages;
CREATE POLICY "Admins manage pages"
  ON pages FOR ALL
  USING (public.is_admin());

-- 5. Verification
SELECT
  'profiles' AS table_name,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

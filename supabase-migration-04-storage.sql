-- ============================================================
-- Migration 04 — Storage bucket "media"
-- A executer dans Supabase > SQL Editor
-- (Idempotent : peut etre re-execute sans risque)
-- ============================================================

-- Creation du bucket public "media"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Tout le monde peut LIRE le bucket media (necessaire pour afficher les images)
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Seuls les admins peuvent UPLOAD
DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
CREATE POLICY "Admin upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seuls les admins peuvent UPDATE
DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
CREATE POLICY "Admin update media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seuls les admins peuvent DELETE
DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
CREATE POLICY "Admin delete media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

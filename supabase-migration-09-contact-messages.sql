-- ============================================================
-- Migration 09 — Messages du formulaire de contact
-- Sauvegarde chaque message en base (secours si l'email échoue),
-- consultable dans l'admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx
  ON contact_messages(created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- L'insertion se fait via la clé service role (contourne la RLS),
-- donc pas de policy INSERT publique. Seuls les admins lisent/modifient.
DROP POLICY IF EXISTS "Admins read contact_messages" ON contact_messages;
CREATE POLICY "Admins read contact_messages" ON contact_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins update contact_messages" ON contact_messages;
CREATE POLICY "Admins update contact_messages" ON contact_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins delete contact_messages" ON contact_messages;
CREATE POLICY "Admins delete contact_messages" ON contact_messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

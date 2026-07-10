-- Migration 10 : Newsletter (historique) + suivi des emails d'avis automatiques
-- À lancer une seule fois dans Supabase → SQL Editor.

-- 1) Suivi de l'email "invitation à laisser un avis" envoyé après une commande
ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_invite_sent_at TIMESTAMPTZ;

-- 2) Historique des campagnes newsletter envoyées depuis l'admin
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access newsletter_campaigns" ON newsletter_campaigns;
CREATE POLICY "Admin full access newsletter_campaigns" ON newsletter_campaigns
  FOR ALL USING (auth.role() = 'authenticated');

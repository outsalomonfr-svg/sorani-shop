-- ============================================================
-- Migration 03 — CMS pages
-- A executer dans Supabase > SQL Editor APRES les migrations 01 + 02
-- ============================================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title TEXT,
  seo_description TEXT,
  show_in_nav BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Public peut lire uniquement les pages publiees
DROP POLICY IF EXISTS "Public reads published pages" ON pages;
CREATE POLICY "Public reads published pages"
  ON pages FOR SELECT
  USING (status = 'published');

-- Admins peuvent tout faire
DROP POLICY IF EXISTS "Admins manage pages" ON pages;
CREATE POLICY "Admins manage pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Quelques pages de demarrage (en brouillon, a publier depuis l'admin)
INSERT INTO pages (slug, title, content, status, show_in_nav) VALUES
  ('about', 'A propos', '# A propos de SORANI

SORANI est une marque de bijoux artisanaux faits avec amour. Chaque piece est unique, pensee pour sublimer votre beaute naturelle.

## Notre histoire

Tout a commence par une passion pour l''artisanat et le desir de creer des bijoux qui durent dans le temps.', 'draft', true),
  ('contact', 'Contact', '# Contactez-nous

Une question, une suggestion, une commande personnalisee ?

**Email** : contact@sorani.fr
**Instagram** : @sorani.bijoux

Nous repondons sous 24 a 48 heures.', 'draft', true),
  ('livraison', 'Livraison & retours', '# Livraison & retours

## Livraison
Expedition sous 2 a 5 jours ouvres. Livraison gratuite a partir de 50 EUR.

## Retours
Vous disposez de 14 jours apres reception pour nous retourner votre commande.', 'draft', false),
  ('cgv', 'Conditions generales de vente', '# Conditions generales de vente

A completer.', 'draft', false)
ON CONFLICT (slug) DO NOTHING;

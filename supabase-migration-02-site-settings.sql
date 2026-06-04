-- ============================================================
-- Migration 02 — Site settings (theme customizer)
-- A executer dans Supabase > SQL Editor APRES la migration 01
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

-- RLS : tout le monde peut LIRE (le site public a besoin des settings)
-- Seuls les admins peuvent ECRIRE
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings readable by everyone" ON site_settings;
CREATE POLICY "Site settings readable by everyone"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;
CREATE POLICY "Only admins can update site settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO site_settings (id, data) VALUES (1, '{
  "brand": {
    "name": "SORANI",
    "logoUrl": "/images/logo.png",
    "tagline": "Bijoux faits avec amour"
  },
  "colors": {
    "primary": "#1B4965",
    "primaryDark": "#153a52",
    "accent": "#BEE9E8",
    "background": "#ffffff",
    "text": "#171717"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter"
  },
  "announcement": {
    "enabled": false,
    "text": "Livraison gratuite a partir de 50 EUR",
    "link": "/shop"
  },
  "hero": {
    "title": "Bijoux faits avec amour",
    "subtitle": "Des creations uniques, pensees pour sublimer votre beaute naturelle",
    "imageUrl": "",
    "ctaLabel": "Decouvrir la collection",
    "ctaLink": "/shop"
  },
  "nav": {
    "links": [
      {"label": "Boutique", "href": "/shop"},
      {"label": "Nos histoires", "href": "/about"},
      {"label": "Contact", "href": "/contact"}
    ]
  },
  "footer": {
    "about": "Bijoux faits avec amour. Chaque piece est unique et creee avec passion pour sublimer votre beaute naturelle.",
    "contactEmail": "contact@sorani.fr",
    "social": {
      "instagram": "https://instagram.com/sorani.bijoux",
      "facebook": "",
      "tiktok": ""
    }
  }
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

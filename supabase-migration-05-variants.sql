-- ============================================================
-- Migration 05 — Variantes de produit (Couleur / Taille / Matiere...)
-- A executer dans Supabase > SQL Editor
-- Idempotent (peut etre re-execute sans risque)
-- ============================================================

-- 1) Ajout d'une colonne pour le LABEL de variante sur le produit
--    (ex: "Taille", "Couleur", "Materiau", "Longueur")
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variant_type TEXT;

-- 2) Table des variantes elles-memes
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- "Or 18k", "Taille M", "Long 45cm"
  sku TEXT,                                  -- code interne (optionnel)
  color_hex TEXT,                            -- pour les pastilles couleur (optionnel)
  price DECIMAL(10,2),                       -- NULL = prix par defaut du produit
  compare_at_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  image TEXT,                                -- image specifique a la variante (optionnel)
  position INT DEFAULT 0,                    -- pour reorganiser
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_variants_position_idx
  ON product_variants(product_id, position);

-- 3) RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON product_variants;
CREATE POLICY "Variants are viewable by everyone"
  ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage variants" ON product_variants;
CREATE POLICY "Admins manage variants"
  ON product_variants FOR ALL
  USING (public.is_admin());

-- 4) Trigger updated_at
DROP TRIGGER IF EXISTS variants_updated_at ON product_variants;
CREATE TRIGGER variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5) Helper : prix effectif d'une variante
CREATE OR REPLACE FUNCTION variant_effective_price(v_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(v.price, p.price)
  FROM product_variants v
  JOIN products p ON p.id = v.product_id
  WHERE v.id = v_id;
$$ LANGUAGE sql STABLE;

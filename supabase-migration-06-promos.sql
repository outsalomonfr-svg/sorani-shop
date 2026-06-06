-- ============================================================
-- Migration 06 — Codes promo
-- A executer dans Supabase > SQL Editor
-- Idempotent
-- ============================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,                      -- "WELCOME10" (toujours en MAJUSCULES)
  label TEXT,                                      -- "Bienvenue"
  description TEXT,                                -- "10% sur ta premiere commande"
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,           -- 10 = 10% ou 10 EUR selon le type
  min_order DECIMAL(10,2) DEFAULT 0,               -- montant minimum panier
  starts_at TIMESTAMPTZ,                           -- NULL = tout de suite
  expires_at TIMESTAMPTZ,                          -- NULL = sans expiration
  max_uses INT,                                    -- NULL = illimite
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promo_codes_code_idx ON promo_codes(code);
CREATE INDEX IF NOT EXISTS promo_codes_active_idx ON promo_codes(is_active);

-- RLS : tout le monde peut lire les codes actifs (pour la validation),
-- seuls les admins peuvent ecrire
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Promo codes are viewable by everyone" ON promo_codes;
CREATE POLICY "Promo codes are viewable by everyone"
  ON promo_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage promo codes" ON promo_codes;
CREATE POLICY "Admins manage promo codes"
  ON promo_codes FOR ALL USING (public.is_admin());

-- Trigger updated_at
DROP TRIGGER IF EXISTS promo_codes_updated_at ON promo_codes;
CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Force le code en majuscules
CREATE OR REPLACE FUNCTION promo_codes_uppercase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code = UPPER(TRIM(NEW.code));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS promo_codes_uppercase_trg ON promo_codes;
CREATE TRIGGER promo_codes_uppercase_trg
  BEFORE INSERT OR UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION promo_codes_uppercase();

-- Helper : valider et calculer la remise pour un panier
CREATE OR REPLACE FUNCTION validate_promo(p_code TEXT, p_subtotal DECIMAL)
RETURNS TABLE(
  valid BOOLEAN,
  reason TEXT,
  discount_amount DECIMAL,
  promo_id UUID
) AS $$
DECLARE
  p RECORD;
BEGIN
  SELECT * INTO p FROM promo_codes WHERE code = UPPER(TRIM(p_code));

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Code invalide', 0::DECIMAL, NULL::UUID;
    RETURN;
  END IF;

  IF NOT p.is_active THEN
    RETURN QUERY SELECT false, 'Code desactive', 0::DECIMAL, NULL::UUID;
    RETURN;
  END IF;

  IF p.starts_at IS NOT NULL AND p.starts_at > now() THEN
    RETURN QUERY SELECT false, 'Code pas encore actif', 0::DECIMAL, NULL::UUID;
    RETURN;
  END IF;

  IF p.expires_at IS NOT NULL AND p.expires_at < now() THEN
    RETURN QUERY SELECT false, 'Code expire', 0::DECIMAL, NULL::UUID;
    RETURN;
  END IF;

  IF p.max_uses IS NOT NULL AND p.used_count >= p.max_uses THEN
    RETURN QUERY SELECT false, 'Code epuise', 0::DECIMAL, NULL::UUID;
    RETURN;
  END IF;

  IF p_subtotal < p.min_order THEN
    RETURN QUERY SELECT false, 'Montant minimum non atteint', 0::DECIMAL, NULL::UUID;
    RETURN;
  END IF;

  -- Calcul de la remise
  IF p.discount_type = 'percentage' THEN
    RETURN QUERY SELECT
      true,
      ''::TEXT,
      ROUND((p_subtotal * p.discount_value / 100)::DECIMAL, 2),
      p.id;
  ELSE
    RETURN QUERY SELECT
      true,
      ''::TEXT,
      LEAST(p.discount_value, p_subtotal)::DECIMAL,
      p.id;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

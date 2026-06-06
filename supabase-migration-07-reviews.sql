-- ============================================================
-- Migration 07 — Avis clients (reviews + ratings)
-- A executer dans Supabase > SQL Editor (idempotent)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS product_reviews_status_idx ON product_reviews(status);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Public : ne voit que les avis approuves
DROP POLICY IF EXISTS "Approved reviews are public" ON product_reviews;
CREATE POLICY "Approved reviews are public"
  ON product_reviews FOR SELECT
  USING (status = 'approved');

-- Public : peut creer un avis (qui passe en "pending")
DROP POLICY IF EXISTS "Anyone can submit a review" ON product_reviews;
CREATE POLICY "Anyone can submit a review"
  ON product_reviews FOR INSERT
  WITH CHECK (status = 'pending');

-- Admin : tout gerer
DROP POLICY IF EXISTS "Admins manage reviews" ON product_reviews;
CREATE POLICY "Admins manage reviews"
  ON product_reviews FOR ALL
  USING (public.is_admin());

-- Trigger updated_at
DROP TRIGGER IF EXISTS product_reviews_updated_at ON product_reviews;
CREATE TRIGGER product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-flag verified_purchase si l'email a deja commande ce produit
CREATE OR REPLACE FUNCTION mark_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.customer_email = NEW.customer_email
      AND oi.product_id = NEW.product_id
      AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
  ) THEN
    NEW.verified_purchase = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_reviews_verify ON product_reviews;
CREATE TRIGGER product_reviews_verify
  BEFORE INSERT ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION mark_verified_purchase();

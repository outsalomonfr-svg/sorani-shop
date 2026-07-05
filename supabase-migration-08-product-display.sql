-- ============================================================
-- Migration 08 — Options d'affichage produit
--   • display_order    : ordre manuel (glisser-déposer dans l'admin)
--   • show_add_to_cart  : afficher ou non le bouton "Ajouter au panier"
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_add_to_cart BOOLEAN NOT NULL DEFAULT true;

-- Initialise display_order à partir de l'ordre de création actuel
-- (les plus récents en premier, comme l'affichage historique)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 AS rn
  FROM products
)
UPDATE products p
SET display_order = o.rn
FROM ordered o
WHERE p.id = o.id;

-- Index pour un tri rapide
CREATE INDEX IF NOT EXISTS products_display_order_idx ON products(display_order);

-- Vérification
SELECT id, name, display_order, show_add_to_cart
FROM products
ORDER BY display_order
LIMIT 20;

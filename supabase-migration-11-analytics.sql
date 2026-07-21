-- ============================================================
-- Migration 11 — Statistiques de visite (anonymes, sans cookie)
-- ============================================================
-- Aucune donnee personnelle n'est stockee : pas d'adresse IP, pas de nom.
-- "visitor_hash" est une empreinte non reversible qui change chaque jour,
-- ce qui permet de compter les visiteurs uniques d'une journee sans
-- pouvoir les suivre d'un jour a l'autre ni les identifier.
-- Conforme aux conditions d'exemption de consentement de la CNIL.

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'direct',   -- instagram, google, direct, ...
  referrer_host TEXT,
  device TEXT NOT NULL DEFAULT 'desktop',  -- mobile / tablette / desktop
  country TEXT,                            -- code pays (FR, BE, ...)
  visitor_hash TEXT NOT NULL,              -- empreinte anonyme du jour
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views (visitor_hash, created_at DESC);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Lecture reservee aux admins. L'enregistrement des visites se fait cote
-- serveur avec la cle service_role, qui contourne RLS : aucune policy
-- d'insertion n'est donc necessaire (et le public ne peut rien ecrire).
DROP POLICY IF EXISTS "Admins read page views" ON page_views;
CREATE POLICY "Admins read page views" ON page_views
  FOR SELECT USING (public.is_admin());

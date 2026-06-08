-- SmartPharma Guide - PostgreSQL Schema
-- Run this file once to create the full database structure

-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- enables trigram similarity search

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150),
  role          VARCHAR(20)  NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ─────────────────────────────────────────
-- USER HEALTH PROFILES
-- ─────────────────────────────────────────
CREATE TABLE user_health_profiles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_pregnant         BOOLEAN DEFAULT FALSE,
  is_breastfeeding    BOOLEAN DEFAULT FALSE,
  has_hypertension    BOOLEAN DEFAULT FALSE,
  has_diabetes        BOOLEAN DEFAULT FALSE,
  has_liver_disease   BOOLEAN DEFAULT FALSE,
  has_kidney_disease  BOOLEAN DEFAULT FALSE,
  allergies           TEXT[],           -- array of allergy strings
  current_medications TEXT[],           -- free-text medication names
  age                 SMALLINT CHECK (age > 0 AND age < 130),
  notes               TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ─────────────────────────────────────────
-- DRUGS
-- ─────────────────────────────────────────
CREATE TABLE drugs (
  id                  SERIAL PRIMARY KEY,
  drug_name           VARCHAR(255) NOT NULL,
  generic_name        VARCHAR(255),
  brand_names         TEXT[],           -- e.g. ARRAY['Tylenol','Panadol']
  drug_class          VARCHAR(150),
  drug_form           VARCHAR(100),     -- tablet, capsule, syrup, injection
  strength            VARCHAR(100),     -- e.g. "500 mg"
  route               VARCHAR(100),     -- oral, topical, IV
  indications         TEXT,
  mechanism_of_action TEXT,
  dosage_info         TEXT,
  contraindications   TEXT,
  side_effects        TEXT,
  warnings            TEXT,
  pregnancy_category  VARCHAR(5)
                      CHECK (pregnancy_category IN ('A','B','C','D','X','N/A')),
  alcohol_interaction BOOLEAN DEFAULT FALSE,
  alcohol_notes       TEXT,
  hypertension_risk   BOOLEAN DEFAULT FALSE,
  hypertension_notes  TEXT,
  manufacturer        VARCHAR(255),
  atc_code            VARCHAR(20),      -- WHO ATC classification
  rx_otc              VARCHAR(10) DEFAULT 'Rx'
                      CHECK (rx_otc IN ('Rx','OTC','Both')),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drugs_name       ON drugs USING gin (drug_name gin_trgm_ops);
CREATE INDEX idx_drugs_generic    ON drugs USING gin (generic_name gin_trgm_ops);
CREATE INDEX idx_drugs_class      ON drugs (drug_class);
CREATE INDEX idx_drugs_pregnancy  ON drugs (pregnancy_category);

-- ─────────────────────────────────────────
-- MEDICAL CONDITIONS
-- ─────────────────────────────────────────
CREATE TABLE medical_conditions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icd10_code  VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conditions_name ON medical_conditions USING gin (name gin_trgm_ops);

-- drug ↔ condition (many-to-many)
CREATE TABLE drug_conditions (
  drug_id      INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  condition_id INTEGER NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  relation     VARCHAR(20) DEFAULT 'treats'
               CHECK (relation IN ('treats','contraindicated','use_with_caution')),
  PRIMARY KEY (drug_id, condition_id, relation)
);

-- ─────────────────────────────────────────
-- HERBS
-- ─────────────────────────────────────────
CREATE TABLE herbs (
  id                   SERIAL PRIMARY KEY,
  herb_name            VARCHAR(255) NOT NULL,
  scientific_name      VARCHAR(255),
  common_names         TEXT[],
  family               VARCHAR(150),
  parts_used           TEXT,            -- root, leaf, seed, etc.
  benefits             TEXT,
  uses                 TEXT,
  preparation_methods  TEXT,
  extraction_methods   TEXT,
  side_effects         TEXT,
  contraindications    TEXT,
  pregnancy_safe       BOOLEAN DEFAULT NULL,
  hypertension_risk    BOOLEAN DEFAULT FALSE,
  hypertension_notes   TEXT,
  origin_region        VARCHAR(150),
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_herbs_name       ON herbs USING gin (herb_name gin_trgm_ops);
CREATE INDEX idx_herbs_scientific ON herbs USING gin (scientific_name gin_trgm_ops);

-- ─────────────────────────────────────────
-- DRUG–HERB INTERACTIONS
-- ─────────────────────────────────────────
CREATE TABLE drug_herb_interactions (
  id               SERIAL PRIMARY KEY,
  drug_id          INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  herb_id          INTEGER NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
  severity         VARCHAR(20) NOT NULL DEFAULT 'moderate'
                   CHECK (severity IN ('low','moderate','high','contraindicated')),
  description      TEXT NOT NULL,
  evidence_level   VARCHAR(20) DEFAULT 'theoretical'
                   CHECK (evidence_level IN ('theoretical','case_report','clinical_study','established')),
  recommendation   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (drug_id, herb_id)
);

CREATE INDEX idx_dhi_drug     ON drug_herb_interactions (drug_id);
CREATE INDEX idx_dhi_herb     ON drug_herb_interactions (herb_id);
CREATE INDEX idx_dhi_severity ON drug_herb_interactions (severity);

-- ─────────────────────────────────────────
-- HERBAL ALTERNATIVES
-- ─────────────────────────────────────────
CREATE TABLE herbal_alternatives (
  id          SERIAL PRIMARY KEY,
  drug_id     INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
  herb_id     INTEGER NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
  notes       TEXT,
  evidence    VARCHAR(20) DEFAULT 'traditional'
              CHECK (evidence IN ('traditional','studied','clinical')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (drug_id, herb_id)
);

-- ─────────────────────────────────────────
-- ALERT RULES  (admin-configurable)
-- ─────────────────────────────────────────
CREATE TABLE alert_rules (
  id              SERIAL PRIMARY KEY,
  rule_name       VARCHAR(255) NOT NULL UNIQUE,
  condition_field VARCHAR(100) NOT NULL,  -- e.g. 'pregnancy_category', 'alcohol_interaction'
  condition_value VARCHAR(100) NOT NULL,  -- e.g. 'D', 'X', 'true'
  severity        VARCHAR(20)  NOT NULL DEFAULT 'warning'
                  CHECK (severity IN ('info','warning','danger')),
  message_en      TEXT NOT NULL,
  message_ar      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- USER ALERTS  (generated per user session)
-- ─────────────────────────────────────────
CREATE TABLE user_alerts (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_id      INTEGER REFERENCES alert_rules(id) ON DELETE SET NULL,
  drug_id      INTEGER REFERENCES drugs(id) ON DELETE SET NULL,
  herb_id      INTEGER REFERENCES herbs(id) ON DELETE SET NULL,
  severity     VARCHAR(20) NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_alerts_user   ON user_alerts (user_id, is_read);
CREATE INDEX idx_user_alerts_created ON user_alerts (created_at DESC);

-- ─────────────────────────────────────────
-- FAVORITES
-- ─────────────────────────────────────────
CREATE TABLE favorites (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type    VARCHAR(10) NOT NULL CHECK (item_type IN ('drug','herb')),
  drug_id      INTEGER REFERENCES drugs(id) ON DELETE CASCADE,
  herb_id      INTEGER REFERENCES herbs(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, drug_id),
  UNIQUE (user_id, herb_id),
  CHECK (
    (item_type = 'drug' AND drug_id IS NOT NULL AND herb_id IS NULL) OR
    (item_type = 'herb' AND herb_id IS NOT NULL AND drug_id IS NULL)
  )
);

CREATE INDEX idx_favorites_user ON favorites (user_id);

-- ─────────────────────────────────────────
-- SEARCH HISTORY
-- ─────────────────────────────────────────
CREATE TABLE search_history (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  query       VARCHAR(500) NOT NULL,
  result_type VARCHAR(20),   -- 'drug', 'herb', 'condition', 'mixed'
  result_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_user    ON search_history (user_id, created_at DESC);
CREATE INDEX idx_search_query   ON search_history USING gin (query gin_trgm_ops);

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,   -- 'CREATE_DRUG', 'DELETE_HERB', 'LOGIN', etc.
  table_name  VARCHAR(100),
  record_id   INTEGER,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- partition by year for performance
CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE audit_logs_2026 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE INDEX idx_audit_user    ON audit_logs (user_id);
CREATE INDEX idx_audit_action  ON audit_logs (action);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);

-- ─────────────────────────────────────────
-- HELPER: auto-update updated_at
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_drugs
  BEFORE UPDATE ON drugs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_herbs
  BEFORE UPDATE ON herbs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_health_profiles
  BEFORE UPDATE ON user_health_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────
-- USEFUL VIEWS
-- ─────────────────────────────────────────
CREATE VIEW vw_drug_with_herbs AS
SELECT
  d.id AS drug_id,
  d.drug_name,
  d.generic_name,
  d.pregnancy_category,
  json_agg(
    json_build_object(
      'herb_id', h.id,
      'herb_name', h.herb_name,
      'severity', dhi.severity,
      'description', dhi.description
    )
  ) FILTER (WHERE h.id IS NOT NULL) AS interactions
FROM drugs d
LEFT JOIN drug_herb_interactions dhi ON dhi.drug_id = d.id
LEFT JOIN herbs h ON h.id = dhi.herb_id
GROUP BY d.id;

CREATE VIEW vw_user_alerts_full AS
SELECT
  ua.id, ua.user_id, ua.severity, ua.message, ua.is_read, ua.created_at,
  d.drug_name, h.herb_name
FROM user_alerts ua
LEFT JOIN drugs d ON d.id = ua.drug_id
LEFT JOIN herbs h ON h.id = ua.herb_id;

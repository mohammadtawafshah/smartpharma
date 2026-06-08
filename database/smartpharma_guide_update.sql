-- ============================================================
--  SmartPharma Guide — Database Update
--  Run this AFTER importing smartpharma_guide_database.sql
--  Adds missing tables + columns to match the ERD
-- ============================================================

USE smartpharma;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- ALTER: users — add last_login
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login DATETIME NULL AFTER updated_at;

-- ============================================================
-- ALTER: user_health_profiles — add missing columns
-- ============================================================
ALTER TABLE user_health_profiles
  ADD COLUMN IF NOT EXISTS has_high_blood_pressure TINYINT(1) DEFAULT 0 AFTER has_hypertension,
  ADD COLUMN IF NOT EXISTS chronic_conditions TEXT NULL AFTER current_medications,
  ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2) NULL AFTER age,
  ADD COLUMN IF NOT EXISTS height DECIMAL(5,2) NULL AFTER weight;

-- ============================================================
-- ALTER: drugs — add trade_name + image
-- ============================================================
ALTER TABLE drugs
  ADD COLUMN IF NOT EXISTS trade_name VARCHAR(200) NULL AFTER drug_name,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER storage_info,
  ADD COLUMN IF NOT EXISTS last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER image_url;

-- ============================================================
-- ALTER: herbs — add image + evidence_level + toxicity_level
-- ============================================================
ALTER TABLE herbs
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER contraindications,
  ADD COLUMN IF NOT EXISTS evidence_level ENUM('high','moderate','low','traditional') DEFAULT 'traditional' AFTER image_url,
  ADD COLUMN IF NOT EXISTS toxicity_level ENUM('low','medium','high') DEFAULT 'low' AFTER evidence_level,
  ADD COLUMN IF NOT EXISTS extraction_method TEXT NULL AFTER preparation_method,
  ADD COLUMN IF NOT EXISTS cultivation_info TEXT NULL AFTER extraction_method;

-- ============================================================
-- TABLE: categories
-- ============================================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id                INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name_ar           VARCHAR(150) NOT NULL,
  name_en           VARCHAR(150) NOT NULL,
  description       TEXT,
  image_url         VARCHAR(500),
  parent_category_id INT NULL,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_categories_parent (parent_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: drug_categories
-- ============================================================
DROP TABLE IF EXISTS drug_categories;
CREATE TABLE drug_categories (
  drug_id     INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (drug_id, category_id),
  FOREIGN KEY (drug_id)     REFERENCES drugs(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: herb_categories
-- ============================================================
DROP TABLE IF EXISTS herb_categories;
CREATE TABLE herb_categories (
  herb_id     INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (herb_id, category_id),
  FOREIGN KEY (herb_id)     REFERENCES herbs(id)       ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: articles
-- ============================================================
DROP TABLE IF EXISTS articles;
CREATE TABLE articles (
  id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title_ar      VARCHAR(300) NOT NULL,
  title_en      VARCHAR(300) NOT NULL,
  content_ar    LONGTEXT,
  content_en    LONGTEXT,
  author        VARCHAR(150),
  category      VARCHAR(100),
  cover_image   VARCHAR(500),
  reading_time  SMALLINT UNSIGNED DEFAULT 5,
  views         INT          NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  published_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_articles_category (category),
  FULLTEXT INDEX ft_articles (title_en, title_ar, content_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: references (scientific sources)
-- ============================================================
DROP TABLE IF EXISTS `references`;
CREATE TABLE `references` (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  citation    TEXT         NOT NULL,
  source_url  VARCHAR(500),
  source_type ENUM('journal','book','website','guideline','other') DEFAULT 'journal',
  year        YEAR,
  publisher   VARCHAR(200),
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: drug_references
-- ============================================================
DROP TABLE IF EXISTS drug_references;
CREATE TABLE drug_references (
  drug_id      INT NOT NULL,
  reference_id INT NOT NULL,
  PRIMARY KEY (drug_id, reference_id),
  FOREIGN KEY (drug_id)      REFERENCES drugs(id)       ON DELETE CASCADE,
  FOREIGN KEY (reference_id) REFERENCES `references`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: herb_references
-- ============================================================
DROP TABLE IF EXISTS herb_references;
CREATE TABLE herb_references (
  herb_id      INT NOT NULL,
  reference_id INT NOT NULL,
  PRIMARY KEY (herb_id, reference_id),
  FOREIGN KEY (herb_id)      REFERENCES herbs(id)        ON DELETE CASCADE,
  FOREIGN KEY (reference_id) REFERENCES `references`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: infographics
-- ============================================================
DROP TABLE IF EXISTS infographics;
CREATE TABLE infographics (
  id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(300) NOT NULL,
  image_url     VARCHAR(500) NOT NULL,
  description   TEXT,
  related_to    ENUM('drug','herb','article','general') DEFAULT 'general',
  related_id    INT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: system_settings
-- ============================================================
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  value       JSON,
  description VARCHAR(300),
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED: categories
-- ============================================================
INSERT INTO categories (name_ar, name_en, description) VALUES
-- Parent categories
('المضادات الحيوية',     'Antibiotics',         'Medications used to treat bacterial infections'),
('مسكنات الألم',         'Analgesics',          'Pain relief medications'),
('أدوية القلب والأوعية', 'Cardiovascular',      'Heart and blood vessel medications'),
('أدوية السكري',         'Antidiabetics',       'Medications for diabetes management'),
('أدوية الحساسية',       'Antihistamines',      'Allergy medications'),
('أعشاب هضمية',          'Digestive Herbs',     'Herbs supporting digestive health'),
('أعشاب مضادة للالتهاب', 'Anti-inflammatory Herbs', 'Herbs with anti-inflammatory properties'),
('أعشاب مناعية',         'Immune Boosting Herbs','Herbs that support the immune system');

-- ============================================================
-- SEED: drug_categories (link existing drugs to categories)
-- ============================================================
INSERT IGNORE INTO drug_categories (drug_id, category_id)
SELECT d.id, c.id FROM drugs d, categories c
WHERE d.drug_name = 'Amoxicillin' AND c.name_en = 'Antibiotics';

INSERT IGNORE INTO drug_categories (drug_id, category_id)
SELECT d.id, c.id FROM drugs d, categories c
WHERE d.drug_name IN ('Paracetamol','Ibuprofen') AND c.name_en = 'Analgesics';

INSERT IGNORE INTO drug_categories (drug_id, category_id)
SELECT d.id, c.id FROM drugs d, categories c
WHERE d.drug_name IN ('Amlodipine','Warfarin') AND c.name_en = 'Cardiovascular';

INSERT IGNORE INTO drug_categories (drug_id, category_id)
SELECT d.id, c.id FROM drugs d, categories c
WHERE d.drug_name = 'Metformin' AND c.name_en = 'Antidiabetics';

-- ============================================================
-- SEED: herb_categories
-- ============================================================
INSERT IGNORE INTO herb_categories (herb_id, category_id)
SELECT h.id, c.id FROM herbs h, categories c
WHERE h.herb_name IN ('Ginger','Chamomile') AND c.name_en = 'Digestive Herbs';

INSERT IGNORE INTO herb_categories (herb_id, category_id)
SELECT h.id, c.id FROM herbs h, categories c
WHERE h.herb_name IN ('Turmeric','Ginger') AND c.name_en = 'Anti-inflammatory Herbs';

INSERT IGNORE INTO herb_categories (herb_id, category_id)
SELECT h.id, c.id FROM herbs h, categories c
WHERE h.herb_name IN ('Black Seed','Garlic') AND c.name_en = 'Immune Boosting Herbs';

-- ============================================================
-- SEED: system_settings
-- ============================================================
INSERT INTO system_settings (setting_key, value, description) VALUES
('site_name',        '"SmartPharma Guide"',  'Website name'),
('maintenance_mode', 'false',                'Enable/disable maintenance mode'),
('items_per_page',   '12',                   'Default pagination size'),
('contact_email',    '"admin@smartpharma.com"', 'Admin contact email');

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- UPDATE DONE!
-- Added tables: categories, drug_categories, herb_categories,
--               articles, references, drug_references,
--               herb_references, infographics, system_settings
-- Altered tables: users, user_health_profiles, drugs, herbs
-- ============================================================

-- SmartPharma Guide — MySQL Schema (for XAMPP)
-- Run this in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS smartpharma
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartpharma;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150),
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- USER HEALTH PROFILES
-- ─────────────────────────────────────────
CREATE TABLE user_health_profiles (
  id                  INT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id             INT       NOT NULL,
  is_pregnant         TINYINT(1) DEFAULT 0,
  is_breastfeeding    TINYINT(1) DEFAULT 0,
  has_hypertension    TINYINT(1) DEFAULT 0,
  has_diabetes        TINYINT(1) DEFAULT 0,
  has_liver_disease   TINYINT(1) DEFAULT 0,
  has_kidney_disease  TINYINT(1) DEFAULT 0,
  allergies           TEXT,               -- comma-separated
  current_medications TEXT,               -- comma-separated
  age                 SMALLINT UNSIGNED,
  notes               TEXT,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_profile (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- DRUGS
-- ─────────────────────────────────────────
CREATE TABLE drugs (
  id                  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  drug_name           VARCHAR(255) NOT NULL,
  generic_name        VARCHAR(255),
  brand_names         TEXT,               -- comma-separated brand names
  drug_class          VARCHAR(150),
  drug_form           VARCHAR(100),
  strength            VARCHAR(100),
  route               VARCHAR(100),
  indications         TEXT,
  mechanism_of_action TEXT,
  dosage_info         TEXT,
  contraindications   TEXT,
  side_effects        TEXT,
  warnings            TEXT,
  pregnancy_category  ENUM('A','B','C','D','X','N/A') DEFAULT 'N/A',
  alcohol_interaction TINYINT(1) DEFAULT 0,
  alcohol_notes       TEXT,
  hypertension_risk   TINYINT(1) DEFAULT 0,
  hypertension_notes  TEXT,
  manufacturer        VARCHAR(255),
  atc_code            VARCHAR(20),
  rx_otc              ENUM('Rx','OTC','Both') DEFAULT 'Rx',
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT INDEX ft_drugs (drug_name, generic_name, brand_names, indications, side_effects),
  INDEX idx_drug_class (drug_class),
  INDEX idx_pregnancy (pregnancy_category)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- MEDICAL CONDITIONS
-- ─────────────────────────────────────────
CREATE TABLE medical_conditions (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icd10_code  VARCHAR(20),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT INDEX ft_conditions (name, description)
) ENGINE=InnoDB;

CREATE TABLE drug_conditions (
  drug_id      INT NOT NULL,
  condition_id INT NOT NULL,
  relation     ENUM('treats','contraindicated','use_with_caution') DEFAULT 'treats',
  PRIMARY KEY (drug_id, condition_id, relation),
  FOREIGN KEY (drug_id)      REFERENCES drugs(id) ON DELETE CASCADE,
  FOREIGN KEY (condition_id) REFERENCES medical_conditions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- HERBS
-- ─────────────────────────────────────────
CREATE TABLE herbs (
  id                   INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  herb_name            VARCHAR(255) NOT NULL,
  scientific_name      VARCHAR(255),
  common_names         TEXT,
  family               VARCHAR(150),
  parts_used           TEXT,
  benefits             TEXT,
  uses                 TEXT,
  preparation_methods  TEXT,
  extraction_methods   TEXT,
  side_effects         TEXT,
  contraindications    TEXT,
  pregnancy_safe       TINYINT(1) DEFAULT NULL,
  hypertension_risk    TINYINT(1) DEFAULT 0,
  hypertension_notes   TEXT,
  origin_region        VARCHAR(150),
  is_active            TINYINT(1) NOT NULL DEFAULT 1,
  created_at           DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT INDEX ft_herbs (herb_name, scientific_name, common_names, benefits, uses)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- DRUG–HERB INTERACTIONS
-- ─────────────────────────────────────────
CREATE TABLE drug_herb_interactions (
  id             INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  drug_id        INT  NOT NULL,
  herb_id        INT  NOT NULL,
  severity       ENUM('low','moderate','high','contraindicated') NOT NULL DEFAULT 'moderate',
  description    TEXT NOT NULL,
  evidence_level ENUM('theoretical','case_report','clinical_study','established') DEFAULT 'theoretical',
  recommendation TEXT,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_drug_herb (drug_id, herb_id),
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE,
  INDEX idx_severity (severity)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- HERBAL ALTERNATIVES
-- ─────────────────────────────────────────
CREATE TABLE herbal_alternatives (
  id         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  drug_id    INT  NOT NULL,
  herb_id    INT  NOT NULL,
  notes      TEXT,
  evidence   ENUM('traditional','studied','clinical') DEFAULT 'traditional',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_alt (drug_id, herb_id),
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- ALERT RULES
-- ─────────────────────────────────────────
CREATE TABLE alert_rules (
  id              INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  rule_name       VARCHAR(255) NOT NULL UNIQUE,
  condition_field VARCHAR(100) NOT NULL,
  condition_value VARCHAR(100) NOT NULL,
  severity        ENUM('info','warning','danger') NOT NULL DEFAULT 'warning',
  message_en      TEXT NOT NULL,
  message_ar      TEXT,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- USER ALERTS
-- ─────────────────────────────────────────
CREATE TABLE user_alerts (
  id         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT  NOT NULL,
  rule_id    INT  DEFAULT NULL,
  drug_id    INT  DEFAULT NULL,
  herb_id    INT  DEFAULT NULL,
  severity   ENUM('info','warning','danger') NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL,
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE SET NULL,
  FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE SET NULL,
  INDEX idx_user_alerts (user_id, is_read)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- FAVORITES
-- ─────────────────────────────────────────
CREATE TABLE favorites (
  id         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT  NOT NULL,
  item_type  ENUM('drug','herb') NOT NULL,
  drug_id    INT  DEFAULT NULL,
  herb_id    INT  DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE,
  UNIQUE KEY uq_fav_drug (user_id, drug_id),
  UNIQUE KEY uq_fav_herb (user_id, herb_id),
  INDEX idx_favorites_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- SEARCH HISTORY
-- ─────────────────────────────────────────
CREATE TABLE search_history (
  id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          DEFAULT NULL,
  query        VARCHAR(500) NOT NULL,
  result_type  VARCHAR(20),
  result_count INT          DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_search_user (user_id),
  FULLTEXT INDEX ft_search_query (query)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
CREATE TABLE audit_logs (
  id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          DEFAULT NULL,
  action     VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id  INT,
  old_data   JSON,
  new_data   JSON,
  ip_address VARCHAR(45),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user    (user_id),
  INDEX idx_audit_action  (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- DEFAULT ALERT RULES
-- ─────────────────────────────────────────
INSERT INTO alert_rules (rule_name, condition_field, condition_value, severity, message_en, message_ar) VALUES
('Pregnancy Category D Warning',    'pregnancy_category', 'D',    'warning', 'This drug is Pregnancy Category D. Evidence of fetal risk exists. Consult your doctor.', 'هذا الدواء من الفئة D للحمل. استشيري طبيبك.'),
('Pregnancy Category X Banned',     'pregnancy_category', 'X',    'danger',  'This drug is Category X — CONTRAINDICATED in pregnancy. Do not use.', 'هذا الدواء محظور تماماً أثناء الحمل (الفئة X).'),
('Alcohol Interaction Warning',     'alcohol_interaction','1',    'warning', 'This drug interacts dangerously with alcohol. Avoid alcohol while taking it.', 'هذا الدواء يتفاعل مع الكحول. تجنب الكحول.'),
('Hypertension Risk — Drug',        'hypertension_risk',  '1',    'warning', 'This drug may raise blood pressure. Use with caution if you have hypertension.', 'قد يرفع هذا الدواء ضغط الدم. استشر طبيبك.'),
('High Drug-Herb Interaction',      'dhi_severity',       'high', 'danger',  'A high-severity interaction exists between this drug and a herb. Consult a pharmacist.', 'يوجد تفاعل خطير بين هذا الدواء وعشبة. استشر صيدلانيك.'),
('Contraindicated Drug-Herb',       'dhi_severity','contraindicated','danger','This drug is CONTRAINDICATED with an herb in your profile. Do not combine.', 'هذا الدواء ممنوع مع إحدى الأعشاب في ملفك الصحي.');

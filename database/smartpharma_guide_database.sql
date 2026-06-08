-- ============================================================
--  SmartPharma Guide — Complete Database
--  Import this file in phpMyAdmin:
--  Database tab → Import → Choose file → Go
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS smartpharma
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartpharma;

-- ============================================================
-- TABLE: users
-- ============================================================
DROP TABLE IF EXISTS users;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_health_profiles
-- ============================================================
DROP TABLE IF EXISTS user_health_profiles;
CREATE TABLE user_health_profiles (
  id                  INT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id             INT        NOT NULL,
  is_pregnant         TINYINT(1) DEFAULT 0,
  is_breastfeeding    TINYINT(1) DEFAULT 0,
  has_hypertension    TINYINT(1) DEFAULT 0,
  has_diabetes        TINYINT(1) DEFAULT 0,
  has_liver_disease   TINYINT(1) DEFAULT 0,
  has_kidney_disease  TINYINT(1) DEFAULT 0,
  allergies           TEXT,
  current_medications TEXT,
  age                 SMALLINT UNSIGNED,
  notes               TEXT,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_profile (user_id),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: medical_conditions
-- ============================================================
DROP TABLE IF EXISTS medical_conditions;
CREATE TABLE medical_conditions (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icd10_code  VARCHAR(20),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_conditions (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: drugs
-- ============================================================
DROP TABLE IF EXISTS drugs;
CREATE TABLE drugs (
  id                  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  drug_name           VARCHAR(255) NOT NULL,
  generic_name        VARCHAR(255),
  brand_names         TEXT,
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
  FULLTEXT KEY ft_drugs (drug_name, generic_name, brand_names, indications, side_effects),
  INDEX idx_drug_class      (drug_class),
  INDEX idx_pregnancy       (pregnancy_category),
  INDEX idx_alcohol         (alcohol_interaction),
  INDEX idx_hypertension    (hypertension_risk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: drug_conditions  (drug ↔ condition)
-- ============================================================
DROP TABLE IF EXISTS drug_conditions;
CREATE TABLE drug_conditions (
  drug_id      INT NOT NULL,
  condition_id INT NOT NULL,
  relation     ENUM('treats','contraindicated','use_with_caution') DEFAULT 'treats',
  PRIMARY KEY (drug_id, condition_id, relation),
  CONSTRAINT fk_dc_drug      FOREIGN KEY (drug_id)      REFERENCES drugs(id)              ON DELETE CASCADE,
  CONSTRAINT fk_dc_condition FOREIGN KEY (condition_id) REFERENCES medical_conditions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: herbs
-- ============================================================
DROP TABLE IF EXISTS herbs;
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
  FULLTEXT KEY ft_herbs (herb_name, scientific_name, common_names, benefits, uses)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: drug_herb_interactions
-- ============================================================
DROP TABLE IF EXISTS drug_herb_interactions;
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
  INDEX idx_severity (severity),
  CONSTRAINT fk_dhi_drug FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  CONSTRAINT fk_dhi_herb FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: herbal_alternatives
-- ============================================================
DROP TABLE IF EXISTS herbal_alternatives;
CREATE TABLE herbal_alternatives (
  id         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  drug_id    INT  NOT NULL,
  herb_id    INT  NOT NULL,
  notes      TEXT,
  evidence   ENUM('traditional','studied','clinical') DEFAULT 'traditional',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_alt (drug_id, herb_id),
  CONSTRAINT fk_ha_drug FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  CONSTRAINT fk_ha_herb FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: alert_rules
-- ============================================================
DROP TABLE IF EXISTS alert_rules;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_alerts
-- ============================================================
DROP TABLE IF EXISTS user_alerts;
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
  INDEX idx_user_alerts      (user_id, is_read),
  INDEX idx_user_alerts_date (created_at),
  CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE,
  CONSTRAINT fk_ua_rule FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE SET NULL,
  CONSTRAINT fk_ua_drug FOREIGN KEY (drug_id) REFERENCES drugs(id)       ON DELETE SET NULL,
  CONSTRAINT fk_ua_herb FOREIGN KEY (herb_id) REFERENCES herbs(id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: favorites
-- ============================================================
DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
  id         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT  NOT NULL,
  item_type  ENUM('drug','herb') NOT NULL,
  drug_id    INT  DEFAULT NULL,
  herb_id    INT  DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav_drug (user_id, drug_id),
  UNIQUE KEY uq_fav_herb (user_id, herb_id),
  INDEX idx_favorites_user (user_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_drug FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_herb FOREIGN KEY (herb_id) REFERENCES herbs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: search_history
-- ============================================================
DROP TABLE IF EXISTS search_history;
CREATE TABLE search_history (
  id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          DEFAULT NULL,
  query        VARCHAR(500) NOT NULL,
  result_type  VARCHAR(20),
  result_count INT          DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_user  (user_id),
  INDEX idx_search_date  (created_at),
  FULLTEXT KEY ft_search_query (query),
  CONSTRAINT fk_sh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: audit_logs
-- ============================================================
DROP TABLE IF EXISTS audit_logs;
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
  INDEX idx_audit_user    (user_id),
  INDEX idx_audit_action  (action),
  INDEX idx_audit_created (created_at),
  CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA: alert_rules
-- ============================================================
INSERT INTO alert_rules (rule_name, condition_field, condition_value, severity, message_en, message_ar) VALUES
('Pregnancy Category D Warning',
 'pregnancy_category', 'D', 'warning',
 'This drug is Pregnancy Category D. There is positive evidence of fetal risk. Use only if the potential benefit justifies the potential risk. Consult your doctor immediately.',
 'هذا الدواء من الفئة D للحمل. هناك أدلة على خطر على الجنين. لا تستخدميه إلا إذا كانت الفائدة تفوق الخطر. استشيري طبيبك فوراً.'),

('Pregnancy Category X — Contraindicated',
 'pregnancy_category', 'X', 'danger',
 'DANGER: This drug is Pregnancy Category X and is ABSOLUTELY CONTRAINDICATED during pregnancy. Studies show fetal abnormalities. Do NOT use under any circumstances during pregnancy.',
 'خطر: هذا الدواء من الفئة X وهو محظور تماماً أثناء الحمل. أثبتت الدراسات تشوهات جنينية. لا تستخدميه أبداً أثناء الحمل.'),

('Alcohol Interaction Warning',
 'alcohol_interaction', '1', 'warning',
 'This drug has a known interaction with alcohol. Combining alcohol with this medication can increase side effects such as drowsiness, dizziness, or liver damage. Avoid alcohol completely.',
 'هذا الدواء يتفاعل مع الكحول. الجمع بينهما قد يزيد الآثار الجانبية. تجنب الكحول تماماً.'),

('Hypertension Risk — Drug',
 'hypertension_risk', '1', 'warning',
 'This drug may raise blood pressure or interfere with antihypertensive medications. If you have high blood pressure, monitor your BP closely and consult your doctor before use.',
 'قد يرفع هذا الدواء ضغط الدم أو يتعارض مع أدوية الضغط. إذا كنت تعاني من ارتفاع الضغط، راقب ضغطك واستشر طبيبك.'),

('High Severity Drug-Herb Interaction',
 'dhi_severity', 'high', 'danger',
 'A HIGH-SEVERITY interaction exists between this drug and an herb. This combination may cause serious side effects. Consult a pharmacist or doctor before taking them together.',
 'يوجد تفاعل شديد الخطورة بين هذا الدواء وعشبة. هذا التركيب قد يسبب آثاراً جانبية خطيرة. استشر صيدلانيك أو طبيبك.'),

('Contraindicated Drug-Herb Interaction',
 'dhi_severity', 'contraindicated', 'danger',
 'CONTRAINDICATED: This drug must NOT be combined with an herb in your profile. This combination is considered dangerous and should be avoided entirely.',
 'ممنوع: يجب عدم الجمع بين هذا الدواء وعشبة معينة. هذا التركيب خطير ويجب تجنبه كلياً.');

-- ============================================================
-- SEED DATA: medical_conditions
-- ============================================================
INSERT INTO medical_conditions (name, description, icd10_code) VALUES
('Hypertension',         'High blood pressure — a condition where blood pressure in the arteries is persistently elevated.',     'I10'),
('Type 2 Diabetes',      'Chronic condition affecting how the body processes blood sugar (glucose).',                             'E11'),
('Atrial Fibrillation',  'Irregular and often rapid heart rate that increases risk of stroke.',                                   'I48'),
('Osteoarthritis',       'Degenerative joint disease causing cartilage breakdown.',                                               'M19'),
('Depression',           'Mental health disorder characterised by persistent sadness and loss of interest.',                     'F32'),
('Anxiety Disorder',     'Mental health condition characterised by excessive fear or worry.',                                    'F41'),
('Gastric Ulcer',        'Open sore that develops on the inside lining of the stomach.',                                         'K25'),
('Bacterial Infection',  'Infection caused by pathogenic bacteria requiring antibiotic treatment.',                              'A49'),
('Common Cold',          'Viral infectious disease of the upper respiratory tract.',                                             'J00'),
('Fever',                'Body temperature above the normal range, usually a sign of infection.',                               'R50'),
('Headache',             'Pain in any region of the head.',                                                                      'G44'),
('Insomnia',             'Persistent problems falling and staying asleep.',                                                      'G47.0'),
('Asthma',               'Chronic inflammatory disease of the airways causing breathing difficulties.',                          'J45'),
('Nausea and Vomiting',  'Feeling of unease and discomfort in the stomach with an urge to vomit.',                             'R11'),
('Inflammation',         'Body response to injury or infection — redness, swelling, pain, and heat.',                          'M79');

-- ============================================================
-- SEED DATA: drugs  (15 common drugs)
-- ============================================================
INSERT INTO drugs (drug_name, generic_name, brand_names, drug_class, drug_form, strength, route,
  indications, mechanism_of_action, dosage_info, contraindications, side_effects, warnings,
  pregnancy_category, alcohol_interaction, alcohol_notes, hypertension_risk, hypertension_notes,
  manufacturer, atc_code, rx_otc) VALUES

('Paracetamol',
 'Acetaminophen',
 'Panadol, Tylenol, Adol, Calpol',
 'Analgesic / Antipyretic',
 'Tablet / Syrup',
 '500 mg / 1000 mg',
 'Oral',
 'Relief of mild to moderate pain (headache, toothache, muscle ache) and reduction of fever.',
 'Inhibits prostaglandin synthesis in the central nervous system. Reduces fever by acting on hypothalamic heat-regulating centres.',
 'Adults: 500–1000 mg every 4–6 hours. Maximum 4000 mg per day. Children: based on weight.',
 'Severe liver disease. Known hypersensitivity to paracetamol.',
 'Generally well tolerated. Overdose can cause severe liver failure. Rare: skin rash, blood disorders.',
 'Do not exceed recommended dose. Avoid in liver disease or regular alcohol use. Check other medications for paracetamol content to avoid double dosing.',
 'B', 0, NULL, 0, NULL,
 'Various', 'N02BE01', 'OTC'),

('Ibuprofen',
 'Ibuprofen',
 'Advil, Brufen, Nurofen, Motrin',
 'NSAID (Non-Steroidal Anti-Inflammatory)',
 'Tablet / Capsule / Suspension',
 '200 mg / 400 mg / 600 mg',
 'Oral',
 'Pain relief, anti-inflammatory, fever reduction. Used for headache, dental pain, menstrual cramps, arthritis, muscle pain.',
 'Non-selective inhibitor of COX-1 and COX-2 enzymes, reducing prostaglandin synthesis which mediates pain and inflammation.',
 'Adults: 200–400 mg every 4–6 hours. Maximum 1200 mg/day (OTC) or 2400 mg/day (Rx). Take with food.',
 'Pregnancy (3rd trimester). Active peptic ulcer. Severe heart failure. Hypersensitivity to NSAIDs.',
 'Stomach upset, nausea, heartburn, dizziness. Long-term use: increased risk of gastric ulcer, cardiovascular events, kidney problems.',
 'Avoid in third trimester of pregnancy. Can raise blood pressure. Use lowest effective dose for shortest duration. Avoid with anticoagulants.',
 'D', 1, 'Alcohol increases risk of gastrointestinal bleeding when combined with ibuprofen.', 1, 'Ibuprofen can raise blood pressure and reduce effectiveness of antihypertensive drugs.',
 'Various', 'M01AE01', 'OTC'),

('Amoxicillin',
 'Amoxicillin Trihydrate',
 'Amoxil, Augmentin (with clavulanate), Trimox',
 'Antibiotic — Penicillin class',
 'Capsule / Suspension',
 '250 mg / 500 mg',
 'Oral',
 'Bacterial infections: throat, ear, sinus, urinary tract, chest infections, dental infections.',
 'Beta-lactam antibiotic. Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins.',
 'Adults: 250–500 mg three times daily. Children: 20–40 mg/kg/day in divided doses. Course: 5–10 days.',
 'Allergy to penicillin or cephalosporins. Infectious mononucleosis (causes rash).',
 'Diarrhoea, nausea, stomach upset. Allergic reactions (rash, urticaria). Rarely: anaphylaxis.',
 'Always ask about penicillin allergy before prescribing. Complete the full course. Can affect oral contraceptives.',
 'B', 0, NULL, 0, NULL,
 'Various', 'J01CA04', 'Rx'),

('Metformin',
 'Metformin Hydrochloride',
 'Glucophage, Glycon, Fortamet',
 'Antidiabetic — Biguanide',
 'Tablet',
 '500 mg / 850 mg / 1000 mg',
 'Oral',
 'Type 2 diabetes mellitus. First-line treatment to lower blood glucose.',
 'Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity.',
 'Start 500 mg twice daily with meals. Gradually increase. Maximum 2550 mg/day.',
 'Severe kidney impairment (eGFR < 30). Liver disease. Excessive alcohol use. Metabolic acidosis.',
 'Nausea, diarrhoea, stomach upset (usually improve with time). Rare: lactic acidosis (serious).',
 'Hold before procedures using iodinated contrast. Monitor kidney function regularly. Vitamin B12 levels may decrease.',
 'B', 1, 'Alcohol combined with metformin increases risk of lactic acidosis.', 0, NULL,
 'Various', 'A10BA02', 'Rx'),

('Amlodipine',
 'Amlodipine Besylate',
 'Norvasc, Amlovas, Istin',
 'Calcium Channel Blocker',
 'Tablet',
 '5 mg / 10 mg',
 'Oral',
 'Hypertension (high blood pressure) and angina (chest pain).',
 'Inhibits calcium ion influx into vascular smooth muscle and cardiac muscle, causing arterial vasodilation and reduced blood pressure.',
 'Hypertension: 5 mg once daily. May increase to 10 mg. Angina: 5–10 mg once daily.',
 'Severe hypotension. Cardiogenic shock. Aortic stenosis.',
 'Ankle and foot swelling (oedema), flushing, headache, dizziness, fatigue.',
 'Monitor blood pressure regularly. May cause reflex tachycardia. Grapefruit juice may increase levels.',
 'C', 1, 'Alcohol may enhance blood pressure lowering effect causing excessive hypotension.', 0, NULL,
 'Various', 'C08CA01', 'Rx'),

('Warfarin',
 'Warfarin Sodium',
 'Coumadin, Jantoven',
 'Anticoagulant — Vitamin K antagonist',
 'Tablet',
 '1 mg / 2 mg / 2.5 mg / 5 mg',
 'Oral',
 'Prevention and treatment of blood clots. Atrial fibrillation. Deep vein thrombosis. Pulmonary embolism. Mechanical heart valves.',
 'Inhibits vitamin K epoxide reductase, preventing activation of clotting factors II, VII, IX, X.',
 'Highly individualised — dose depends on INR monitoring. Typical starting dose 2–5 mg/day.',
 'Pregnancy (Category X). Active bleeding. Severe liver disease. Uncontrolled hypertension.',
 'Bleeding (major risk) — bruising, prolonged bleeding from cuts, blood in urine or stool. Rarely: skin necrosis.',
 'Many drug and food interactions — especially vitamin K-rich foods, antibiotics, NSAIDs. Regular INR monitoring mandatory. Avoid sudden changes in diet.',
 'X', 1, 'Alcohol significantly alters warfarin metabolism. Binge drinking increases bleeding risk; chronic drinking decreases anticoagulation.', 1, 'Warfarin should be used with extreme caution in uncontrolled hypertension due to bleeding risk.',
 'Various', 'B01AA03', 'Rx'),

('Atorvastatin',
 'Atorvastatin Calcium',
 'Lipitor, Atorlip, Torvast',
 'Statin — HMG-CoA Reductase Inhibitor',
 'Tablet',
 '10 mg / 20 mg / 40 mg / 80 mg',
 'Oral',
 'High cholesterol (hypercholesterolaemia). Prevention of cardiovascular disease.',
 'Competitively inhibits HMG-CoA reductase, the enzyme responsible for cholesterol synthesis in the liver.',
 'Starting dose 10–20 mg once daily. May increase to 80 mg. Can be taken at any time of day.',
 'Active liver disease. Pregnancy. Breastfeeding. Concomitant use of strong CYP3A4 inhibitors.',
 'Muscle pain (myalgia), muscle weakness. Rare: rhabdomyolysis. Liver enzyme elevation. Headache.',
 'Monitor liver function and creatine kinase. Report unexplained muscle pain immediately. Avoid grapefruit juice.',
 'X', 0, NULL, 0, NULL,
 'Various', 'C10AA05', 'Rx'),

('Omeprazole',
 'Omeprazole',
 'Losec, Prilosec, Omez',
 'Proton Pump Inhibitor (PPI)',
 'Capsule / Tablet',
 '20 mg / 40 mg',
 'Oral',
 'Gastric and duodenal ulcers. GERD (acid reflux). Zollinger-Ellison syndrome. H. pylori eradication (with antibiotics).',
 'Irreversibly inhibits H+/K+-ATPase (the proton pump) in gastric parietal cells, reducing stomach acid secretion.',
 'Adults: 20–40 mg once daily before meals. For ulcers: 4–8 weeks. For maintenance: 20 mg/day.',
 'Hypersensitivity to PPIs.',
 'Headache, diarrhoea, nausea. Long-term use: decreased magnesium levels, vitamin B12 deficiency, increased fracture risk.',
 'Long-term use not recommended without medical review. May mask symptoms of gastric cancer. Can reduce effectiveness of clopidogrel.',
 'C', 0, NULL, 0, NULL,
 'Various', 'A02BC01', 'Both'),

('Cetirizine',
 'Cetirizine Hydrochloride',
 'Zyrtec, Zirtec, Reactine',
 'Antihistamine — 2nd generation',
 'Tablet / Syrup',
 '10 mg',
 'Oral',
 'Allergic rhinitis (hay fever). Urticaria (hives). Allergic conjunctivitis. Allergic skin conditions.',
 'Selective peripheral H1-receptor antagonist. Minimal CNS penetration compared to first-generation antihistamines.',
 'Adults and children over 12: 10 mg once daily. Children 6–12: 5–10 mg daily.',
 'Hypersensitivity to cetirizine or hydroxyzine.',
 'Drowsiness (less than older antihistamines), dry mouth, headache, fatigue.',
 'May cause drowsiness — caution when driving. Avoid alcohol. Dose adjustment in kidney impairment.',
 'B', 1, 'Alcohol may enhance the sedative effects of cetirizine.', 0, NULL,
 'Various', 'R06AE07', 'OTC'),

('Metronidazole',
 'Metronidazole',
 'Flagyl, Metrogyl, Nidazole',
 'Antibiotic / Antiprotozoal — Nitroimidazole',
 'Tablet / Suppository / Gel',
 '200 mg / 400 mg / 500 mg',
 'Oral / Topical / IV',
 'Anaerobic bacterial infections. Protozoal infections (amoeba, Giardia, Trichomonas). Dental infections. H. pylori eradication.',
 'Enters microbial cells and is reduced by ferredoxin, forming toxic intermediates that damage DNA and inhibit protein synthesis.',
 'Bacterial infections: 400 mg three times daily for 5–7 days. Dental: 200–400 mg three times daily.',
 'First trimester of pregnancy. Hypersensitivity to nitroimidazoles.',
 'Nausea, metallic taste, headache, dizziness. Rare: peripheral neuropathy with long-term use.',
 'ABSOLUTE contraindication with alcohol — causes severe disulfiram-like reaction (severe nausea, vomiting, flushing). Avoid alcohol during treatment and for 48 hours after.',
 'B', 1, 'SEVERE interaction — causes disulfiram-like reaction with alcohol. Absolutely avoid alcohol during treatment and 48 hours after finishing.', 0, NULL,
 'Various', 'J01XD01', 'Rx'),

('Lisinopril',
 'Lisinopril',
 'Zestril, Prinivil, Carace',
 'ACE Inhibitor',
 'Tablet',
 '2.5 mg / 5 mg / 10 mg / 20 mg',
 'Oral',
 'Hypertension. Heart failure. After heart attack to improve survival. Diabetic kidney disease.',
 'Inhibits angiotensin-converting enzyme (ACE), preventing conversion of angiotensin I to angiotensin II, causing vasodilation.',
 'Hypertension: Start 5–10 mg once daily. Maintenance 10–40 mg/day. Heart failure: Start 2.5 mg.',
 'Pregnancy (all trimesters). History of angioedema. Bilateral renal artery stenosis. Concomitant use with aliskiren in diabetes.',
 'Persistent dry cough (very common), dizziness, hypotension, elevated potassium levels, rare: angioedema.',
 'First dose hypotension — take at night first. Monitor potassium and kidney function. Causes severe fetal harm — stop immediately if pregnancy occurs.',
 'D', 0, NULL, 0, NULL,
 'Various', 'C09AA03', 'Rx'),

('Sertraline',
 'Sertraline Hydrochloride',
 'Zoloft, Lustral, Serlift',
 'SSRI — Selective Serotonin Reuptake Inhibitor',
 'Tablet',
 '25 mg / 50 mg / 100 mg',
 'Oral',
 'Major depressive disorder. Panic disorder. OCD. PTSD. Social anxiety disorder. Premenstrual dysphoric disorder.',
 'Inhibits neuronal reuptake of serotonin in the CNS, increasing serotonergic neurotransmission.',
 'Start 25–50 mg once daily. Increase by 25–50 mg/week. Maximum 200 mg/day. Take with food to reduce nausea.',
 'Concomitant use with MAO inhibitors. Concomitant use with pimozide.',
 'Nausea, diarrhoea, insomnia, dry mouth, sexual dysfunction, sweating. Increased suicidal thoughts in young patients initially.',
 'Do not stop abruptly — taper dose. Monitor for suicidal ideation in first weeks. Serotonin syndrome risk with other serotonergic drugs.',
 'C', 1, 'Alcohol may increase sedative effects and worsen depression. Avoid alcohol while taking sertraline.', 0, NULL,
 'Various', 'N06AB06', 'Rx'),

('Salbutamol',
 'Salbutamol Sulfate (Albuterol)',
 'Ventolin, ProAir, Salamol',
 'Bronchodilator — Beta-2 agonist (SABA)',
 'Inhaler / Nebuliser / Tablet',
 '100 mcg/dose (inhaler)',
 'Inhalation / Oral',
 'Relief of bronchospasm in asthma and COPD. Prevention of exercise-induced bronchospasm.',
 'Selective beta-2 adrenergic receptor agonist causing bronchial smooth muscle relaxation and bronchodilation.',
 'Inhaler (adults): 100–200 mcg (1–2 puffs) as needed. Maximum 4 times daily. Shake well before use.',
 'Hypersensitivity to salbutamol.',
 'Tremor, palpitations, tachycardia, headache, muscle cramps, hypokalaemia with high doses.',
 'Overuse indicates poor asthma control — review therapy. Can cause paradoxical bronchospasm. Monitor potassium with high doses.',
 'C', 0, NULL, 1, 'Salbutamol can cause tachycardia and increased blood pressure in high doses.',
 'Various', 'R03AC02', 'Both'),

('Aspirin',
 'Acetylsalicylic Acid',
 'Bayer Aspirin, Disprin, Aspro',
 'NSAID / Antiplatelet',
 'Tablet',
 '75 mg / 100 mg / 300 mg / 500 mg',
 'Oral',
 'Low dose (75–100 mg): antiplatelet for cardiovascular prevention, after heart attack or stroke. High dose: pain, fever, inflammation.',
 'Irreversibly inhibits COX-1 and COX-2. At low doses: inhibits platelet thromboxane A2, preventing platelet aggregation.',
 'Antiplatelet: 75–100 mg once daily. Pain/fever: 300–600 mg every 4–6 hours. Take with food.',
 'Children under 16 (Reye syndrome risk). Active peptic ulcer. Bleeding disorders. Last trimester of pregnancy.',
 'Gastrointestinal bleeding, stomach upset, tinnitus (high doses). Allergic reactions.',
 'Do NOT give to children under 16 due to risk of Reye syndrome. Increases bleeding risk — inform surgeon before operations.',
 'D', 1, 'Alcohol significantly increases risk of gastrointestinal bleeding when combined with aspirin.', 1, 'High-dose aspirin can raise blood pressure and reduce effectiveness of antihypertensive drugs.',
 'Various', 'B01AC06', 'OTC'),

('Prednisolone',
 'Prednisolone',
 'Deltacortril, Prelone, Omnacortil',
 'Corticosteroid',
 'Tablet / Syrup',
 '5 mg / 10 mg / 25 mg',
 'Oral',
 'Inflammatory and autoimmune conditions: asthma exacerbation, allergic reactions, rheumatoid arthritis, inflammatory bowel disease.',
 'Synthetic glucocorticoid that binds to intracellular receptors, suppressing inflammatory gene expression and immune response.',
 'Highly variable — depends on condition. Typical: 5–60 mg/day. Always taper dose gradually; never stop abruptly.',
 'Systemic fungal infections. Live vaccines. Untreated tuberculosis.',
 'Weight gain, increased appetite, mood changes, insomnia, increased blood sugar, osteoporosis (long-term), hypertension, susceptibility to infections.',
 'Never stop abruptly after prolonged use — adrenal crisis risk. Monitor blood glucose in diabetics. Increases infection risk.',
 'C', 1, 'Alcohol combined with corticosteroids increases risk of stomach ulcers and GI bleeding.', 1, 'Prednisolone causes sodium retention and fluid retention, which can significantly raise blood pressure.',
 'Various', 'H02AB06', 'Rx');

-- ============================================================
-- SEED DATA: herbs  (12 medicinal herbs)
-- ============================================================
INSERT INTO herbs (herb_name, scientific_name, common_names, family, parts_used,
  benefits, uses, preparation_methods, extraction_methods, side_effects, contraindications,
  pregnancy_safe, hypertension_risk, hypertension_notes, origin_region) VALUES

('Ginger',
 'Zingiber officinale',
 'Ginger root, Adrak, Zanjabeel',
 'Zingiberaceae',
 'Root / Rhizome',
 'Powerful anti-nausea agent. Anti-inflammatory properties. Digestive aid. Relieves morning sickness. May help with osteoarthritis pain. Antioxidant effects.',
 'Nausea and vomiting, motion sickness, morning sickness in pregnancy (low doses), indigestion, arthritis pain, cold and flu, menstrual pain.',
 'Fresh root: grate or slice into tea or food. Dried powder: add to food, 1 g/day for nausea. Capsules: 250–500 mg 3–4 times daily.',
 'Tea: Steep 1–2 grams of fresh grated ginger in boiling water for 10 minutes. Essential oil: steam distillation of fresh rhizomes.',
 'Heartburn and stomach discomfort in high doses (>5 g/day). May increase bleeding time slightly.',
 'High doses may worsen gallstones. Use low doses in pregnancy.',
 1, 0, NULL, 'South and Southeast Asia'),

('Garlic',
 'Allium sativum',
 'Garlic, Thoom, Ajo',
 'Amaryllidaceae',
 'Bulb / Cloves',
 'Lowers blood pressure and cholesterol. Antimicrobial and antifungal properties. Cardiovascular protection. Immune system support. Antioxidant rich.',
 'Hypertension (mild), high cholesterol, infections, atherosclerosis prevention, immune boosting, common cold prevention.',
 'Raw: 1–2 cloves daily. Cooked: add to food. Supplements: 600–1200 mg aged garlic extract daily.',
 'Essential oil by steam distillation. Tincture: soak in alcohol. Aged garlic extract: long-term fermentation process.',
 'Strong odour (breath and body). Stomach upset, heartburn. Increases bleeding time — stop before surgery.',
 'Stop 2 weeks before surgery due to anticoagulant effect. High doses with blood thinners increases bleeding risk.',
 1, 0, NULL, 'Central Asia'),

('St. John\'s Wort',
 'Hypericum perforatum',
 'St. John\'s Wort, Tipton\'s Weed, Klamath Weed',
 'Hypericaceae',
 'Flowering tops and leaves',
 'Effective for mild to moderate depression. Reduces anxiety. Anti-inflammatory. Wound healing properties when applied topically.',
 'Mild to moderate depression, anxiety, seasonal affective disorder, nerve pain, menopausal mood symptoms.',
 'Standardised extract: 300 mg three times daily (standardised to 0.3% hypericin). Tea: 2 g dried herb per cup.',
 'Hydroethanolic extract (standardised). Tea from dried flowering tops. Tincture 1:5 in 45% alcohol.',
 'Photosensitivity (increased sun sensitivity — especially in fair skin). Dry mouth, dizziness, GI upset. Mania in bipolar disorder.',
 'Pregnancy and breastfeeding. Bipolar disorder. Many serious drug interactions (see interactions table).',
 0, 0, NULL, 'Europe and Western Asia'),

('Chamomile',
 'Matricaria chamomilla',
 'German Chamomile, Babunah, Camomile',
 'Asteraceae',
 'Flowers',
 'Calming and sedative properties. Anti-anxiety. Anti-inflammatory. Antispasmodic (relaxes muscles). Promotes sleep. Wound healing.',
 'Insomnia, anxiety, stress, digestive cramps, irritable bowel syndrome, skin inflammation, eczema, wound care.',
 'Tea: steep 1–2 teaspoons dried flowers in hot water for 5–10 minutes. 3 cups daily. Topical: cream or compress.',
 'Tea infusion (most common). Essential oil: steam distillation. Tincture in 45% ethanol. CO2 extraction.',
 'Allergic reaction in people sensitive to plants in the daisy family (ragweed, chrysanthemums). Rare contact dermatitis.',
 'Allergy to Asteraceae family plants. High doses may interact with warfarin (anticoagulant).',
 NULL, 0, NULL, 'Europe and North Africa'),

('Turmeric',
 'Curcuma longa',
 'Turmeric, Kurkum, Haldi, Indian Saffron',
 'Zingiberaceae',
 'Rhizome / Root',
 'Potent anti-inflammatory due to curcumin content. Strong antioxidant. Liver protective. May improve brain function. Heart health benefits. Anti-cancer properties (research ongoing).',
 'Arthritis, inflammatory conditions, liver disorders, skin conditions (psoriasis), digestive issues, metabolic syndrome, Alzheimer prevention.',
 'Food spice (daily use). Supplement: 500–2000 mg curcumin daily with black pepper (piperine) to improve absorption. Golden milk.',
 'Dried powder: grinding the dried rhizome. Curcumin extract: solvent extraction. Supercritical CO2 extraction for high potency.',
 'High doses: stomach upset, nausea, diarrhoea. May increase bleeding risk. Can cause gallbladder contractions.',
 'Avoid high doses with anticoagulants. Gallbladder disease. Avoid medicinal doses in pregnancy (spice amounts are safe).',
 1, 0, NULL, 'South Asia'),

('Black Seed',
 'Nigella sativa',
 'Black Seed, Habbatus Sauda, Nigella, Kalonji, Black Cumin',
 'Ranunculaceae',
 'Seeds / Oil',
 'Powerful immune booster. Anti-inflammatory. Antidiabetic (lowers blood sugar). Antimicrobial and antifungal. Bronchodilator (helps asthma). Antioxidant. Liver protective.',
 'Asthma, allergies, diabetes (blood sugar control), hypertension, infections, skin conditions, digestive problems, immune weakness.',
 'Seeds: 1–2 teaspoons daily (can add to food). Oil: 1 teaspoon twice daily. Capsules: 1–3 g/day.',
 'Cold-pressed oil extraction. Dry seed powder. Supercritical CO2 extraction for concentrated thymoquinone.',
 'May significantly lower blood pressure and blood sugar — monitor carefully. Stomach upset in high doses. Bleeding risk.',
 'Pregnancy in large amounts (may stimulate uterine contractions). Bleeding disorders. Caution before surgery.',
 0, 1, 'Black Seed can significantly lower blood pressure. People on antihypertensive medication should monitor BP carefully to avoid hypotension.',
 'Middle East and South Asia'),

('Peppermint',
 'Mentha piperita',
 'Peppermint, Naanaah, Mentha',
 'Lamiaceae',
 'Leaves / Essential Oil',
 'Relieves digestive discomfort and IBS. Antimicrobial. Analgesic (headache relief). Respiratory decongestant. Cooling and refreshing effect.',
 'IBS (irritable bowel syndrome), bloating, nausea, headache (topical), sinus congestion, bad breath.',
 'Tea: steep fresh or dried leaves. Enteric-coated capsules for IBS: 0.2–0.4 mL twice daily. Topical oil for headache.',
 'Steam distillation for essential oil. Tea infusion. Tincture. Enteric-coated capsule formulation.',
 'Heartburn if taken without enteric coating. Allergic reactions. Essential oil toxic internally in large amounts — never give undiluted to children.',
 'GERD (acid reflux) — can worsen symptoms. Never give peppermint oil internally to infants or young children (menthol toxicity).',
 1, 0, NULL, 'Europe and Middle East'),

('Echinacea',
 'Echinacea purpurea',
 'Purple Coneflower, Echinacea, Rudbeckia',
 'Asteraceae',
 'Root / Aerial parts / Flowers',
 'Immune system stimulation. Reduces duration and severity of common cold. Antiviral properties. Anti-inflammatory.',
 'Common cold prevention and treatment, flu, upper respiratory infections, immune weakness.',
 'Capsules: 300–500 mg three times daily. Tea: 1–2 teaspoons dried herb. Tincture: 2–3 mL three times daily.',
 'Hydroethanolic extract (most studied). Juice from fresh aerial parts. Dried powdered root.',
 'Allergic reactions (especially in ragweed-sensitive individuals). GI upset. Rare: severe allergic reaction.',
 'Allergy to Asteraceae family. Autoimmune diseases. Not recommended for long-term use (>8 weeks). Avoid in HIV.',
 1, 0, NULL, 'North America'),

('Lavender',
 'Lavandula angustifolia',
 'Lavender, Khuzama, English Lavender',
 'Lamiaceae',
 'Flowers / Essential Oil',
 'Calming and anxiolytic (reduces anxiety). Promotes sleep. Antispasmodic. Mild antidepressant. Antimicrobial. Pain relieving.',
 'Anxiety, insomnia, stress, headache, mild depression, muscle pain, skin burns and wounds.',
 'Aromatherapy (inhalation). Tea: 1 teaspoon dried flowers per cup. Oral capsules (licensed products). Topical oil.',
 'Steam distillation of fresh flowers for essential oil. Cold infusion for tea. Tincture 1:5 in 45% alcohol.',
 'Oral ingestion of essential oil can cause toxicity. Hormonal effects possible. Avoid large oral doses in pregnancy.',
 'Pregnancy (large medicinal doses). Children: do not apply undiluted essential oil to skin. Possible hormonal effects with long-term use.',
 NULL, 0, NULL, 'Mediterranean'),

('Milk Thistle',
 'Silybum marianum',
 'Milk Thistle, Thistle, Silymarin',
 'Asteraceae',
 'Seeds / Fruits',
 'Liver protective and regenerative (hepatoprotective). Antioxidant. Anti-inflammatory. May help with cirrhosis, hepatitis, and alcohol-related liver disease.',
 'Liver disorders (cirrhosis, hepatitis), gallbladder problems, detoxification support, diabetes (improves insulin resistance).',
 'Standardised extract: 140 mg silymarin three times daily. Tea from ground seeds. Capsules 200–400 mg daily.',
 'Solvent extraction for silymarin. Cold-pressed seed oil. Standardised pharmaceutical extract.',
 'Mild laxative effect. Rare: allergic reaction. May lower blood sugar.',
 'Allergy to Asteraceae family. Hormone-sensitive cancers (may have oestrogenic effect). Monitor blood sugar in diabetics.',
 1, 0, NULL, 'Mediterranean and Middle East'),

('Valerian',
 'Valeriana officinalis',
 'Valerian, Valerian Root, Garden Heliotrope',
 'Caprifoliaceae',
 'Root / Rhizome',
 'Natural sedative and sleep promoter. Reduces anxiety. Muscle relaxant. May reduce menopausal symptoms.',
 'Insomnia, anxiety, stress, nervous tension, muscle cramps, restless leg syndrome.',
 'Standardised extract: 300–600 mg before bedtime. Tea from dried root (unpleasant taste). Tincture: 2–4 mL before sleep.',
 'Aqueous or hydroethanolic extraction. Tincture 1:5 in 40% ethanol. Freeze-dried powder capsules.',
 'Drowsiness (next-morning grogginess in some). Vivid dreams. Headache. Paradoxical stimulant effect in some people.',
 'Pregnancy and breastfeeding. Children under 3. Avoid driving after taking. Avoid with alcohol and other sedatives.',
 0, 0, NULL, 'Europe and Asia'),

('Cinnamon',
 'Cinnamomum verum',
 'True Cinnamon, Ceylon Cinnamon, Qirfa',
 'Lauraceae',
 'Bark / Essential Oil',
 'Antidiabetic (improves insulin sensitivity). Antimicrobial and antifungal. Anti-inflammatory. Antioxidant. Heart health benefits.',
 'Type 2 diabetes (blood sugar management), high cholesterol, infections, digestive problems, menstrual pain.',
 'Food spice (daily use safe). Supplement: 1–6 g Ceylon cinnamon daily. Tea: simmer 1 cinnamon stick in water.',
 'Bark powder (dried and ground). Water and ethanol extraction. Essential oil by steam distillation of bark.',
 'High doses: liver toxicity from coumarin (Cassia cinnamon especially). Allergic reactions. May lower blood sugar significantly.',
 'Ceylon cinnamon safer than Cassia. Avoid high doses in liver disease. Caution with blood thinners and diabetes medications.',
 1, 0, NULL, 'Sri Lanka and South Asia');

-- ============================================================
-- SEED DATA: drug_herb_interactions
-- ============================================================
INSERT INTO drug_herb_interactions (drug_id, herb_id, severity, description, evidence_level, recommendation) VALUES

-- Warfarin + Garlic
(6, 2, 'high',
 'Garlic has antiplatelet properties that can add to warfarin anticoagulant effects, increasing risk of serious bleeding. Multiple case reports document elevated INR with garlic supplements.',
 'case_report',
 'Avoid garlic supplements while on warfarin. Culinary amounts are generally safe. Monitor INR closely if patient insists on garlic supplementation.'),

-- Warfarin + St. John's Wort
(6, 3, 'contraindicated',
 'St. John\'s Wort is a potent inducer of CYP3A4 and P-glycoprotein. It dramatically reduces warfarin blood levels by increasing its metabolism, potentially causing treatment failure and thromboembolism.',
 'clinical_study',
 'CONTRAINDICATED — do not combine. St. John\'s Wort should be stopped at least 2 weeks before starting warfarin. The INR can drop by 30–60%.'),

-- Warfarin + Ginger
(6, 1, 'moderate',
 'Ginger inhibits thromboxane synthesis and platelet aggregation, potentially enhancing warfarin effects. High doses of ginger may elevate INR.',
 'theoretical',
 'Culinary use is acceptable. Avoid ginger supplements (>4 g/day) while on warfarin. Monitor INR if patient uses ginger regularly.'),

-- Warfarin + Chamomile
(6, 4, 'moderate',
 'Chamomile contains natural coumarins and may have additive anticoagulant effects with warfarin. High-dose chamomile tea consumption has been associated with bleeding events.',
 'case_report',
 'Moderate chamomile tea consumption is likely safe. Avoid chamomile supplements or excessive tea. Monitor INR.'),

-- Metformin + Black Seed
(4, 6, 'moderate',
 'Black Seed (Nigella sativa) has demonstrated antidiabetic effects by improving insulin sensitivity and lowering fasting blood glucose. Combining with metformin may cause excessive blood sugar lowering.',
 'clinical_study',
 'Monitor blood glucose carefully if patient uses both. Dose adjustment of metformin may be needed. Inform prescribing doctor.'),

-- Sertraline + St. John's Wort
(12, 3, 'contraindicated',
 'Combining St. John\'s Wort with sertraline can cause Serotonin Syndrome — a potentially life-threatening condition with symptoms including agitation, confusion, rapid heartbeat, high blood pressure, and muscle rigidity.',
 'clinical_study',
 'CONTRAINDICATED — absolutely do not combine. Serotonin syndrome can be fatal. Allow washout period of at least 2 weeks between stopping one and starting the other.'),

-- Aspirin + Garlic
(14, 2, 'moderate',
 'Both aspirin and garlic inhibit platelet aggregation through different mechanisms. Combining them may significantly increase bleeding risk.',
 'theoretical',
 'Avoid garlic supplements with aspirin antiplatelet therapy. Culinary amounts are acceptable. Discuss with doctor if taking for cardiovascular prevention.'),

-- Prednisolone + Echinacea
(15, 8, 'moderate',
 'Echinacea stimulates the immune system while prednisolone suppresses it. These opposite effects may reduce the therapeutic benefit of corticosteroid treatment.',
 'theoretical',
 'Avoid Echinacea during corticosteroid therapy. The opposing mechanisms make this combination counterproductive.'),

-- Amlodipine + St. John's Wort
(5, 3, 'high',
 'St. John\'s Wort induces CYP3A4, significantly increasing amlodipine metabolism and reducing blood levels by up to 30–60%. This can lead to loss of blood pressure control.',
 'clinical_study',
 'Avoid combination. If St. John\'s Wort is stopped, monitor for increased amlodipine levels. Inform cardiologist.'),

-- Metronidazole + Valerian
(10, 11, 'moderate',
 'Metronidazole can cause CNS depression and dizziness. Valerian has sedative properties. Combining them may cause excessive drowsiness and impaired cognitive function.',
 'theoretical',
 'Avoid valerian during metronidazole treatment. Caution about driving and operating machinery.'),

-- Atorvastatin + St. John's Wort
(7, 3, 'high',
 'St. John\'s Wort induces CYP3A4, significantly reducing atorvastatin blood levels, potentially causing loss of cholesterol-lowering effectiveness.',
 'clinical_study',
 'Avoid combination. Inform prescribing doctor if patient uses St. John\'s Wort. Alternative antidepressant should be considered.'),

-- Lisinopril + Black Seed
(11, 6, 'moderate',
 'Black Seed has blood pressure-lowering properties. Combining with ACE inhibitors like lisinopril may cause excessive hypotension (low blood pressure).',
 'theoretical',
 'Monitor blood pressure closely if patient insists on using both. Start with low doses of black seed. Report dizziness or fainting immediately.');

-- ============================================================
-- SEED DATA: herbal_alternatives
-- ============================================================
INSERT INTO herbal_alternatives (drug_id, herb_id, notes, evidence) VALUES
-- Paracetamol alternatives
(1, 1, 'Ginger may help with mild pain and fever, particularly menstrual pain and headaches. Not as reliable as paracetamol for fever.', 'studied'),
(1, 5, 'Turmeric has anti-inflammatory properties but slower onset than paracetamol. More useful for chronic pain.', 'studied'),

-- Ibuprofen alternatives
(2, 1, 'Ginger has anti-inflammatory effects comparable to low-dose ibuprofen in some studies, particularly for arthritis pain.', 'clinical'),
(2, 5, 'Turmeric curcumin shows significant anti-inflammatory effects in arthritis, supported by multiple clinical trials.', 'clinical'),

-- Sertraline alternatives
(12, 3, 'St. John\'s Wort is clinically proven for mild to moderate depression. WARNING: serious drug interactions — cannot be combined with prescription antidepressants.', 'clinical'),
(12, 9, 'Lavender (oral) has shown anxiolytic effects in clinical trials and may help with mild anxiety.', 'clinical'),

-- Omeprazole alternatives
(8, 7, 'Peppermint (enteric-coated) helps with IBS symptoms but should not be used as an alternative to PPIs for ulcers.', 'clinical'),

-- Metformin alternatives
(4, 12, 'Cinnamon (Ceylon) has shown modest blood glucose-lowering effects but cannot replace metformin. Useful as complementary therapy.', 'studied'),
(4, 6, 'Black Seed has shown antidiabetic effects in clinical studies but should be used cautiously alongside metformin.', 'studied'),

-- Amlodipine alternatives
(5, 2, 'Garlic has mild blood pressure lowering effects, suitable for borderline hypertension. Not a replacement for antihypertensives in established hypertension.', 'studied'),

-- Cetirizine alternatives
(9, 4, 'Chamomile has mild antihistamine and anti-inflammatory properties, useful for mild seasonal allergies.', 'traditional'),

-- For liver support (Omeprazole)
(8, 10, 'Milk Thistle supports liver health and may help with side effects of long-term PPI use.', 'studied');

-- ============================================================
-- SAMPLE ADMIN USER
-- password = Admin1234  (bcrypt hash)
-- Change password after first login!
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@smartpharma.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMVCuoS5JYLpEtMAbLH5N8I3Ky',
 'System Administrator',
 'admin');

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- DONE! Database "smartpharma" is ready.
-- Tables: 12
-- Drugs: 15
-- Herbs: 12
-- Interactions: 12
-- Alert Rules: 6
-- Admin user: admin@smartpharma.com / Admin1234
-- ============================================================

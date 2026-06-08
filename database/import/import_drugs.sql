-- SmartPharma Guide — Drug Dataset Import Plan
-- ─────────────────────────────────────────────────────────────────
-- STEP 1: Create a staging table that matches your CSV columns exactly
-- ─────────────────────────────────────────────────────────────────
-- Typical open drug datasets (FDA NDC, DrugBank open, OpenFDA) contain:
-- drug_name, generic_name, brand_name, drug_class, dosage_form,
-- strength, route, indications, side_effects, warnings,
-- pregnancy_category, manufacturer, atc_code, rx_otc

CREATE TABLE IF NOT EXISTS staging_drugs (
  raw_id             TEXT,
  drug_name          TEXT,
  generic_name       TEXT,
  brand_name         TEXT,   -- may be comma-separated; we'll split to array
  drug_class         TEXT,
  dosage_form        TEXT,
  strength           TEXT,
  route              TEXT,
  indications        TEXT,
  mechanism          TEXT,
  dosage_info        TEXT,
  contraindications  TEXT,
  side_effects       TEXT,
  warnings           TEXT,
  pregnancy_category TEXT,
  alcohol_interaction TEXT,  -- 'Yes'/'No'/'Unknown'
  manufacturer       TEXT,
  atc_code           TEXT,
  rx_otc             TEXT
);

-- ─────────────────────────────────────────────────────────────────
-- STEP 2: Import your CSV into the staging table
-- Run this command from psql (replace path with your actual CSV path):
-- ─────────────────────────────────────────────────────────────────
-- \COPY staging_drugs FROM 'C:/path/to/your_drug_dataset.csv'
--   WITH (FORMAT CSV, HEADER TRUE, ENCODING 'UTF8', NULL '');

-- ─────────────────────────────────────────────────────────────────
-- STEP 3: Inspect and validate staged data
-- ─────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM staging_drugs;
-- SELECT drug_name, generic_name FROM staging_drugs LIMIT 10;
-- SELECT pregnancy_category, COUNT(*) FROM staging_drugs GROUP BY 1;
-- SELECT * FROM staging_drugs WHERE drug_name IS NULL OR drug_name = '';

-- ─────────────────────────────────────────────────────────────────
-- STEP 4: Clean and move data into the production drugs table
-- ─────────────────────────────────────────────────────────────────
INSERT INTO drugs (
  drug_name, generic_name, brand_names, drug_class, drug_form,
  strength, route, indications, mechanism_of_action, dosage_info,
  contraindications, side_effects, warnings,
  pregnancy_category, alcohol_interaction,
  manufacturer, atc_code, rx_otc
)
SELECT
  TRIM(INITCAP(s.drug_name))                                          AS drug_name,
  NULLIF(TRIM(s.generic_name), '')                                    AS generic_name,

  -- Split comma-separated brand names into a PostgreSQL array
  CASE
    WHEN s.brand_name IS NULL OR TRIM(s.brand_name) = '' THEN NULL
    ELSE ARRAY(
      SELECT TRIM(b)
      FROM UNNEST(string_to_array(s.brand_name, ',')) b
      WHERE TRIM(b) <> ''
    )
  END                                                                  AS brand_names,

  NULLIF(TRIM(s.drug_class), '')                                      AS drug_class,
  NULLIF(TRIM(s.dosage_form), '')                                     AS drug_form,
  NULLIF(TRIM(s.strength), '')                                        AS strength,
  NULLIF(TRIM(s.route), '')                                           AS route,
  NULLIF(TRIM(s.indications), '')                                     AS indications,
  NULLIF(TRIM(s.mechanism), '')                                       AS mechanism_of_action,
  NULLIF(TRIM(s.dosage_info), '')                                     AS dosage_info,
  NULLIF(TRIM(s.contraindications), '')                               AS contraindications,
  NULLIF(TRIM(s.side_effects), '')                                    AS side_effects,
  NULLIF(TRIM(s.warnings), '')                                        AS warnings,

  -- Normalise pregnancy category; default to 'N/A' if unrecognised
  CASE UPPER(TRIM(s.pregnancy_category))
    WHEN 'A' THEN 'A' WHEN 'B' THEN 'B' WHEN 'C' THEN 'C'
    WHEN 'D' THEN 'D' WHEN 'X' THEN 'X'
    ELSE 'N/A'
  END                                                                  AS pregnancy_category,

  -- Normalise alcohol interaction flag
  CASE UPPER(TRIM(s.alcohol_interaction))
    WHEN 'YES' THEN TRUE WHEN 'TRUE' THEN TRUE WHEN '1' THEN TRUE
    ELSE FALSE
  END                                                                  AS alcohol_interaction,

  NULLIF(TRIM(s.manufacturer), '')                                    AS manufacturer,
  NULLIF(UPPER(TRIM(s.atc_code)), '')                                 AS atc_code,

  -- Normalise Rx/OTC
  CASE UPPER(TRIM(s.rx_otc))
    WHEN 'OTC' THEN 'OTC' WHEN 'BOTH' THEN 'Both'
    ELSE 'Rx'
  END                                                                  AS rx_otc

FROM staging_drugs s
WHERE TRIM(s.drug_name) <> ''            -- skip blank rows

-- STEP 4b: Avoid duplicates on re-import
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- STEP 5: Check results and drop staging table
-- ─────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM drugs;
-- SELECT drug_name, brand_names, pregnancy_category FROM drugs LIMIT 10;
-- DROP TABLE staging_drugs;

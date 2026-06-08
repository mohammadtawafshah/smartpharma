-- Default alert rules — insert once after schema is created
INSERT INTO alert_rules (rule_name, condition_field, condition_value, severity, message_en, message_ar) VALUES
(
  'Pregnancy Category D Warning',
  'pregnancy_category', 'D', 'warning',
  'This drug is Pregnancy Category D. There is evidence of risk to the fetus. Use only if benefits outweigh risks. Consult your doctor.',
  'هذا الدواء من الفئة D للحمل. هناك أدلة على خطر على الجنين. استشيري طبيبك.'
),
(
  'Pregnancy Category X — Contraindicated',
  'pregnancy_category', 'X', 'danger',
  'This drug is Pregnancy Category X and is CONTRAINDICATED in pregnancy. Do not use during pregnancy.',
  'هذا الدواء محظور تماماً أثناء الحمل (الفئة X). لا تستخدميه.'
),
(
  'Alcohol Interaction Warning',
  'alcohol_interaction', 'true', 'warning',
  'This drug may interact dangerously with alcohol. Avoid consuming alcohol while taking this medication.',
  'هذا الدواء قد يتفاعل بشكل خطير مع الكحول. تجنب تناول الكحول.'
),
(
  'Hypertension Risk — Drug',
  'hypertension_risk', 'true', 'warning',
  'This drug may raise blood pressure or interfere with blood pressure medications. Use with caution if you have hypertension.',
  'قد يرفع هذا الدواء ضغط الدم أو يتعارض مع أدوية الضغط. استشر طبيبك.'
),
(
  'High-Severity Drug-Herb Interaction',
  'dhi_severity', 'high', 'danger',
  'A high-severity interaction exists between this drug and a herb in your profile. Consult a pharmacist before use.',
  'يوجد تفاعل شديد الخطورة بين هذا الدواء وعشبة في ملفك الصحي. استشر صيدلانيك.'
),
(
  'Contraindicated Drug-Herb Interaction',
  'dhi_severity', 'contraindicated', 'danger',
  'This drug is CONTRAINDICATED with an herb in your profile. Do not combine them.',
  'هذا الدواء ممنوع مع إحدى الأعشاب في ملفك الصحي. لا تجمعهما.'
);

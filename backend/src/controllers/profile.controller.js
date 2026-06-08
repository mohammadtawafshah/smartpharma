const db = require('../config/db');

exports.getProfile = async (req, res, next) => {
  try {
    const [[profile]] = await db.query(
      'SELECT * FROM user_health_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json(profile || null);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const {
      is_pregnant, is_breastfeeding, has_hypertension, has_diabetes,
      has_liver_disease, has_kidney_disease, allergies,
      current_medications, age, notes
    } = req.body;

    await db.query(
      `INSERT INTO user_health_profiles
         (user_id, is_pregnant, is_breastfeeding, has_hypertension, has_diabetes,
          has_liver_disease, has_kidney_disease, allergies, current_medications, age, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         is_pregnant        = VALUES(is_pregnant),
         is_breastfeeding   = VALUES(is_breastfeeding),
         has_hypertension   = VALUES(has_hypertension),
         has_diabetes       = VALUES(has_diabetes),
         has_liver_disease  = VALUES(has_liver_disease),
         has_kidney_disease = VALUES(has_kidney_disease),
         allergies          = VALUES(allergies),
         current_medications= VALUES(current_medications),
         age                = VALUES(age),
         notes              = VALUES(notes)`,
      [req.user.id,
       is_pregnant ? 1 : 0, is_breastfeeding ? 1 : 0,
       has_hypertension ? 1 : 0, has_diabetes ? 1 : 0,
       has_liver_disease ? 1 : 0, has_kidney_disease ? 1 : 0,
       allergies, current_medications, age, notes]
    );

    const [[updated]] = await db.query(
      'SELECT * FROM user_health_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json(updated);
  } catch (err) { next(err); }
};

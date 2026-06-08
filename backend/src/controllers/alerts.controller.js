const db = require('../config/db');

exports.checkAlerts = async (req, res, next) => {
  try {
    const { drug_id, herb_id } = req.body;
    if (!drug_id && !herb_id) {
      return res.status(400).json({ error: 'Provide drug_id or herb_id' });
    }

    const [[profile]] = await db.query(
      'SELECT * FROM user_health_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (!profile) return res.json({ alerts: [] });

    const alerts = [];

    if (drug_id) {
      const [[drug]] = await db.query(
        `SELECT pregnancy_category, alcohol_interaction, hypertension_risk,
                hypertension_notes, alcohol_notes, drug_name
         FROM drugs WHERE id = ?`,
        [drug_id]
      );
      if (!drug) return res.status(404).json({ error: 'Drug not found' });

      // Pregnancy category D
      if (profile.is_pregnant && drug.pregnancy_category === 'D') {
        alerts.push({
          severity: 'warning',
          message: `${drug.drug_name} is Pregnancy Category D. Evidence of fetal risk. Consult your doctor.`,
        });
      }
      // Pregnancy category X
      if (profile.is_pregnant && drug.pregnancy_category === 'X') {
        alerts.push({
          severity: 'danger',
          message: `${drug.drug_name} is Pregnancy Category X — CONTRAINDICATED during pregnancy. Do not use.`,
        });
      }
      // Alcohol
      if (drug.alcohol_interaction) {
        alerts.push({
          severity: 'warning',
          message: `${drug.drug_name} interacts dangerously with alcohol. Avoid alcohol.${drug.alcohol_notes ? ' ' + drug.alcohol_notes : ''}`,
        });
      }
      // Hypertension
      if (profile.has_hypertension && drug.hypertension_risk) {
        alerts.push({
          severity: 'warning',
          message: `${drug.drug_name} may affect blood pressure. Use with caution.${drug.hypertension_notes ? ' ' + drug.hypertension_notes : ''}`,
        });
      }
      // Drug-herb interactions (high/contraindicated)
      const [interactions] = await db.query(
        `SELECT dhi.severity, dhi.description, dhi.recommendation, h.herb_name
         FROM drug_herb_interactions dhi
         JOIN herbs h ON h.id = dhi.herb_id
         WHERE dhi.drug_id = ? AND dhi.severity IN ('high','contraindicated')`,
        [drug_id]
      );
      for (const i of interactions) {
        alerts.push({
          severity: i.severity === 'contraindicated' ? 'danger' : 'warning',
          message: `${drug.drug_name} + ${i.herb_name}: ${i.description}${i.recommendation ? ' — ' + i.recommendation : ''}`,
        });
      }
    }

    if (herb_id) {
      const [[herb]] = await db.query(
        'SELECT herb_name, pregnancy_safe, hypertension_risk, hypertension_notes FROM herbs WHERE id = ?',
        [herb_id]
      );
      if (!herb) return res.status(404).json({ error: 'Herb not found' });

      if (profile.is_pregnant && herb.pregnancy_safe === 0) {
        alerts.push({
          severity: 'warning',
          message: `${herb.herb_name} is not considered safe during pregnancy. Consult your doctor.`,
        });
      }
      if (profile.has_hypertension && herb.hypertension_risk) {
        alerts.push({
          severity: 'warning',
          message: `${herb.herb_name} may affect blood pressure.${herb.hypertension_notes ? ' ' + herb.hypertension_notes : ''}`,
        });
      }
    }

    // Save alerts to DB
    for (const a of alerts) {
      await db.query(
        `INSERT INTO user_alerts (user_id, drug_id, herb_id, severity, message)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, drug_id || null, herb_id || null, a.severity, a.message]
      );
    }

    res.json({ alerts });
  } catch (err) { next(err); }
};

exports.getUserAlerts = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ua.id, ua.severity, ua.message, ua.is_read, ua.created_at,
              d.drug_name, h.herb_name
       FROM user_alerts ua
       LEFT JOIN drugs d ON d.id = ua.drug_id
       LEFT JOIN herbs h ON h.id = ua.herb_id
       WHERE ua.user_id = ?
       ORDER BY ua.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await db.query(
      'UPDATE user_alerts SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ updated: true });
  } catch (err) { next(err); }
};

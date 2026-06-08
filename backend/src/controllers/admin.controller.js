const db = require('../config/db');

exports.dashboard = async (req, res, next) => {
  try {
    const [[[drugs]], [[herbs]], [[users]], [[alerts]], [[interactions]]] = await Promise.all([
      db.query('SELECT COUNT(*) AS total FROM drugs WHERE is_active = 1'),
      db.query('SELECT COUNT(*) AS total FROM herbs WHERE is_active = 1'),
      db.query('SELECT COUNT(*) AS total FROM users'),
      db.query("SELECT COUNT(*) AS total FROM user_alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"),
      db.query('SELECT COUNT(*) AS total FROM drug_herb_interactions'),
    ]);
    res.json({
      total_drugs:        drugs.total,
      total_herbs:        herbs.total,
      total_users:        users.total,
      alerts_last_7_days: alerts.total,
      total_interactions: interactions.total,
    });
  } catch (err) { next(err); }
};

exports.reports = async (req, res, next) => {
  try {
    const [topSearches] = await db.query(
      `SELECT query, COUNT(*) AS count
       FROM search_history
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY query ORDER BY count DESC LIMIT 20`
    );
    const [alertsByType] = await db.query(
      `SELECT severity, COUNT(*) AS count
       FROM user_alerts
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY severity`
    );
    res.json({ top_searches: topSearches, alerts_by_type: alertsByType });
  } catch (err) { next(err); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user','admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ updated: true });
  } catch (err) { next(err); }
};

exports.listAlertRules = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM alert_rules ORDER BY id');
    res.json(rows);
  } catch (err) { next(err); }
};

exports.createAlertRule = async (req, res, next) => {
  try {
    const { rule_name, condition_field, condition_value, severity, message_en, message_ar } = req.body;
    const [result] = await db.query(
      `INSERT INTO alert_rules (rule_name, condition_field, condition_value, severity, message_en, message_ar)
       VALUES (?,?,?,?,?,?)`,
      [rule_name, condition_field, condition_value, severity, message_en, message_ar]
    );
    const [[rule]] = await db.query('SELECT * FROM alert_rules WHERE id = ?', [result.insertId]);
    res.status(201).json(rule);
  } catch (err) { next(err); }
};

exports.updateAlertRule = async (req, res, next) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const set = fields.map(f => `${f} = ?`).join(', ');
    values.push(req.params.id);
    await db.query(`UPDATE alert_rules SET ${set} WHERE id = ?`, values);
    const [[rule]] = await db.query('SELECT * FROM alert_rules WHERE id = ?', [req.params.id]);
    res.json(rule);
  } catch (err) { next(err); }
};

exports.deleteAlertRule = async (req, res, next) => {
  try {
    await db.query('DELETE FROM alert_rules WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
};

exports.listInteractions = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT dhi.*, d.drug_name, h.herb_name
       FROM drug_herb_interactions dhi
       JOIN drugs d ON d.id = dhi.drug_id
       JOIN herbs h ON h.id = dhi.herb_id
       ORDER BY FIELD(dhi.severity,'contraindicated','high','moderate','low'), d.drug_name`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.createInteraction = async (req, res, next) => {
  try {
    const { drug_id, herb_id, severity, description, evidence_level, recommendation } = req.body;
    const [result] = await db.query(
      `INSERT INTO drug_herb_interactions (drug_id, herb_id, severity, description, evidence_level, recommendation)
       VALUES (?,?,?,?,?,?)`,
      [drug_id, herb_id, severity, description, evidence_level, recommendation]
    );
    const [[row]] = await db.query('SELECT * FROM drug_herb_interactions WHERE id = ?', [result.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

exports.updateInteraction = async (req, res, next) => {
  try {
    const { severity, description, evidence_level, recommendation } = req.body;
    await db.query(
      `UPDATE drug_herb_interactions SET severity=?, description=?, evidence_level=?, recommendation=? WHERE id=?`,
      [severity, description, evidence_level, recommendation, req.params.id]
    );
    const [[row]] = await db.query('SELECT * FROM drug_herb_interactions WHERE id = ?', [req.params.id]);
    res.json(row);
  } catch (err) { next(err); }
};

exports.deleteInteraction = async (req, res, next) => {
  try {
    await db.query('DELETE FROM drug_herb_interactions WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
};

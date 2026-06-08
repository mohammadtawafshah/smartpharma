const db = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, class: drugClass } = req.query;
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM drugs WHERE is_active = 1';
    const params = [];
    if (drugClass) {
      sql += ' AND drug_class = ?';
      params.push(drugClass);
    }
    sql += ' ORDER BY drug_name LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows]  = await db.query(sql, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM drugs WHERE is_active = 1');
    res.json({ data: rows, total, page: +page, limit: +limit });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [[drug]] = await db.query('SELECT * FROM drugs WHERE id = ?', [req.params.id]);
    if (!drug) return res.status(404).json({ error: 'Drug not found' });

    const [interactions] = await db.query(
      `SELECT dhi.severity, dhi.description, dhi.recommendation,
              h.id AS herb_id, h.herb_name
       FROM drug_herb_interactions dhi
       JOIN herbs h ON h.id = dhi.herb_id
       WHERE dhi.drug_id = ?`,
      [req.params.id]
    );
    drug.interactions = interactions;
    res.json(drug);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      drug_name, generic_name, brand_names, drug_class, drug_form,
      strength, route, indications, mechanism_of_action, dosage_info,
      contraindications, side_effects, warnings, pregnancy_category,
      alcohol_interaction, alcohol_notes, hypertension_risk, hypertension_notes,
      manufacturer, atc_code, rx_otc
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO drugs (
         drug_name, generic_name, brand_names, drug_class, drug_form,
         strength, route, indications, mechanism_of_action, dosage_info,
         contraindications, side_effects, warnings, pregnancy_category,
         alcohol_interaction, alcohol_notes, hypertension_risk, hypertension_notes,
         manufacturer, atc_code, rx_otc
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [drug_name, generic_name, brand_names, drug_class, drug_form,
       strength, route, indications, mechanism_of_action, dosage_info,
       contraindications, side_effects, warnings, pregnancy_category,
       alcohol_interaction ? 1 : 0, alcohol_notes,
       hypertension_risk ? 1 : 0, hypertension_notes,
       manufacturer, atc_code, rx_otc]
    );
    const [[newDrug]] = await db.query('SELECT * FROM drugs WHERE id = ?', [result.insertId]);
    res.status(201).json(newDrug);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    values.push(req.params.id);
    await db.query(`UPDATE drugs SET ${setClause} WHERE id = ?`, values);
    const [[updated]] = await db.query('SELECT * FROM drugs WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Drug not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.query('UPDATE drugs SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
};

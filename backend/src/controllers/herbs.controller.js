const db = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT * FROM herbs WHERE is_active = 1 ORDER BY herb_name LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM herbs WHERE is_active = 1');
    res.json({ data: rows, total, page: +page, limit: +limit });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [[herb]] = await db.query('SELECT * FROM herbs WHERE id = ?', [req.params.id]);
    if (!herb) return res.status(404).json({ error: 'Herb not found' });

    const [interactions] = await db.query(
      `SELECT dhi.severity, dhi.description, dhi.recommendation,
              d.id AS drug_id, d.drug_name
       FROM drug_herb_interactions dhi
       JOIN drugs d ON d.id = dhi.drug_id
       WHERE dhi.herb_id = ?`,
      [req.params.id]
    );
    herb.drug_interactions = interactions;
    res.json(herb);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      herb_name, scientific_name, common_names, family, parts_used,
      benefits, uses, preparation_methods, extraction_methods,
      side_effects, contraindications, pregnancy_safe,
      hypertension_risk, hypertension_notes, origin_region
    } = req.body;
    const [result] = await db.query(
      `INSERT INTO herbs (
         herb_name, scientific_name, common_names, family, parts_used,
         benefits, uses, preparation_methods, extraction_methods,
         side_effects, contraindications, pregnancy_safe,
         hypertension_risk, hypertension_notes, origin_region
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [herb_name, scientific_name, common_names, family, parts_used,
       benefits, uses, preparation_methods, extraction_methods,
       side_effects, contraindications, pregnancy_safe,
       hypertension_risk ? 1 : 0, hypertension_notes, origin_region]
    );
    const [[newHerb]] = await db.query('SELECT * FROM herbs WHERE id = ?', [result.insertId]);
    res.status(201).json(newHerb);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    values.push(req.params.id);
    await db.query(`UPDATE herbs SET ${setClause} WHERE id = ?`, values);
    const [[updated]] = await db.query('SELECT * FROM herbs WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Herb not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.query('UPDATE herbs SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
};

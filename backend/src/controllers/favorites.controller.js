const db = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id, f.item_type, f.created_at,
              d.drug_name, d.generic_name, d.drug_class,
              h.herb_name, h.scientific_name
       FROM favorites f
       LEFT JOIN drugs d ON d.id = f.drug_id
       LEFT JOIN herbs h ON h.id = f.herb_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.add = async (req, res, next) => {
  try {
    const { item_type, drug_id, herb_id } = req.body;
    const [result] = await db.query(
      `INSERT IGNORE INTO favorites (user_id, item_type, drug_id, herb_id)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, item_type, drug_id || null, herb_id || null]
    );
    res.status(201).json({ inserted: result.affectedRows > 0 });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await db.query(
      'DELETE FROM favorites WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.status(204).send();
  } catch (err) { next(err); }
};

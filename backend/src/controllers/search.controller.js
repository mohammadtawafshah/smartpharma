const db = require('../config/db');

/**
 * Smart search using MySQL FULLTEXT + LIKE fallback
 * GET /api/search?q=aspirin&type=drug&page=1&limit=20
 */
exports.search = async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }
    const query  = q.trim();
    const offset = (page - 1) * limit;
    const like   = `%${query}%`;
    const results = { drugs: [], herbs: [], conditions: [] };

    // ── DRUGS: fulltext search + LIKE fallback
    if (!type || type === 'drug') {
      const [rows] = await db.query(
        `SELECT id, drug_name, generic_name, brand_names, drug_class,
                drug_form, pregnancy_category, rx_otc,
                MATCH(drug_name, generic_name, brand_names, indications, side_effects)
                  AGAINST(? IN BOOLEAN MODE) AS score
         FROM drugs
         WHERE is_active = 1 AND (
           MATCH(drug_name, generic_name, brand_names, indications, side_effects)
             AGAINST(? IN BOOLEAN MODE)
           OR drug_name  LIKE ?
           OR generic_name LIKE ?
           OR brand_names  LIKE ?
         )
         ORDER BY score DESC, drug_name
         LIMIT ? OFFSET ?`,
        [query, query, like, like, like, Number(limit), Number(offset)]
      );
      results.drugs = rows;
    }

    // ── HERBS
    if (!type || type === 'herb') {
      const [rows] = await db.query(
        `SELECT id, herb_name, scientific_name, common_names, family, benefits,
                MATCH(herb_name, scientific_name, common_names, benefits, uses)
                  AGAINST(? IN BOOLEAN MODE) AS score
         FROM herbs
         WHERE is_active = 1 AND (
           MATCH(herb_name, scientific_name, common_names, benefits, uses)
             AGAINST(? IN BOOLEAN MODE)
           OR herb_name       LIKE ?
           OR scientific_name LIKE ?
         )
         ORDER BY score DESC, herb_name
         LIMIT ? OFFSET ?`,
        [query, query, like, like, Number(limit), Number(offset)]
      );
      results.herbs = rows;
    }

    // ── CONDITIONS
    if (!type || type === 'condition') {
      const [rows] = await db.query(
        `SELECT id, name, description, icd10_code
         FROM medical_conditions
         WHERE MATCH(name, description) AGAINST(? IN BOOLEAN MODE)
            OR name LIKE ?
         LIMIT ? OFFSET ?`,
        [query, like, Number(limit), Number(offset)]
      );
      results.conditions = rows;
    }

    res.json({
      query,
      total: results.drugs.length + results.herbs.length + results.conditions.length,
      results,
    });
  } catch (err) { next(err); }
};

exports.saveHistory = async (req, res, next) => {
  try {
    const { query, result_type, result_count } = req.body;
    await db.query(
      'INSERT INTO search_history (user_id, query, result_type, result_count) VALUES (?,?,?,?)',
      [req.user.id, query, result_type, result_count || 0]
    );
    res.status(201).json({ saved: true });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, query, result_type, result_count, created_at
       FROM search_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

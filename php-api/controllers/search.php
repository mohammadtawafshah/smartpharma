<?php
require_once __DIR__ . '/../config/db.php';

function search(?array $authUser = null): void {
    $q = trim($_GET['q'] ?? '');
    if (strlen($q) < 2) {
        echo json_encode(['drugs' => [], 'herbs' => [], 'query' => $q]);
        return;
    }
    $db   = DB::get();
    $like = "%$q%";

    // Save to search_history if user is logged in
    // Table columns: id, user_id, query, result_type, result_count, created_at
    if ($authUser && !empty($authUser['id'])) {
        $uid = (int)$authUser['id'];
        $dup = $db->prepare('SELECT id FROM search_history WHERE user_id=? AND query=? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)');
        $dup->execute([$uid, trim($q)]);
        if (!$dup->fetch()) {
            $db->prepare('INSERT INTO search_history (user_id, query, result_type, result_count, created_at) VALUES (?, ?, "mixed", 0, NOW())')
               ->execute([$uid, trim($q)]);
        }
    }

    // Search drugs — no 'description' column, use indications instead
    $stmt = $db->prepare(
        "SELECT id, drug_name, generic_name, brand_names, drug_class, drug_form,
                rx_otc, pregnancy_category, alcohol_interaction, hypertension_risk,
                indications
         FROM drugs
         WHERE is_active = 1 AND (
             drug_name LIKE ? OR generic_name LIKE ? OR brand_names LIKE ? OR indications LIKE ?
         )
         ORDER BY
             CASE WHEN LOWER(drug_name) LIKE LOWER(?) THEN 0 ELSE 1 END,
             drug_name
         LIMIT 15"
    );
    $stmt->execute([$like, $like, $like, $like, "$q%"]);
    $drugs = $stmt->fetchAll();
    foreach ($drugs as &$d) {
        $d['id']                  = (int)$d['id'];
        $d['alcohol_interaction'] = (bool)$d['alcohol_interaction'];
        $d['hypertension_risk']   = (bool)$d['hypertension_risk'];
    }

    // Search herbs
    $stmt = $db->prepare(
        "SELECT id, herb_name, scientific_name, common_names, family,
                parts_used, pregnancy_safe, hypertension_risk, benefits, uses
         FROM herbs
         WHERE is_active = 1 AND (
             herb_name LIKE ? OR scientific_name LIKE ? OR common_names LIKE ? OR benefits LIKE ? OR uses LIKE ?
         )
         ORDER BY
             CASE WHEN LOWER(herb_name) LIKE LOWER(?) THEN 0 ELSE 1 END,
             herb_name
         LIMIT 15"
    );
    $stmt->execute([$like, $like, $like, $like, $like, "$q%"]);
    $herbs = $stmt->fetchAll();
    foreach ($herbs as &$h) {
        $h['id']               = (int)$h['id'];
        $h['pregnancy_safe']   = (bool)$h['pregnancy_safe'];
        $h['hypertension_risk']= (bool)$h['hypertension_risk'];
    }

    echo json_encode([
        'drugs' => $drugs,
        'herbs' => $herbs,
        'query' => $q,
        'total' => count($drugs) + count($herbs),
    ]);
}

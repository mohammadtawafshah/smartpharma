<?php
require_once __DIR__ . '/../config/db.php';

function getHerbs(): void {
    $db     = DB::get();
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 12;
    $offset = ($page - 1) * $limit;

    $safe = $_GET['pregnancy_safe'] ?? '';
    $q    = trim($_GET['q'] ?? '');

    $where  = ['is_active = 1'];
    $params = [];

    if ($q) {
        $like     = "%$q%";
        $where[]  = '(herb_name LIKE ? OR scientific_name LIKE ? OR common_names LIKE ? OR benefits LIKE ? OR uses LIKE ?)';
        $params[] = $like; $params[] = $like; $params[] = $like; $params[] = $like; $params[] = $like;
    }
    if ($safe !== '') { $where[] = 'pregnancy_safe = ?'; $params[] = (int)$safe; }

    $whereStr = 'WHERE ' . implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM herbs $whereStr");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $params[] = $limit; $params[] = $offset;
    $stmt = $db->prepare(
        "SELECT id, herb_name, scientific_name, common_names, family,
                parts_used, pregnancy_safe, hypertension_risk, benefits, uses, origin_region
         FROM herbs $whereStr ORDER BY herb_name LIMIT ? OFFSET ?"
    );
    $stmt->execute($params);
    $herbs = $stmt->fetchAll();
    foreach ($herbs as &$h) {
        $h['id']               = (int)$h['id'];
        $h['pregnancy_safe']   = (bool)$h['pregnancy_safe'];
        $h['hypertension_risk']= (bool)$h['hypertension_risk'];
    }
    echo json_encode([
        'data'  => $herbs,
        'total' => $total,
        'page'  => $page,
        'pages' => (int)ceil($total / $limit),
    ]);
}

function getHerb(int $id): void {
    $db   = DB::get();
    $stmt = $db->prepare('SELECT * FROM herbs WHERE id = ? AND is_active = 1');
    $stmt->execute([$id]);
    $herb = $stmt->fetch();
    if (!$herb) {
        http_response_code(404);
        echo json_encode(['error' => 'Herb not found']);
        return;
    }
    $herb['id']               = (int)$herb['id'];
    $herb['pregnancy_safe']   = (bool)$herb['pregnancy_safe'];
    $herb['hypertension_risk']= (bool)$herb['hypertension_risk'];

    // Drug interactions
    $stmt = $db->prepare(
        'SELECT dhi.id, dhi.severity, dhi.description, dhi.evidence_level, dhi.recommendation,
                d.id AS drug_id, d.drug_name, d.generic_name
         FROM drug_herb_interactions dhi
         JOIN drugs d ON d.id = dhi.drug_id
         WHERE dhi.herb_id = ?
         ORDER BY FIELD(dhi.severity,"contraindicated","high","moderate","low")'
    );
    $stmt->execute([$id]);
    $herb['drug_interactions'] = $stmt->fetchAll();

    echo json_encode($herb);
}

<?php
require_once __DIR__ . '/../config/db.php';

function getDrugClasses(): void {
    $rows = DB::get()->query("SELECT DISTINCT drug_class FROM drugs WHERE is_active=1 AND drug_class IS NOT NULL AND drug_class != '' ORDER BY drug_class")->fetchAll();
    echo json_encode(array_column($rows, 'drug_class'));
}

function getDrugs(): void {
    $db     = DB::get();
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 12;
    $offset = ($page - 1) * $limit;

    $class = $_GET['class'] ?? '';
    $rx    = $_GET['rx']    ?? '';
    $q     = trim($_GET['q'] ?? '');

    $where  = ['d.is_active = 1'];
    $params = [];

    if ($q) {
        $like = "%$q%";
        $where[]  = '(d.drug_name LIKE ? OR d.generic_name LIKE ? OR d.brand_names LIKE ? OR d.indications LIKE ?)';
        $params[] = $like; $params[] = $like; $params[] = $like; $params[] = $like;
    }
    if ($class) { $where[] = 'd.drug_class = ?'; $params[] = $class; }
    if ($rx)    { $where[] = 'd.rx_otc = ?';     $params[] = $rx; }

    $whereStr = 'WHERE ' . implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM drugs d $whereStr");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $params[] = $limit; $params[] = $offset;
    $stmt = $db->prepare(
        "SELECT id, drug_name, generic_name, brand_names, drug_class, drug_form,
                strength, rx_otc, pregnancy_category, alcohol_interaction, hypertension_risk,
                indications
         FROM drugs d $whereStr ORDER BY drug_name LIMIT ? OFFSET ?"
    );
    $stmt->execute($params);
    $drugs = $stmt->fetchAll();
    foreach ($drugs as &$d) {
        $d['id']                  = (int)$d['id'];
        $d['alcohol_interaction'] = (bool)$d['alcohol_interaction'];
        $d['hypertension_risk']   = (bool)$d['hypertension_risk'];
    }
    echo json_encode([
        'data'  => $drugs,
        'total' => $total,
        'page'  => $page,
        'pages' => (int)ceil($total / $limit),
    ]);
}

function getDrug(int $id): void {
    $db   = DB::get();
    $stmt = $db->prepare('SELECT * FROM drugs WHERE id = ? AND is_active = 1');
    $stmt->execute([$id]);
    $drug = $stmt->fetch();
    if (!$drug) {
        http_response_code(404);
        echo json_encode(['error' => 'Drug not found']);
        return;
    }
    $drug['id']                  = (int)$drug['id'];
    $drug['alcohol_interaction'] = (bool)$drug['alcohol_interaction'];
    $drug['hypertension_risk']   = (bool)$drug['hypertension_risk'];

    // Herb interactions
    $stmt = $db->prepare(
        'SELECT dhi.id, dhi.severity, dhi.description, dhi.evidence_level, dhi.recommendation,
                h.id AS herb_id, h.herb_name, h.common_names
         FROM drug_herb_interactions dhi
         JOIN herbs h ON h.id = dhi.herb_id
         WHERE dhi.drug_id = ?
         ORDER BY FIELD(dhi.severity,"contraindicated","high","moderate","low")'
    );
    $stmt->execute([$id]);
    $drug['herb_interactions'] = $stmt->fetchAll();

    // Herbal alternatives
    $stmt = $db->prepare(
        'SELECT ha.id, ha.notes, ha.evidence,
                h.id AS herb_id, h.herb_name, h.common_names
         FROM herbal_alternatives ha
         JOIN herbs h ON h.id = ha.herb_id
         WHERE ha.drug_id = ?'
    );
    $stmt->execute([$id]);
    $drug['herbal_alternatives'] = $stmt->fetchAll();

    // Medical conditions
    $stmt = $db->prepare(
        'SELECT mc.name, mc.description
         FROM drug_conditions dc
         JOIN medical_conditions mc ON mc.id = dc.condition_id
         WHERE dc.drug_id = ?'
    );
    $stmt->execute([$id]);
    $drug['conditions'] = $stmt->fetchAll();

    echo json_encode($drug);
}

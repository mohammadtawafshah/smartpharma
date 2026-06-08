<?php
require_once __DIR__ . '/../config/db.php';

function adminStats(): void {
    $db = DB::get();
    $stats = [];
    foreach (['drugs','herbs','users','drug_herb_interactions'] as $table) {
        $stats[$table] = (int)$db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
    }
    echo json_encode($stats);
}

function adminGetDrugs(): void {
    $db   = DB::get();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20; $offset = ($page-1)*$limit;
    $stmt = $db->prepare('SELECT id,drug_name,generic_name,drug_class,rx_otc,pregnancy_category,is_active FROM drugs ORDER BY id DESC LIMIT ? OFFSET ?');
    $stmt->execute([$limit, $offset]);
    $total = (int)$db->query('SELECT COUNT(*) FROM drugs')->fetchColumn();
    echo json_encode(['data' => $stmt->fetchAll(), 'total' => $total]);
}

function adminSaveDrug(array $data, ?int $id = null): void {
    $db = DB::get();
    $fields = ['drug_name','generic_name','brand_names','drug_class','drug_form','strength','route',
               'rx_otc','pregnancy_category','alcohol_interaction','hypertension_risk',
               'description','mechanism_of_action','side_effects','contraindications',
               'dosage_info','storage_info','is_active'];
    $set = []; $params = [];
    foreach ($fields as $f) {
        if (array_key_exists($f, $data)) { $set[] = "$f=?"; $params[] = $data[$f]; }
    }
    if ($id) {
        $params[] = $id;
        $db->prepare('UPDATE drugs SET '.implode(',',$set).' WHERE id=?')->execute($params);
        echo json_encode(['message' => 'Drug updated']);
    } else {
        $cols = implode(',', array_map(fn($s)=>explode('=',$s)[0], $set));
        $ph   = implode(',', array_fill(0, count($params), '?'));
        $db->prepare("INSERT INTO drugs ($cols) VALUES ($ph)")->execute($params);
        echo json_encode(['message' => 'Drug created', 'id' => (int)$db->lastInsertId()]);
    }
}

function adminDeleteDrug(int $id): void {
    DB::get()->prepare('UPDATE drugs SET is_active=0 WHERE id=?')->execute([$id]);
    echo json_encode(['message' => 'Drug deactivated']);
}

function adminGetHerbs(): void {
    $db   = DB::get();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20; $offset = ($page-1)*$limit;
    $stmt = $db->prepare('SELECT id,herb_name,scientific_name,family,pregnancy_safe,is_active FROM herbs ORDER BY id DESC LIMIT ? OFFSET ?');
    $stmt->execute([$limit, $offset]);
    $total = (int)$db->query('SELECT COUNT(*) FROM herbs')->fetchColumn();
    echo json_encode(['data' => $stmt->fetchAll(), 'total' => $total]);
}

function adminGetUsers(): void {
    $db   = DB::get();
    $stmt = $db->query('SELECT id,email,full_name,role,is_active,created_at FROM users ORDER BY id DESC');
    echo json_encode($stmt->fetchAll());
}

function adminToggleUser(int $id): void {
    $db   = DB::get();
    $stmt = $db->prepare('SELECT is_active FROM users WHERE id=?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) { http_response_code(404); echo json_encode(['error'=>'Not found']); return; }
    $new = $user['is_active'] ? 0 : 1;
    $db->prepare('UPDATE users SET is_active=? WHERE id=?')->execute([$new, $id]);
    echo json_encode(['is_active' => (bool)$new]);
}

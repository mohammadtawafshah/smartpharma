<?php
require_once __DIR__ . '/../config/db.php';

function adminSaveHerb(array $data, ?int $id = null): void {
    $db = DB::get();
    $fields = ['herb_name','scientific_name','common_names','family','parts_used','origin_region',
               'benefits','uses','preparation_methods','extraction_methods',
               'side_effects','contraindications','pregnancy_safe','hypertension_risk',
               'is_active'];
    $set = []; $params = [];
    foreach ($fields as $f) {
        if (array_key_exists($f, $data)) { $set[] = "$f=?"; $params[] = $data[$f]; }
    }
    if ($id) {
        $params[] = $id;
        $db->prepare('UPDATE herbs SET '.implode(',',$set).' WHERE id=?')->execute($params);
        echo json_encode(['message' => 'Herb updated']);
    } else {
        $cols = implode(',', array_map(fn($s) => explode('=',$s)[0], $set));
        $ph   = implode(',', array_fill(0, count($params), '?'));
        $db->prepare("INSERT INTO herbs ($cols) VALUES ($ph)")->execute($params);
        echo json_encode(['message' => 'Herb created', 'id' => (int)$db->lastInsertId()]);
    }
}

function adminDeleteHerb(int $id): void {
    DB::get()->prepare('UPDATE herbs SET is_active=0 WHERE id=?')->execute([$id]);
    echo json_encode(['message' => 'Herb deactivated']);
}

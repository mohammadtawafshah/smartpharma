<?php
require_once __DIR__ . '/../config/db.php';

function getFavorites(array $authUser): void {
    $db   = DB::get();
    // favorites table uses drug_id / herb_id columns (not item_id)
    $stmt = $db->prepare("
        SELECT f.id, f.item_type, f.created_at,
               COALESCE(f.drug_id, f.herb_id) AS item_id,
               CASE WHEN f.item_type='drug' THEN d.drug_name ELSE h.herb_name END AS name
        FROM favorites f
        LEFT JOIN drugs d ON f.item_type='drug'  AND d.id = f.drug_id
        LEFT JOIN herbs h ON f.item_type='herb'  AND h.id = f.herb_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ");
    $stmt->execute([$authUser['id']]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['item_id'] = (int)$r['item_id'];
        $r['id']      = (int)$r['id'];
    }
    echo json_encode($rows);
}

function toggleFavorite(array $authUser): void {
    $data      = json_decode(file_get_contents('php://input'), true);
    $item_type = $data['item_type'] ?? '';
    $item_id   = (int)($data['item_id'] ?? 0);

    if (!in_array($item_type, ['drug','herb']) || !$item_id) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid data']);
        return;
    }

    $db  = DB::get();
    $col = $item_type === 'drug' ? 'drug_id' : 'herb_id';

    $stmt = $db->prepare("SELECT id FROM favorites WHERE user_id=? AND item_type=? AND $col=?");
    $stmt->execute([$authUser['id'], $item_type, $item_id]);

    if ($stmt->fetch()) {
        $db->prepare("DELETE FROM favorites WHERE user_id=? AND item_type=? AND $col=?")
           ->execute([$authUser['id'], $item_type, $item_id]);
        echo json_encode(['favorited' => false]);
    } else {
        $db->prepare("INSERT INTO favorites (user_id, item_type, $col) VALUES (?,?,?)")
           ->execute([$authUser['id'], $item_type, $item_id]);
        echo json_encode(['favorited' => true]);
    }
}

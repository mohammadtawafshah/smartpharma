<?php
require_once __DIR__ . '/../config/db.php';

// GET herbs linked to a drug
function getAlternativesForDrug(int $drugId): void {
    $db = DB::get();
    $stmt = $db->prepare('SELECT herb_id FROM herbal_alternatives WHERE drug_id = ?');
    $stmt->execute([$drugId]);
    echo json_encode(array_column($stmt->fetchAll(), 'herb_id'));
}

// GET drugs linked to an herb
function getAlternativesForHerb(int $herbId): void {
    $db = DB::get();
    $stmt = $db->prepare('SELECT drug_id FROM herbal_alternatives WHERE herb_id = ?');
    $stmt->execute([$herbId]);
    echo json_encode(array_column($stmt->fetchAll(), 'drug_id'));
}

// POST: replace all herb alternatives for a drug
function setAlternativesForDrug(int $drugId, array $body): void {
    $db = DB::get();
    $herbIds = array_filter(array_map('intval', $body['herb_ids'] ?? []), fn($id) => $id > 0);
    $db->prepare('DELETE FROM herbal_alternatives WHERE drug_id = ?')->execute([$drugId]);
    $stmt = $db->prepare('INSERT IGNORE INTO herbal_alternatives (drug_id, herb_id) VALUES (?, ?)');
    foreach ($herbIds as $hid) {
        $stmt->execute([$drugId, $hid]);
    }
    echo json_encode(['message' => 'Alternatives saved', 'count' => count($herbIds)]);
}

// POST: replace all drug alternatives for an herb
function setAlternativesForHerb(int $herbId, array $body): void {
    $db = DB::get();
    $drugIds = array_filter(array_map('intval', $body['drug_ids'] ?? []), fn($id) => $id > 0);
    $db->prepare('DELETE FROM herbal_alternatives WHERE herb_id = ?')->execute([$herbId]);
    $stmt = $db->prepare('INSERT IGNORE INTO herbal_alternatives (drug_id, herb_id) VALUES (?, ?)');
    foreach ($drugIds as $did) {
        $stmt->execute([$did, $herbId]);
    }
    echo json_encode(['message' => 'Alternatives saved', 'count' => count($drugIds)]);
}

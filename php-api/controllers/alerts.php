<?php
require_once __DIR__ . '/../config/db.php';

function getDrugAlerts(array $authUser, int $drugId): void {
    $db = DB::get();

    // Get user health profile
    $stmt = $db->prepare('SELECT * FROM user_health_profiles WHERE user_id = ?');
    $stmt->execute([$authUser['id']]);
    $profile = $stmt->fetch();
    if (!$profile) { echo json_encode([]); return; }

    // Get drug
    $stmt = $db->prepare('SELECT * FROM drugs WHERE id = ? AND is_active = 1');
    $stmt->execute([$drugId]);
    $drug = $stmt->fetch();
    if (!$drug) { echo json_encode([]); return; }

    $alerts = [];

    // Pregnancy warnings
    if ($profile['is_pregnant']) {
        if ($drug['pregnancy_category'] === 'X') {
            $alerts[] = ['type' => 'danger', 'message' => "WARNING: {$drug['drug_name']} is Category X — contraindicated in pregnancy. Do NOT use."];
        } elseif ($drug['pregnancy_category'] === 'D') {
            $alerts[] = ['type' => 'warning', 'message' => "{$drug['drug_name']} is Category D — evidence of fetal risk. Use only if benefits outweigh risks."];
        }
    }

    // Alcohol
    if ($drug['alcohol_interaction']) {
        $alerts[] = ['type' => 'warning', 'message' => "Avoid alcohol while taking {$drug['drug_name']} — may cause serious interactions."];
    }

    // Hypertension
    if ($profile['has_hypertension'] && $drug['hypertension_risk']) {
        $alerts[] = ['type' => 'warning', 'message' => "{$drug['drug_name']} may affect blood pressure. Monitor closely if you have hypertension."];
    }

    // Drug-herb interactions from favorites/profile
    $stmt = $db->prepare("SELECT dhi.severity, dhi.description, dhi.recommendation, h.herb_name
        FROM drug_herb_interactions dhi JOIN herbs h ON h.id = dhi.herb_id
        WHERE dhi.drug_id = ? AND dhi.severity IN ('high','contraindicated')");
    $stmt->execute([$drugId]);
    foreach ($stmt->fetchAll() as $interaction) {
        $type = $interaction['severity'] === 'contraindicated' ? 'danger' : 'warning';
        $alerts[] = ['type' => $type, 'message' => "Interaction with {$interaction['herb_name']}: {$interaction['description']}"];
    }

    echo json_encode($alerts);
}

function getUserAlerts(array $authUser): void {
    $db   = DB::get();
    $stmt = $db->prepare('SELECT * FROM user_alerts WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 20');
    $stmt->execute([$authUser['id']]);
    echo json_encode($stmt->fetchAll());
}

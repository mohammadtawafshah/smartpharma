<?php
require_once __DIR__ . '/../config/db.php';

function getProfile(array $authUser): void {
    $db   = DB::get();
    $stmt = $db->prepare('SELECT * FROM user_health_profiles WHERE user_id = ?');
    $stmt->execute([$authUser['id']]);
    $profile = $stmt->fetch();
    if (!$profile) {
        echo json_encode(null);
        return;
    }
    foreach (['is_pregnant','is_breastfeeding','has_hypertension','has_diabetes','has_liver_disease','has_kidney_disease'] as $f) {
        $profile[$f] = (bool)$profile[$f];
    }
    echo json_encode($profile);
}

function saveProfile(array $authUser): void {
    $data = json_decode(file_get_contents('php://input'), true);
    $db   = DB::get();

    $fields = ['is_pregnant','is_breastfeeding','has_hypertension','has_diabetes',
               'has_liver_disease','has_kidney_disease','allergies','current_medications','age','notes'];
    $set = [];
    $params = [];
    foreach ($fields as $f) {
        if (isset($data[$f])) {
            $set[]    = "$f = ?";
            $params[] = $data[$f];
        }
    }
    if (empty($set)) { echo json_encode(['message' => 'Nothing to update']); return; }

    // Check if profile exists
    $stmt = $db->prepare('SELECT id FROM user_health_profiles WHERE user_id = ?');
    $stmt->execute([$authUser['id']]);
    $exists = $stmt->fetch();

    if ($exists) {
        $params[] = $authUser['id'];
        $db->prepare('UPDATE user_health_profiles SET ' . implode(', ', $set) . ' WHERE user_id = ?')->execute($params);
    } else {
        $params[] = $authUser['id'];
        $cols = implode(', ', array_map(fn($f) => explode(' =', $f)[0], $set)) . ', user_id';
        $placeholders = implode(', ', array_fill(0, count($params), '?'));
        $db->prepare("INSERT INTO user_health_profiles ($cols) VALUES ($placeholders)")->execute($params);
    }

    echo json_encode(['message' => 'Profile saved']);
}

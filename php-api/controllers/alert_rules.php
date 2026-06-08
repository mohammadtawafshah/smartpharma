<?php
require_once __DIR__ . '/../config/db.php';

function getAlertRules(): void {
    $db = DB::get();
    // Make sure table exists
    $db->exec("CREATE TABLE IF NOT EXISTS alert_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        condition_key VARCHAR(50) NOT NULL,
        alert_type ENUM('danger','warning','info') NOT NULL DEFAULT 'warning',
        message_template TEXT NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $rules = $db->query('SELECT * FROM alert_rules ORDER BY condition_key, alert_type')->fetchAll();
    foreach ($rules as &$r) {
        $r['id']        = (int)$r['id'];
        $r['is_active'] = (bool)$r['is_active'];
    }
    echo json_encode($rules);
}

function saveAlertRule(array $body, ?int $id = null): void {
    $db = DB::get();
    $conditionKey    = trim($body['condition_key']    ?? '');
    $alertType       = in_array($body['alert_type'] ?? '', ['danger','warning','info']) ? $body['alert_type'] : 'warning';
    $messageTemplate = trim($body['message_template'] ?? '');
    $isActive        = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

    if (!$conditionKey || !$messageTemplate) {
        http_response_code(422);
        echo json_encode(['error' => 'condition_key and message_template are required']);
        return;
    }

    if ($id) {
        $stmt = $db->prepare('UPDATE alert_rules SET condition_key=?, alert_type=?, message_template=?, is_active=? WHERE id=?');
        $stmt->execute([$conditionKey, $alertType, $messageTemplate, $isActive, $id]);
        echo json_encode(['message' => 'Alert rule updated', 'id' => $id]);
    } else {
        $stmt = $db->prepare('INSERT INTO alert_rules (condition_key, alert_type, message_template, is_active) VALUES (?,?,?,?)');
        $stmt->execute([$conditionKey, $alertType, $messageTemplate, $isActive]);
        echo json_encode(['message' => 'Alert rule created', 'id' => (int)$db->lastInsertId()]);
    }
}

function deleteAlertRule(int $id): void {
    DB::get()->prepare('DELETE FROM alert_rules WHERE id=?')->execute([$id]);
    echo json_encode(['message' => 'Alert rule deleted']);
}

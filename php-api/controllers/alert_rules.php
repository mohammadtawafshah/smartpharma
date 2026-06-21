<?php
require_once __DIR__ . '/../config/db.php';

// DB columns: id, rule_name, condition_field, condition_value, severity, message_en, message_ar, is_active, created_at
// Frontend expects: id, condition_key, alert_type, message_template, is_active

function mapRuleToFrontend(array $r): array {
    return [
        'id'               => (int)$r['id'],
        'condition_key'    => $r['condition_field'] ?? $r['condition_key'] ?? '',
        'alert_type'       => $r['severity']        ?? $r['alert_type']   ?? 'warning',
        'message_template' => $r['message_en']      ?? $r['message_template'] ?? '',
        'is_active'        => (bool)$r['is_active'],
        'created_at'       => $r['created_at'] ?? '',
    ];
}

function getAlertRules(): void {
    $db = DB::get();
    $rules = $db->query('SELECT * FROM alert_rules ORDER BY condition_field, severity')->fetchAll();
    echo json_encode(array_map('mapRuleToFrontend', $rules));
}

function saveAlertRule(array $body, ?int $id = null): void {
    $db = DB::get();

    $conditionField  = trim($body['condition_key']      ?? $body['condition_field']  ?? '');
    $severity        = in_array($body['alert_type'] ?? $body['severity'] ?? '', ['danger','warning','info'])
                        ? ($body['alert_type'] ?? $body['severity'])
                        : 'warning';
    $messageEn       = trim($body['message_template']   ?? $body['message_en']       ?? '');
    $isActive        = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

    if (!$conditionField || !$messageEn) {
        http_response_code(422);
        echo json_encode(['error' => 'condition_key and message_template are required']);
        return;
    }

    $ruleName = ucfirst(str_replace('_', ' ', $conditionField)) . ' ' . ucfirst($severity);

    if ($id) {
        $stmt = $db->prepare(
            'UPDATE alert_rules SET rule_name=?, condition_field=?, severity=?, message_en=?, is_active=? WHERE id=?'
        );
        $stmt->execute([$ruleName, $conditionField, $severity, $messageEn, $isActive, $id]);
        echo json_encode(['message' => 'Alert rule updated', 'id' => $id]);
    } else {
        $stmt = $db->prepare(
            'INSERT INTO alert_rules (rule_name, condition_field, condition_value, severity, message_en, is_active) VALUES (?,?,?,?,?,?)'
        );
        $stmt->execute([$ruleName, $conditionField, '1', $severity, $messageEn, $isActive]);
        echo json_encode(['message' => 'Alert rule created', 'id' => (int)$db->lastInsertId()]);
    }
}

function deleteAlertRule(int $id): void {
    DB::get()->prepare('DELETE FROM alert_rules WHERE id=?')->execute([$id]);
    echo json_encode(['message' => 'Alert rule deleted']);
}

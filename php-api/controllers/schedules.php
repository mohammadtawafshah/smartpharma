<?php
require_once __DIR__ . '/../config/db.php';

function getSchedules(array $authUser): void {
    $db  = DB::get();
    $uid = (int)$authUser['id'];
    $stmt = $db->prepare('SELECT * FROM medication_schedules WHERE user_id=? AND is_active=1 ORDER BY created_at DESC');
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id']             = (int)$r['id'];
        $r['user_id']        = (int)$r['user_id'];
        $r['drug_id']        = $r['drug_id'] ? (int)$r['drug_id'] : null;
        $r['herb_id']        = $r['herb_id'] ? (int)$r['herb_id'] : null;
        $r['frequency_days'] = (int)$r['frequency_days'];
        $r['is_active']      = (bool)$r['is_active'];
        $r['reminder_times'] = json_decode($r['reminder_times'], true);
    }
    echo json_encode($rows);
}

function getDueSchedules(array $authUser): void {
    $db  = DB::get();
    $uid = (int)$authUser['id'];
    $today     = date('Y-m-d');
    $nowTime   = date('H:i');

    $stmt = $db->prepare(
        "SELECT * FROM medication_schedules
         WHERE user_id=? AND is_active=1
           AND start_date <= ?
           AND (end_date IS NULL OR end_date >= ?)"
    );
    $stmt->execute([$uid, $today, $today]);
    $schedules = $stmt->fetchAll();

    $due = [];
    foreach ($schedules as $s) {
        $start = new DateTime($s['start_date']);
        $now   = new DateTime($today);
        $diff  = (int)$start->diff($now)->days;
        $freq  = (int)$s['frequency_days'];

        // Check if today is a valid reminder day
        if ($diff % $freq !== 0) continue;

        $times = json_decode($s['reminder_times'], true) ?: [];
        foreach ($times as $t) {
            $due[] = [
                'schedule_id'    => (int)$s['id'],
                'item_name'      => $s['item_name'],
                'item_type'      => $s['item_type'],
                'drug_id'        => $s['drug_id'] ? (int)$s['drug_id'] : null,
                'herb_id'        => $s['herb_id'] ? (int)$s['herb_id'] : null,
                'reminder_time'  => $t,
                'is_due'         => $t <= $nowTime,
                'notes'          => $s['notes'],
            ];
        }
    }

    // Sort: due first (past time), then upcoming
    usort($due, fn($a, $b) => strcmp($a['reminder_time'], $b['reminder_time']));
    echo json_encode($due);
}

function createSchedule(array $authUser, array $body): void {
    $db  = DB::get();
    $uid = (int)$authUser['id'];

    $item_type      = $body['item_type']      ?? '';
    $item_name      = trim($body['item_name'] ?? '');
    $drug_id        = !empty($body['drug_id'])  ? (int)$body['drug_id']  : null;
    $herb_id        = !empty($body['herb_id'])  ? (int)$body['herb_id']  : null;
    $reminder_times = $body['reminder_times']  ?? [];
    $frequency_days = (int)($body['frequency_days'] ?? 1);
    $start_date     = $body['start_date']     ?? date('Y-m-d');
    $end_date       = !empty($body['end_date']) ? $body['end_date'] : null;
    $notes          = trim($body['notes']      ?? '');

    if (!in_array($item_type, ['drug','herb']) || !$item_name || empty($reminder_times)) {
        http_response_code(422);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    $timesJson = json_encode(array_values($reminder_times));

    $stmt = $db->prepare(
        "INSERT INTO medication_schedules
         (user_id, item_type, drug_id, herb_id, item_name, reminder_times, frequency_days, start_date, end_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$uid, $item_type, $drug_id, $herb_id, $item_name, $timesJson, $frequency_days, $start_date, $end_date ?: null, $notes ?: null]);

    echo json_encode(['id' => (int)$db->lastInsertId(), 'message' => 'Schedule created']);
}

function deleteSchedule(array $authUser, int $id): void {
    $db  = DB::get();
    $stmt = $db->prepare('UPDATE medication_schedules SET is_active=0 WHERE id=? AND user_id=?');
    $stmt->execute([$id, (int)$authUser['id']]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        return;
    }
    echo json_encode(['message' => 'Schedule removed']);
}

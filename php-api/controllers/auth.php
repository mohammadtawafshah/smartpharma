<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';

function register(): void {
    $data = json_decode(file_get_contents('php://input'), true);
    $email     = trim($data['email'] ?? '');
    $password  = $data['password'] ?? '';
    $full_name = trim($data['full_name'] ?? '');

    if (!$email || !$password || !$full_name) {
        http_response_code(422);
        echo json_encode(['error' => 'All fields are required']);
        return;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid email']);
        return;
    }
    if (strlen($password) < 6) {
        http_response_code(422);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        return;
    }

    $db = DB::get();
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered']);
        return;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $db->prepare('INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)');
    $stmt->execute([$email, $hash, $full_name]);
    $id = $db->lastInsertId();

    $user  = ['id' => (int)$id, 'email' => $email, 'full_name' => $full_name, 'role' => 'user'];
    $token = JWT::encode($user);
    http_response_code(201);
    echo json_encode(['token' => $token, 'user' => $user]);
}

function login(): void {
    $data     = json_decode(file_get_contents('php://input'), true);
    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(422);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    $db   = DB::get();
    $stmt = $db->prepare('SELECT id, email, password_hash, full_name, role FROM users WHERE email = ? AND is_active = 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    unset($user['password_hash']);
    $user['id'] = (int)$user['id'];
    $token = JWT::encode($user);
    echo json_encode(['token' => $token, 'user' => $user]);
}

function me(array $authUser): void {
    $db   = DB::get();
    $stmt = $db->prepare('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();
    if (!$user) { http_response_code(404); echo json_encode(['error' => 'Not found']); return; }
    $user['id'] = (int)$user['id'];
    echo json_encode($user);
}

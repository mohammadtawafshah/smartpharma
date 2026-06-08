<?php
require_once __DIR__ . '/../config/jwt.php';

function requireAuth(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $header, $m)) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }
    $payload = JWT::decode($m[1]);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    return $payload;
}

/** Returns user payload if token exists and is valid, null otherwise. Never terminates. */
function optionalAuth(): ?array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $header, $m)) return null;
    return JWT::decode($m[1]) ?: null;
}

function requireAdmin(): array {
    $user = requireAuth();
    $allowed = ['admin', 'super_admin', 'content_admin'];
    if (!in_array($user['role'], $allowed)) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
    return $user;
}

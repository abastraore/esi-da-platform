<?php
// backend/routes/auth.php

require_once __DIR__ . '/../config/database.php';

/* ── POST /api/auth : connexion ───────────────────────────────────── */
if ($method === 'POST') {

    $login    = trim($body['login']    ?? '');
    $password = trim($body['password'] ?? '');

    if (!$login || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Login et mot de passe requis']);
        exit;
    }

    $pdo  = getConnection();
    $stmt = $pdo->prepare("SELECT * FROM USERS WHERE login = :login");
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Identifiants incorrects']);
        exit;
    }

    // Connexion reussie : renvoyer le role pour que le frontend redirige correctement
    echo json_encode([
        'success' => true,
        'user'    => [
            'id'    => $user['id'],
            'login' => $user['login'],
            'role'  => $user['role'],
        ]
    ]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Methode non autorisee']);
}

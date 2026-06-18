<?php
// backend/index.php

// ── Headers CORS ──────────────────────────────────────────────────────
// En production, remplace * par l'URL de ton frontend GitHub Pages
// Ex: 'https://ton-username.github.io'
$allowedOrigin = getenv('FRONTEND_URL') ?: '*';
header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Répondre aux requêtes OPTIONS (pré-vol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Connexion BDD ────────────────────────────────────────────────────
require_once __DIR__ . '/config/database.php';

// ── Lecture de la requête ─────────────────────────────────────────────
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Extraire uniquement la partie /api/...
if (preg_match('#(/api/.*)$#', $uri, $matches)) {
    $uri = $matches[1];
}

// Corps JSON (pour POST et PUT)
$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// ── Table de routage ──────────────────────────────────────────────────
$routes = [
    '/api/enseignants'  => '/routes/enseignants.php',
    '/api/classes'      => '/routes/classes.php',
    '/api/cours'        => '/routes/cours.php',
    '/api/seances'      => '/routes/seances.php',
    '/api/evaluations'  => '/routes/evaluations.php',
    '/api/etudiants'    => '/routes/etudiants.php',
    '/api/avancement'   => '/routes/avancement.php',
    '/api/auth'         => '/routes/auth.php',
    '/api/elements'     => '/routes/elements.php',
    '/api/precedences'  => '/routes/precedences.php',
];

// Route de santé pour vérifier que l'API fonctionne
if ($uri === '/api' || $uri === '/api/') {
    echo json_encode(['status' => 'ok', 'message' => 'ESI DA Platform API opérationnelle']);
    exit;
}

// ── Dispatch ──────────────────────────────────────────────────────────
$routeFound = false;

foreach ($routes as $prefix => $file) {
    if (str_starts_with($uri, $prefix)) {
        $filePath = __DIR__ . $file;

        if (!file_exists($filePath)) {
            http_response_code(500);
            echo json_encode(['error' => "Fichier de route introuvable : $file"]);
            exit;
        }

        require $filePath;
        $routeFound = true;
        break;
    }
}

if (!$routeFound) {
    http_response_code(404);
    echo json_encode(['error' => 'Route non trouvée', 'uri' => $uri]);
}

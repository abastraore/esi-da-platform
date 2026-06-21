<?php
$allowedOrigin = getenv('FRONTEND_URL') ?: '*';
header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

if (preg_match('#(/api/.*)$#', $uri, $matches)) {
    $uri = $matches[1];
}

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

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

if ($uri === '/api' || $uri === '/api/') {
    echo json_encode(['status' => 'ok', 'message' => 'ESI DA Platform API opérationnelle']);
    exit;
}

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

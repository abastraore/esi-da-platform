<?php
// router.php — utilisé par le serveur PHP intégré (Render)
// php -S 0.0.0.0:$PORT -t backend router.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Servir les fichiers statiques normalement
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Tout rediriger vers index.php
require __DIR__ . '/index.php';

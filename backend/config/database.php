<?php

function getConnection(): PDO {
    if (!empty($_ENV['DATABASE_URL']) || !empty(getenv('DATABASE_URL'))) {
        $url = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
        $parsed = parse_url($url);
        $host     = $parsed['host'];
        $port     = $parsed['port'] ?? 5432;
        $dbname   = ltrim($parsed['path'], '/');
        $user     = $parsed['user'];
        $password = $parsed['pass'];
    } else {
        $envFile = __DIR__ . '/../.env';
        $env = file_exists($envFile) ? parse_ini_file($envFile) : [];

        $host     = $_ENV['DB_HOST']     ?? getenv('DB_HOST')     ?? $env['DB_HOST']     ?? 'localhost';
        $port     = $_ENV['DB_PORT']     ?? getenv('DB_PORT')     ?? $env['DB_PORT']     ?? 5432;
        $dbname   = $_ENV['DB_NAME']     ?? getenv('DB_NAME')     ?? $env['DB_NAME']     ?? 'projet_tutore';
        $user     = $_ENV['DB_USER']     ?? getenv('DB_USER')     ?? $env['DB_USER']     ?? 'postgres';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? $env['DB_PASSWORD'] ?? '';
    }

    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";

    try {
        $pdo = new PDO($dsn, $user, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Connexion BDD échouée : ' . $e->getMessage()]);
        exit;
    }
}

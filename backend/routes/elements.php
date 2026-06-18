<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getConnection();

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT ec.id, ec.code, ec.libelle, ec.cours_id, c.cours_name
        FROM element_constitutif ec
        LEFT JOIN cours c ON ec.cours_id = c.cours_id
        ORDER BY ec.libelle
    ");
    echo json_encode($stmt->fetchAll());
}

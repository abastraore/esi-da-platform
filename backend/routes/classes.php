<?php
// backend/routes/classes.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/classes/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* ── GET toutes les classes ───────────────────────────────────────── */
if ($method === 'GET' && !$id) {

    $stmt = $pdo->query("SELECT * FROM CLASSES ORDER BY libelle");
    echo json_encode($stmt->fetchAll());
}

/* ── GET une classe ───────────────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("SELECT * FROM CLASSES WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $classe = $stmt->fetch();

    if (!$classe) {
        http_response_code(404);
        echo json_encode(['error' => 'Classe non trouvée']);
    } else {
        echo json_encode($classe);
    }
}

/* ── POST : créer une classe ──────────────────────────────────────── */
elseif ($method === 'POST') {

    $stmt = $pdo->prepare("
        INSERT INTO CLASSES (libelle, niveau, option)
        VALUES (:libelle, :niveau, :option)
        RETURNING *
    ");
    $stmt->execute([
        ':libelle' => $body['libelle'],
        ':niveau'  => $body['niveau'],
        ':option'  => $body['option'],
    ]);

    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : modifier une classe ────────────────────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE CLASSES
        SET libelle = :libelle,
            niveau  = :niveau,
            option  = :option
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':libelle' => $body['libelle'],
        ':niveau'  => $body['niveau'],
        ':option'  => $body['option'],
        ':id'      => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── DELETE : supprimer une classe ────────────────────────────────── */
elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM CLASSES WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Classe supprimée']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

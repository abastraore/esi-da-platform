<?php
// backend/routes/enseignants.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/enseignants/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* ── GET tous les enseignants ─────────────────────────────────────── */
if ($method === 'GET' && !$id) {

    $stmt = $pdo->query("SELECT * FROM ENSEIGNANT ORDER BY nom");
    echo json_encode($stmt->fetchAll());
}

/* ── GET un enseignant ────────────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("SELECT * FROM ENSEIGNANT WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $ens = $stmt->fetch();

    if (!$ens) {
        http_response_code(404);
        echo json_encode(['error' => 'Enseignant non trouvé']);
    } else {
        echo json_encode($ens);
    }
}

/* ── POST : créer un enseignant ───────────────────────────────────── */
elseif ($method === 'POST') {

    $stmt = $pdo->prepare("
        INSERT INTO ENSEIGNANT (nom, prenom, email, module, grade)
        VALUES (:nom, :prenom, :email, :module, :grade)
        RETURNING *
    ");
    $stmt->execute([
        ':nom'    => $body['nom'],
        ':prenom' => $body['prenom'],
        ':email'  => $body['email']  ?? null,
        ':module' => $body['module'] ?? null,
        ':grade'  => $body['grade'],
    ]);

    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : modifier un enseignant ─────────────────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE ENSEIGNANT
        SET nom    = :nom,
            prenom = :prenom,
            email  = :email,
            module = :module,
            grade  = :grade
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':nom'    => $body['nom'],
        ':prenom' => $body['prenom'],
        ':email'  => $body['email']  ?? null,
        ':module' => $body['module'] ?? null,
        ':grade'  => $body['grade'],
        ':id'     => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── DELETE : supprimer un enseignant ─────────────────────────────── */
elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM ENSEIGNANT WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Enseignant supprimé']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

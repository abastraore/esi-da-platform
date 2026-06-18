<?php
// backend/routes/etudiants.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/etudiants/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* ── GET tous les étudiants ───────────────────────────────────────── */
if ($method === 'GET' && !$id) {

    $stmt = $pdo->query("
        SELECT
            et.*,
            cl.libelle AS classe
        FROM ETUDIANT et
        LEFT JOIN CLASSES cl ON et.classe_id = cl.id
        ORDER BY et.nom
    ");

    echo json_encode($stmt->fetchAll());
}

/* ── GET un étudiant par ID ───────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("
        SELECT et.*, cl.libelle AS classe
        FROM ETUDIANT et
        LEFT JOIN CLASSES cl ON et.classe_id = cl.id
        WHERE et.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $etudiant = $stmt->fetch();

    if (!$etudiant) {
        http_response_code(404);
        echo json_encode(['error' => 'Étudiant non trouvé']);
    } else {
        echo json_encode($etudiant);
    }
}

/* ── POST : créer un étudiant ─────────────────────────────────────── */
elseif ($method === 'POST') {

    $stmt = $pdo->prepare("
        INSERT INTO ETUDIANT (matricule, nom, prenom, email, classe_id)
        VALUES (:matricule, :nom, :prenom, :email, :classe_id)
        RETURNING *
    ");
    $stmt->execute([
        ':matricule' => $body['matricule'],
        ':nom'       => $body['nom'],
        ':prenom'    => $body['prenom'],
        ':email'     => $body['email']     ?? null,
        ':classe_id' => $body['classe_id'] ?? null,
    ]);

    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : modifier un étudiant ───────────────────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE ETUDIANT
        SET nom       = :nom,
            prenom    = :prenom,
            email     = :email,
            classe_id = :classe_id
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':nom'       => $body['nom'],
        ':prenom'    => $body['prenom'],
        ':email'     => $body['email']     ?? null,
        ':classe_id' => $body['classe_id'] ?? null,
        ':id'        => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── DELETE : supprimer un étudiant ───────────────────────────────── */
elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM ETUDIANT WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Étudiant supprimé']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

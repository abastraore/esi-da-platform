<?php
// backend/routes/cours.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/cours/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* ── GET tous les cours ───────────────────────────────────────────── */
if ($method === 'GET' && !$id) {

    $stmt = $pdo->query("
        SELECT
            c.cours_id,
            c.cours_name,
            c.cours_volume,
            c.cours_debut,
            c.cours_fin,
            e.nom        AS enseignant_nom,
            e.prenom     AS enseignant_prenom,
            cl.libelle   AS classe
        FROM COURS c
        LEFT JOIN ENSEIGNANT e  ON c.cours_prof  = e.id
        LEFT JOIN CLASSES    cl ON c.cours_level = cl.id
        ORDER BY c.cours_name
    ");

    echo json_encode($stmt->fetchAll());
}

/* ── GET un cours par ID ──────────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("
        SELECT
            c.*,
            e.nom      AS enseignant_nom,
            e.prenom   AS enseignant_prenom,
            cl.libelle AS classe
        FROM COURS c
        LEFT JOIN ENSEIGNANT e  ON c.cours_prof  = e.id
        LEFT JOIN CLASSES    cl ON c.cours_level = cl.id
        WHERE c.cours_id = :id
    ");
    $stmt->execute([':id' => $id]);
    $cours = $stmt->fetch();

    if (!$cours) {
        http_response_code(404);
        echo json_encode(['error' => 'Cours non trouvé']);
    } else {
        echo json_encode($cours);
    }
}

/* ── POST : créer un cours ────────────────────────────────────────── */
elseif ($method === 'POST') {

    $stmt = $pdo->prepare("
        INSERT INTO COURS (cours_name, cours_volume, cours_debut, cours_fin, cours_prof, cours_level)
        VALUES (:cours_name, :cours_volume, :cours_debut, :cours_fin, :cours_prof, :cours_level)
        RETURNING *
    ");
    $stmt->execute([
        ':cours_name'   => $body['cours_name'],
        ':cours_volume' => $body['cours_volume'],
        ':cours_debut'  => $body['cours_debut'],
        ':cours_fin'    => $body['cours_fin'],
        ':cours_prof'   => $body['cours_prof']   ?? null,
        ':cours_level'  => $body['cours_level']  ?? null,
    ]);

    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : modifier un cours ──────────────────────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE COURS
        SET cours_name   = :cours_name,
            cours_volume = :cours_volume,
            cours_debut  = :cours_debut,
            cours_fin    = :cours_fin,
            cours_prof   = :cours_prof,
            cours_level  = :cours_level
        WHERE cours_id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':cours_name'   => $body['cours_name'],
        ':cours_volume' => $body['cours_volume'],
        ':cours_debut'  => $body['cours_debut'],
        ':cours_fin'    => $body['cours_fin'],
        ':cours_prof'   => $body['cours_prof']  ?? null,
        ':cours_level'  => $body['cours_level'] ?? null,
        ':id'           => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── DELETE : supprimer un cours ──────────────────────────────────── */
elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM COURS WHERE cours_id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Cours supprimé']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

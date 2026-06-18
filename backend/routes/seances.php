<?php
// backend/routes/seances.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/seances/?([0-9]*)#', $uri, $matches);
$id        = $matches[1] ?? null;
$pdo       = getConnection();
$classe_id = $_GET['classe_id'] ?? null;

/* ── GET toutes les séances (filtrables par classe) ───────────────── */
if ($method === 'GET' && !$id) {

    if ($classe_id) {
        $stmt = $pdo->prepare("
            SELECT
                s.*,
                ec.libelle  AS cours,
                ec.code,
                e.nom       AS enseignant_nom,
                e.prenom    AS enseignant_prenom,
                cl.libelle  AS classe
            FROM SEANCE s
            JOIN ELEMENT_CONSTITUTIF ec ON s.ec_id         = ec.id
            JOIN ENSEIGNANT          e  ON s.enseignant_id = e.id
            JOIN CLASSES             cl ON s.classe_id     = cl.id
            WHERE s.classe_id = :classe_id
            ORDER BY s.date_seance, s.heure_debut
        ");
        $stmt->execute([':classe_id' => $classe_id]);
    } else {
        $stmt = $pdo->query("
            SELECT
                s.*,
                ec.libelle  AS cours,
                ec.code,
                e.nom       AS enseignant_nom,
                e.prenom    AS enseignant_prenom,
                cl.libelle  AS classe
            FROM SEANCE s
            JOIN ELEMENT_CONSTITUTIF ec ON s.ec_id         = ec.id
            JOIN ENSEIGNANT          e  ON s.enseignant_id = e.id
            JOIN CLASSES             cl ON s.classe_id     = cl.id
            ORDER BY s.date_seance, s.heure_debut
        ");
    }

    echo json_encode($stmt->fetchAll());
}

/* ── GET une séance par ID ────────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("
        SELECT
            s.*,
            ec.libelle AS cours,
            ec.code,
            e.nom      AS enseignant_nom,
            e.prenom   AS enseignant_prenom,
            cl.libelle AS classe
        FROM SEANCE s
        JOIN ELEMENT_CONSTITUTIF ec ON s.ec_id         = ec.id
        JOIN ENSEIGNANT          e  ON s.enseignant_id = e.id
        JOIN CLASSES             cl ON s.classe_id     = cl.id
        WHERE s.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $seance = $stmt->fetch();

    if (!$seance) {
        http_response_code(404);
        echo json_encode(['error' => 'Séance non trouvée']);
    } else {
        echo json_encode($seance);
    }
}

/* ── POST : créer une séance ──────────────────────────────────────── */
elseif ($method === 'POST') {

    $stmt = $pdo->prepare("
        INSERT INTO SEANCE (ec_id, enseignant_id, classe_id, salle, date_seance, heure_debut, heure_fin, type_seance)
        VALUES (:ec_id, :enseignant_id, :classe_id, :salle, :date_seance, :heure_debut, :heure_fin, :type_seance)
        RETURNING *
    ");
    $stmt->execute([
        ':ec_id'         => $body['ec_id'],
        ':enseignant_id' => $body['enseignant_id'],
        ':classe_id'     => $body['classe_id'],
        ':salle'         => $body['salle']        ?? null,
        ':date_seance'   => $body['date_seance'],
        ':heure_debut'   => $body['heure_debut'],
        ':heure_fin'     => $body['heure_fin'],
        ':type_seance'   => $body['type_seance']  ?? 'COURS',
    ]);

    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : modifier une séance ────────────────────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE SEANCE
        SET ec_id         = :ec_id,
            enseignant_id = :enseignant_id,
            classe_id     = :classe_id,
            salle         = :salle,
            date_seance   = :date_seance,
            heure_debut   = :heure_debut,
            heure_fin     = :heure_fin,
            type_seance   = :type_seance
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':ec_id'         => $body['ec_id'],
        ':enseignant_id' => $body['enseignant_id'],
        ':classe_id'     => $body['classe_id'],
        ':salle'         => $body['salle']       ?? null,
        ':date_seance'   => $body['date_seance'],
        ':heure_debut'   => $body['heure_debut'],
        ':heure_fin'     => $body['heure_fin'],
        ':type_seance'   => $body['type_seance'] ?? 'COURS',
        ':id'            => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── DELETE : supprimer une séance ────────────────────────────────── */
elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM SEANCE WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Séance supprimée']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

<?php
// backend/routes/evaluations.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/evaluations/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* ── GET toutes les évaluations ───────────────────────────────────── */
if ($method === 'GET' && !$id) {

    $stmt = $pdo->query("
        SELECT
            ev.*,
            c.cours_name,
            cl.libelle AS classe
        FROM EVALUATION ev
        JOIN COURS   c  ON ev.cours_id   = c.cours_id
        JOIN CLASSES cl ON c.cours_level = cl.id
        ORDER BY ev.date_evaluation DESC
    ");

    echo json_encode($stmt->fetchAll());
}

/* ── GET une évaluation par ID ────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("
        SELECT ev.*, c.cours_name
        FROM EVALUATION ev
        JOIN COURS c ON ev.cours_id = c.cours_id
        WHERE ev.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $eval = $stmt->fetch();

    if (!$eval) {
        http_response_code(404);
        echo json_encode(['error' => 'Évaluation non trouvée']);
    } else {
        echo json_encode($eval);
    }
}

/* ── POST : planifier une évaluation ──────────────────────────────── */
elseif ($method === 'POST') {

    $stmt = $pdo->prepare("
        INSERT INTO EVALUATION (cours_id, type_eval, date_evaluation, coefficient, statut)
        VALUES (:cours_id, :type_eval, :date_evaluation, :coefficient, :statut)
        RETURNING *
    ");
    $stmt->execute([
        ':cours_id'        => $body['cours_id'],
        ':type_eval'       => $body['type_eval'],
        ':date_evaluation' => $body['date_evaluation'],
        ':coefficient'     => $body['coefficient'],
        ':statut'          => $body['statut'] ?? 'a_venir',
    ]);

    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : modifier une évaluation ────────────────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE EVALUATION
        SET type_eval       = :type_eval,
            date_evaluation = :date_evaluation,
            coefficient     = :coefficient,
            note_moyenne    = :note_moyenne,
            statut          = :statut
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':type_eval'       => $body['type_eval'],
        ':date_evaluation' => $body['date_evaluation'],
        ':coefficient'     => $body['coefficient'],
        ':note_moyenne'    => $body['note_moyenne'] ?? null,
        ':statut'          => $body['statut']       ?? 'a_venir',
        ':id'              => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── DELETE : supprimer une évaluation ────────────────────────────── */
elseif ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM EVALUATION WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Évaluation supprimée']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

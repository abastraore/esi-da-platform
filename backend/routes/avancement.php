<?php
// backend/routes/avancement.php

require_once __DIR__ . '/../config/database.php';

preg_match('#/api/avancement/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* ── GET tout l'avancement ────────────────────────────────────────── */
if ($method === 'GET' && !$id) {

    $stmt = $pdo->query("
        SELECT
            av.*,
            c.cours_name,
            cl.libelle AS classe
        FROM AVANCEMENT_COURS av
        JOIN COURS   c  ON av.cours_id   = c.cours_id
        JOIN CLASSES cl ON c.cours_level = cl.id
        ORDER BY av.pourcentage DESC
    ");

    echo json_encode($stmt->fetchAll());
}

/* ── GET avancement d'un cours ────────────────────────────────────── */
elseif ($method === 'GET' && $id) {

    $stmt = $pdo->prepare("
        SELECT av.*, c.cours_name
        FROM AVANCEMENT_COURS av
        JOIN COURS c ON av.cours_id = c.cours_id
        WHERE av.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* ── PUT : mettre à jour les heures réalisées ─────────────────────── */
elseif ($method === 'PUT' && $id) {

    $stmt = $pdo->prepare("
        UPDATE AVANCEMENT_COURS
        SET heures_prevues   = :heures_prevues,
            heures_realisees = :heures_realisees
        WHERE id = :id
        RETURNING *
    ");
    $stmt->execute([
        ':heures_prevues'   => $body['heures_prevues'],
        ':heures_realisees' => $body['heures_realisees'],
        ':id'               => $id,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

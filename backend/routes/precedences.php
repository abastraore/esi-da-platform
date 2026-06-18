<?php
// backend/routes/precedences.php
require_once __DIR__ . '/../config/database.php';

preg_match('#/api/precedences/?([0-9]*)#', $uri, $matches);
$id  = $matches[1] ?? null;
$pdo = getConnection();

/* GET toutes les précédences */
if ($method === 'GET' && !$id) {
    $stmt = $pdo->query("
        SELECT
            ec.prerequis_id AS id,
            ec.id           AS ec_id,
            ec.libelle      AS cours_name,
            ec.code,
            pr.id           AS prereq_id,
            pr.libelle      AS prereq_name,
            pr.code         AS prereq_code
        FROM element_constitutif ec
        JOIN element_constitutif pr ON ec.prerequis_id = pr.id
        WHERE ec.prerequis_id IS NOT NULL
        ORDER BY ec.libelle
    ");
    echo json_encode($stmt->fetchAll());
}

/* POST : ajouter une précédence */
elseif ($method === 'POST') {
    $stmt = $pdo->prepare("
        UPDATE element_constitutif
        SET prerequis_id = :prereq_id
        WHERE id = :ec_id
        RETURNING id, libelle, prerequis_id
    ");
    $stmt->execute([
        ':prereq_id' => $body['prereq_id'],
        ':ec_id'     => $body['ec_id'],
    ]);
    http_response_code(201);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row !== false ? $row : ['success' => true]);
}

/* DELETE : supprimer une précédence */
elseif ($method === 'DELETE' && $id) {
    $stmt = $pdo->prepare("
        UPDATE element_constitutif
        SET prerequis_id = NULL
        WHERE id = :id
    ");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Précédence supprimée']);
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}

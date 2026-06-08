<?php
require_once __DIR__ . '/../config/db.php';

function getUserDashboard(array $authUser): void {
    $db  = DB::get();
    $uid = (int)$authUser['id'];

    // Counts
    $stmt = $db->prepare('SELECT COUNT(*) FROM favorites WHERE user_id=?');
    $stmt->execute([$uid]);
    $favCount = (int)$stmt->fetchColumn();

    $stmt = $db->prepare('SELECT COUNT(*) FROM user_alerts WHERE user_id=? AND is_read=0');
    $stmt->execute([$uid]);
    $alertCount = (int)$stmt->fetchColumn();

    $stmt = $db->prepare('SELECT COUNT(*) FROM search_history WHERE user_id=?');
    $stmt->execute([$uid]);
    $searchCount = (int)$stmt->fetchColumn();

    // Recent searches (column is 'query', not 'keyword')
    $stmt = $db->prepare('SELECT query FROM search_history WHERE user_id=? ORDER BY created_at DESC LIMIT 10');
    $stmt->execute([$uid]);
    $queries = array_unique(array_column($stmt->fetchAll(), 'query'));
    $recentKeywords = array_values(array_slice($queries, 0, 5));

    // Recent drugs from search history
    $stmt = $db->prepare(
        'SELECT DISTINCT d.id, d.drug_name, d.generic_name, d.rx_otc
         FROM search_history sh
         JOIN drugs d ON LOWER(d.drug_name) LIKE LOWER(CONCAT("%",sh.query,"%"))
            OR LOWER(d.generic_name) LIKE LOWER(CONCAT("%",sh.query,"%"))
         WHERE sh.user_id=? AND d.is_active=1
         ORDER BY sh.created_at DESC LIMIT 3'
    );
    $stmt->execute([$uid]);
    $recentDrugs = $stmt->fetchAll();
    foreach ($recentDrugs as &$d) { $d['id'] = (int)$d['id']; }

    // Recent herbs from search history
    $stmt = $db->prepare(
        'SELECT DISTINCT h.id, h.herb_name AS common_name, h.scientific_name, h.pregnancy_safe
         FROM search_history sh
         JOIN herbs h ON LOWER(h.herb_name) LIKE LOWER(CONCAT("%",sh.query,"%"))
         WHERE sh.user_id=? AND h.is_active=1
         ORDER BY sh.created_at DESC LIMIT 2'
    );
    $stmt->execute([$uid]);
    $recentHerbs = $stmt->fetchAll();
    foreach ($recentHerbs as &$h) {
        $h['id']            = (int)$h['id'];
        $h['pregnancy_safe']= (bool)$h['pregnancy_safe'];
    }

    echo json_encode([
        'favorite_count'  => $favCount,
        'alert_count'     => $alertCount,
        'history_count'   => $searchCount,
        'recent_searches' => $recentKeywords,
        'recent_drugs'    => $recentDrugs,
        'recent_herbs'    => $recentHerbs,
    ]);
}

function getSearchHistory(array $authUser): void {
    $db   = DB::get();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 20; $offset = ($page - 1) * $limit;
    // Column is 'query' not 'keyword', 'created_at' not 'searched_at'
    $stmt = $db->prepare('SELECT id, query AS keyword, created_at AS searched_at FROM search_history WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?');
    $stmt->execute([$authUser['id'], $limit, $offset]);
    $total = (int)$db->query("SELECT COUNT(*) FROM search_history WHERE user_id={$authUser['id']}")->fetchColumn();
    echo json_encode(['data' => $stmt->fetchAll(), 'total' => $total]);
}

function clearSearchHistory(array $authUser): void {
    DB::get()->prepare('DELETE FROM search_history WHERE user_id=?')->execute([$authUser['id']]);
    echo json_encode(['message' => 'History cleared']);
}

function getReports(): void {
    $db = DB::get();
    echo json_encode([
        'total_drugs'        => (int)$db->query('SELECT COUNT(*) FROM drugs WHERE is_active=1')->fetchColumn(),
        'total_herbs'        => (int)$db->query('SELECT COUNT(*) FROM herbs WHERE is_active=1')->fetchColumn(),
        'total_users'        => (int)$db->query('SELECT COUNT(*) FROM users WHERE role="user"')->fetchColumn(),
        'total_admins'       => (int)$db->query('SELECT COUNT(*) FROM users WHERE role!="user"')->fetchColumn(),
        'total_interactions' => (int)$db->query('SELECT COUNT(*) FROM drug_herb_interactions')->fetchColumn(),
        'total_favorites'    => (int)$db->query('SELECT COUNT(*) FROM favorites')->fetchColumn(),
        'total_searches'     => (int)$db->query('SELECT COUNT(*) FROM search_history')->fetchColumn(),
        'top_searches'       => $db->query('SELECT query AS keyword, COUNT(*) as cnt FROM search_history GROUP BY query ORDER BY cnt DESC LIMIT 10')->fetchAll(),
        'users_by_month'     => $db->query('SELECT DATE_FORMAT(created_at,"%Y-%m") as month, COUNT(*) as cnt FROM users GROUP BY month ORDER BY month DESC LIMIT 6')->fetchAll(),
        'drugs_by_class'     => $db->query('SELECT drug_class, COUNT(*) as cnt FROM drugs WHERE is_active=1 AND drug_class IS NOT NULL GROUP BY drug_class ORDER BY cnt DESC')->fetchAll(),
        'herbs_by_family'    => $db->query('SELECT family, COUNT(*) as cnt FROM herbs WHERE is_active=1 AND family IS NOT NULL GROUP BY family ORDER BY cnt DESC LIMIT 8')->fetchAll(),
    ]);
}

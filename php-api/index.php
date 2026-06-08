<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/smartpharma-api#', '', $uri);
$uri    = rtrim($uri, '/') ?: '/';
$parts  = explode('/', trim($uri, '/'));

$body = fn() => json_decode(file_get_contents('php://input'), true) ?? [];

try {

    // ── AUTH ──────────────────────────────────────────────────
    if ($parts[0] === 'auth') {
        require_once __DIR__ . '/controllers/auth.php';
        if ($parts[1]==='register' && $method==='POST') { register(); exit; }
        if ($parts[1]==='login'    && $method==='POST') { login();    exit; }
        if ($parts[1]==='me'       && $method==='GET')  { me(requireAuth()); exit; }
    }

    // ── DRUGS (public) ───────────────────────────────────────
    if ($parts[0] === 'drugs') {
        require_once __DIR__ . '/controllers/drugs.php';
        if ($method==='GET' && ($parts[1]??'')==='classes') { getDrugClasses(); exit; }
        if ($method==='GET' && empty($parts[1]))             { getDrugs(); exit; }
        if ($method==='GET' && is_numeric($parts[1]))        { getDrug((int)$parts[1]); exit; }
    }

    // ── HERBS (public) ───────────────────────────────────────
    if ($parts[0] === 'herbs') {
        require_once __DIR__ . '/controllers/herbs.php';
        if ($method==='GET' && empty($parts[1]))          { getHerbs(); exit; }
        if ($method==='GET' && is_numeric($parts[1]))     { getHerb((int)$parts[1]); exit; }
    }

    // ── SEARCH ───────────────────────────────────────────────
    if ($parts[0]==='search' && $method==='GET') {
        require_once __DIR__ . '/controllers/search.php';
        // Save to history if authenticated
        $searchUser = optionalAuth();
        search($searchUser); exit;
    }

    // ── ALERTS ───────────────────────────────────────────────
    if ($parts[0] === 'alerts') {
        require_once __DIR__ . '/controllers/alerts.php';
        $user = requireAuth();
        if ($method==='GET' && empty($parts[1]))                              { getUserAlerts($user); exit; }
        if ($method==='GET' && $parts[1]==='drug' && is_numeric($parts[2]))  { getDrugAlerts($user,(int)$parts[2]); exit; }
        if ($method==='PUT' && is_numeric($parts[1])) {
            DB::get()->prepare('UPDATE user_alerts SET is_read=1 WHERE id=? AND user_id=?')->execute([(int)$parts[1],$user['id']]);
            echo json_encode(['message'=>'Marked as read']); exit;
        }
    }

    // ── PROFILE ──────────────────────────────────────────────
    if ($parts[0] === 'profile') {
        require_once __DIR__ . '/controllers/profile.php';
        $user = requireAuth();
        if ($method==='GET')  { getProfile($user); exit; }
        if ($method==='POST') { saveProfile($user); exit; }
    }

    // ── FAVORITES ────────────────────────────────────────────
    if ($parts[0] === 'favorites') {
        require_once __DIR__ . '/controllers/favorites.php';
        $user = requireAuth();
        if ($method==='GET')  { getFavorites($user); exit; }
        if ($method==='POST') { toggleFavorite($user); exit; }
    }

    // ── USER PAGES ───────────────────────────────────────────
    if ($parts[0]==='dashboard' && $method==='GET') {
        require_once __DIR__ . '/controllers/user_pages.php';
        getUserDashboard(requireAuth()); exit;
    }
    if ($parts[0]==='history') {
        require_once __DIR__ . '/controllers/user_pages.php';
        $user = requireAuth();
        if ($method==='GET')    { getSearchHistory($user); exit; }
        if ($method==='DELETE') { clearSearchHistory($user); exit; }
    }

    // ── ADMIN ────────────────────────────────────────────────
    if ($parts[0] === 'admin') {
        require_once __DIR__ . '/controllers/admin.php';
        $user = requireAdmin();

        // Stats
        if ($parts[1]==='stats'  && $method==='GET') { adminStats(); exit; }

        // Reports
        if ($parts[1]==='reports' && $method==='GET') {
            require_once __DIR__ . '/controllers/user_pages.php';
            getReports(); exit;
        }

        // Drugs
        if ($parts[1]==='drugs') {
            if ($method==='GET'    && empty($parts[2]))        { adminGetDrugs(); exit; }
            if ($method==='POST')                              { adminSaveDrug($body()); exit; }
            if ($method==='PUT'    && is_numeric($parts[2]))   { adminSaveDrug($body(),(int)$parts[2]); exit; }
            if ($method==='DELETE' && is_numeric($parts[2]))   { adminDeleteDrug((int)$parts[2]); exit; }
        }

        // Herbs
        if ($parts[1]==='herbs') {
            require_once __DIR__ . '/controllers/admin_herbs.php';
            if ($method==='GET'    && empty($parts[2]))        { adminGetHerbs(); exit; }
            if ($method==='POST')                              { adminSaveHerb($body()); exit; }
            if ($method==='PUT'    && is_numeric($parts[2]))   { adminSaveHerb($body(),(int)$parts[2]); exit; }
            if ($method==='DELETE' && is_numeric($parts[2]))   { adminDeleteHerb((int)$parts[2]); exit; }
        }

        // Interactions
        if ($parts[1]==='interactions') {
            require_once __DIR__ . '/controllers/interactions.php';
            if ($method==='GET'    && empty($parts[2]))        { getInteractions(); exit; }
            if ($method==='POST')                              { saveInteraction($body()); exit; }
            if ($method==='PUT'    && is_numeric($parts[2]))   { saveInteraction($body(),(int)$parts[2]); exit; }
            if ($method==='DELETE' && is_numeric($parts[2]))   { deleteInteraction((int)$parts[2]); exit; }
        }

        // Users
        if ($parts[1]==='users') {
            if ($method==='GET')                               { adminGetUsers(); exit; }
            if ($method==='PUT' && is_numeric($parts[2]))      { adminToggleUser((int)$parts[2]); exit; }
        }

        // Alert Rules
        if ($parts[1]==='alert-rules') {
            require_once __DIR__ . '/controllers/alert_rules.php';
            if ($method==='GET')                               { getAlertRules(); exit; }
            if ($method==='POST')                              { saveAlertRule($body()); exit; }
            if ($method==='PUT'    && is_numeric($parts[2]))   { saveAlertRule($body(),(int)$parts[2]); exit; }
            if ($method==='DELETE' && is_numeric($parts[2]))   { deleteAlertRule((int)$parts[2]); exit; }
        }

        // Drugs/Herbs list for dropdowns
        if ($parts[1]==='drugs-list' && $method==='GET') {
            $rows = DB::get()->query('SELECT id, drug_name FROM drugs WHERE is_active=1 ORDER BY drug_name')->fetchAll();
            echo json_encode($rows); exit;
        }
        if ($parts[1]==='herbs-list' && $method==='GET') {
            $rows = DB::get()->query('SELECT id, herb_name FROM herbs WHERE is_active=1 ORDER BY herb_name')->fetchAll();
            echo json_encode($rows); exit;
        }
    }

    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

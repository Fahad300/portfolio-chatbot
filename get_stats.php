<?php
/**
 * Get Stats Endpoint
 * Returns analytics data for the stats dashboard
 * 
 * UPLOAD THIS TO: /public_html/chat/api/get_stats.php
 */

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Change * to your domain in production
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read analytics log file
$logFile = __DIR__ . '/analytics_log.json';

if (!file_exists($logFile)) {
    echo json_encode([
        'totalSessions' => 0,
        'totalMessages' => 0,
        'totalQuickQuestions' => 0,
        'totalCustomMessages' => 0,
        'recentSessions' => [],
        'popularQuestions' => [],
        'locations' => []
    ]);
    exit;
}

$allSessions = json_decode(file_get_contents($logFile), true) ?: [];

// Process all sessions
$totalSessions = count($allSessions);
$totalMessages = 0;
$totalQuickQuestions = 0;
$totalCustomMessages = 0;
$questionCounts = [];
$locationCounts = [];

foreach ($allSessions as $entry) {
    $session = $entry['data'] ?? [];
    $summary = $session['summary'] ?? [];
    
    $totalMessages += $summary['totalMessages'] ?? 0;
    $totalQuickQuestions += $summary['quickQuestions'] ?? 0;
    $totalCustomMessages += $summary['customMessages'] ?? 0;
    
    // Count popular questions
    $interactions = $session['interactions'] ?? [];
    foreach ($interactions as $interaction) {
        if ($interaction['type'] === 'quick_question' && isset($interaction['question'])) {
            $question = $interaction['question'];
            $questionCounts[$question] = ($questionCounts[$question] ?? 0) + 1;
        }
    }
    
    // Count locations
    $userInfo = $session['userInfo'] ?? [];
    $country = $userInfo['timezone'] ?? 'Unknown';
    if (!isset($locationCounts[$country])) {
        $locationCounts[$country] = [
            'country' => $country,
            'city' => null,
            'count' => 0
        ];
    }
    $locationCounts[$country]['count']++;
}

// Sort popular questions
arsort($questionCounts);
$popularQuestions = array_slice(array_map(function($question, $count) {
    return ['question' => $question, 'count' => $count];
}, array_keys($questionCounts), array_values($questionCounts)), 0, 10);

// Sort locations
usort($locationCounts, function($a, $b) {
    return $b['count'] - $a['count'];
});
$locations = array_slice($locationCounts, 0, 10);

// Get recent sessions (last 20)
$recentSessions = array_slice(array_reverse($allSessions), 0, 20);
$recentSessions = array_map(function($entry) {
    return $entry['data'] ?? [];
}, $recentSessions);

// Return stats
echo json_encode([
    'totalSessions' => $totalSessions,
    'totalMessages' => $totalMessages,
    'totalQuickQuestions' => $totalQuickQuestions,
    'totalCustomMessages' => $totalCustomMessages,
    'recentSessions' => $recentSessions,
    'popularQuestions' => $popularQuestions,
    'locations' => $locations
]);
?>


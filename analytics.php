<?php
/**
 * Analytics Endpoint
 * Receives user tracking data from the chatbot
 * 
 * UPLOAD THIS TO: /public_html/chat/api/analytics.php
 */

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Change * to your domain in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Log analytics data
// Option 1: Save to file (simple)
$logFile = __DIR__ . '/analytics_log.json';
$existingData = [];

// Read existing data
if (file_exists($logFile)) {
    $existingData = json_decode(file_get_contents($logFile), true) ?: [];
}

// Add new entry
$existingData[] = [
    'timestamp' => date('Y-m-d H:i:s'),
    'data' => $data
];

// Save to file (keep last 1000 entries)
$existingData = array_slice($existingData, -1000);
file_put_contents($logFile, json_encode($existingData, JSON_PRETTY_PRINT));

// Option 2: Save to database (uncomment and configure)
/*
$host = 'localhost';
$dbname = 'your_database';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $stmt = $pdo->prepare("INSERT INTO chatbot_analytics (session_id, user_info, interactions, summary, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([
        $data['sessionId'],
        json_encode($data['userInfo']),
        json_encode($data['interactions']),
        json_encode($data['summary'])
    ]);
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
}
*/

// Return success
echo json_encode([
    'success' => true,
    'message' => 'Analytics logged successfully'
]);
?>


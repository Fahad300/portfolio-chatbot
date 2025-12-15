<?php
/**
 * Location Proxy
 * Fetches visitor IP-based location server-side to avoid CORS issues.
 * 
 * UPLOAD TO: /public_html/chat/api/location.php
 */

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Change * to your domain in production
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Choose a geo provider (ipapi.co free tier)
$geoUrl = 'https://ipapi.co/json/';

$ch = curl_init($geoUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'Connection error', 'details' => $curlError]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Geo lookup failed', 'status' => $httpCode]);
    exit;
}

// Pass through response
echo $response;
?>


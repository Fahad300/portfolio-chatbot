<?php
/**
 * Groq API Proxy
 * Securely handles API calls to Groq (free tier, fast)
 * 
 * UPLOAD THIS TO: /public_html/chat/api/chat.php
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

if (!isset($data['message']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No message provided']);
    exit;
}

// The frontend sends the full prompt (system prompt + conversation)
$fullPrompt = $data['message'];

// ⚠️⚠️⚠️ REPLACE THIS WITH YOUR ACTUAL GROQ API KEY ⚠️⚠️⚠️
// Get your key from: https://console.groq.com/keys
$apiKey = 'YOUR_GROQ_API_KEY_HERE';

// Check if API key is configured
if ($apiKey === 'YOUR_GROQ_API_KEY_HERE' || empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured in chat.php - Please add your Groq API key']);
    exit;
}

// Groq API endpoint
$groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

// Prepare request payload for Groq
// The frontend sends a full prompt with system instructions and conversation history
// We'll use it as a single user message (Groq will handle it)
$payload = [
    'messages' => [
        [
            'role' => 'user',
            'content' => $fullPrompt
        ]
    ],
    'model' => 'llama-3.1-8b-instant', // Free tier model - very fast!
    'temperature' => 0.9,
    'max_tokens' => 150, // Keep responses short (1-2 sentences)
];

// Make request to Groq
$ch = curl_init($groqUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle errors
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Connection error',
        'details' => $curlError
    ]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    $errorData = json_decode($response, true);
    echo json_encode([
        'error' => 'API request failed',
        'status' => $httpCode,
        'details' => $errorData ? $errorData : $response
    ]);
    exit;
}

// Parse Groq response and convert to compatible format
$responseData = json_decode($response, true);

if (isset($responseData['choices'][0]['message']['content'])) {
    // Return in a format compatible with the frontend
    $formattedResponse = [
        'candidates' => [
            [
                'content' => [
                    'parts' => [
                        [
                            'text' => $responseData['choices'][0]['message']['content']
                        ]
                    ]
                ]
            ]
        ]
    ];
    echo json_encode($formattedResponse);
} else {
    // If response format is unexpected, return original
    echo $response;
}
?>

// MoodMap Mock Backend - Node.js/Express Server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('prototype')); // Serve static prototype files

// In-memory data storage
let moods = [];
let hugRequests = [];
let hugResponses = [];
let pushNotifications = [];

// Rate limiting storage
const rateLimits = new Map();

// Load seed data
function loadSeedData() {
    try {
        const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'));
        moods = seedData.moods || [];
        hugRequests = seedData.hugRequests || [];
        console.log('✓ Seed data loaded successfully');
    } catch (error) {
        console.log('⚠ No seed data found, starting with empty data');
    }
}

// Crisis keyword detection
const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end it all', 'want to die', 
    'no reason to live', 'better off dead', 'suicidal'
];

function detectCrisisKeywords(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Rate limiting helper
function checkRateLimit(userId, action, maxRequests, timeWindow) {
    const key = `${userId}-${action}`;
    const now = Date.now();
    
    if (!rateLimits.has(key)) {
        rateLimits.set(key, [now]);
        return true;
    }
    
    const requests = rateLimits.get(key).filter(time => now - time < timeWindow);
    
    if (requests.length >= maxRequests) {
        return false;
    }
    
    requests.push(now);
    rateLimits.set(key, requests);
    return true;
}

// Calculate distance between two coordinates (simplified)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ==================== API ENDPOINTS ====================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MoodMap API is running',
        timestamp: new Date().toISOString()
    });
});

// POST /mood - Submit emotional check-in
app.post('/mood', (req, res) => {
    const { userId, mood, value, note, hasAudio, timestamp, location } = req.body;
    
    // Validation
    if (!userId || !mood || value === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: userId, mood, value'
        });
    }
    
    // Rate limiting: max 20 check-ins per hour
    if (!checkRateLimit(userId, 'mood', 20, 3600000)) {
        return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please try again later.'
        });
    }
    
    // Crisis keyword detection
    if (note && detectCrisisKeywords(note)) {
        return res.status(400).json({
            success: false,
            message: 'Crisis keywords detected. Please seek immediate help.',
            crisisResources: {
                phone: '988',
                text: 'Text HOME to 741741',
                url: 'https://988lifeline.org/'
            }
        });
    }
    
    // Create mood entry
    const moodEntry = {
        id: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        mood,
        value,
        note: note || null,
        hasAudio: hasAudio || false,
        timestamp: timestamp || new Date().toISOString(),
        location: location || null,
        emoji: getMoodEmoji(value)
    };
    
    moods.push(moodEntry);
    
    res.json({
        success: true,
        message: 'Mood check-in recorded',
        mood: moodEntry
    });
});

// GET /mood - Get mood history for a user
app.get('/mood', (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameter: userId'
        });
    }
    
    const userMoods = moods
        .filter(m => m.userId === userId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
        success: true,
        moods: userMoods,
        count: userMoods.length
    });
});

// POST /hug-requests - Create a support request
app.post('/hug-requests', (req, res) => {
    const { userId, message, location, privacyLevel, radius, timestamp, expiresAt } = req.body;
    
    // Validation
    if (!userId || !location) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: userId, location'
        });
    }
    
    // Rate limiting: max 3 hug requests per hour
    if (!checkRateLimit(userId, 'hug-request', 3, 3600000)) {
        return res.status(429).json({
            success: false,
            message: 'You can only send 3 support requests per hour. Please try again later.'
        });
    }
    
    // Crisis keyword detection - block broadcast but provide resources
    if (message && detectCrisisKeywords(message)) {
        return res.status(400).json({
            success: false,
            message: 'Your message suggests you may be in crisis. Please contact emergency services.',
            crisisResources: {
                phone: '988',
                text: 'Text HOME to 741741',
                url: 'https://988lifeline.org/'
            }
        });
    }
    
    // Create hug request
    const hugRequest = {
        id: `hug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        message: message || 'Someone nearby needs support',
        location,
        privacyLevel: privacyLevel || 'neighborhood',
        radius: radius || 3,
        timestamp: timestamp || new Date().toISOString(),
        expiresAt: expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: 'active',
        responses: 0,
        isVerifiedVolunteer: Math.random() > 0.7, // 30% chance of verified volunteer
        neighborhood: generateNeighborhoodName(location)
    };
    
    hugRequests.push(hugRequest);
    
    // Simulate push notifications to nearby users
    sendNearbyNotifications(hugRequest);
    
    res.json({
        success: true,
        message: 'Support request created',
        request: hugRequest
    });
});

// GET /nearby-hug-requests - Get nearby support requests
app.get('/nearby-hug-requests', (req, res) => {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters: lat, lng'
        });
    }
    
    const searchRadius = parseFloat(radius) || 5;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const now = new Date();
    
    // Filter nearby and active requests
    const nearbyRequests = hugRequests.filter(request => {
        const isActive = new Date(request.expiresAt) > now && request.status === 'active';
        if (!isActive) return false;
        
        const distance = calculateDistance(
            userLat, userLng,
            request.location.lat, request.location.lng
        );
        
        return distance <= searchRadius;
    });
    
    // Sort by distance (closest first)
    nearbyRequests.sort((a, b) => {
        const distA = calculateDistance(userLat, userLng, a.location.lat, a.location.lng);
        const distB = calculateDistance(userLat, userLng, b.location.lat, b.location.lng);
        return distA - distB;
    });
    
    res.json({
        success: true,
        requests: nearbyRequests,
        count: nearbyRequests.length
    });
});

// POST /hug-responses - Respond to a support request
app.post('/hug-responses', (req, res) => {
    const { requestId, responderId, response } = req.body;
    
    // Validation
    if (!requestId || !responderId || !response) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: requestId, responderId, response'
        });
    }
    
    // Find the request
    const request = hugRequests.find(r => r.id === requestId);
    
    if (!request) {
        return res.status(404).json({
            success: false,
            message: 'Support request not found'
        });
    }
    
    // Check if expired
    if (new Date(request.expiresAt) < new Date()) {
        return res.status(400).json({
            success: false,
            message: 'This support request has expired'
        });
    }
    
    // Create response
    const hugResponse = {
        id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requestId,
        responderId,
        response,
        timestamp: new Date().toISOString()
    };
    
    hugResponses.push(hugResponse);
    
    // Update request
    request.responses += 1;
    if (response === 'accept') {
        request.status = 'matched';
        
        // Send push notification to requester
        sendPushNotification(
            request.userId,
            'MoodMap',
            'Someone accepted your support request!'
        );
    }
    
    res.json({
        success: true,
        message: 'Response recorded',
        response: hugResponse
    });
});

// POST /push/send - Send push notification (mock)
app.post('/push/send', (req, res) => {
    const { userId, title, message, type } = req.body;
    
    if (!userId || !message) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: userId, message'
        });
    }
    
    const notification = {
        id: `push-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: title || 'MoodMap',
        message,
        type: type || 'info',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    pushNotifications.push(notification);
    
    console.log(`📱 Push notification sent to ${userId}: ${message}`);
    
    res.json({
        success: true,
        message: 'Push notification sent',
        notification
    });
});

// GET /push/notifications - Get push notifications for a user
app.get('/push/notifications', (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameter: userId'
        });
    }
    
    const userNotifications = pushNotifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
        success: true,
        notifications: userNotifications,
        unread: userNotifications.filter(n => !n.read).length
    });
});

// POST /report-abuse - Report inappropriate content
app.post('/report-abuse', (req, res) => {
    const { reporterId, contentId, contentType, reason } = req.body;
    
    if (!reporterId || !contentId || !contentType) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    console.log(`⚠️ Abuse report: User ${reporterId} reported ${contentType} ${contentId}`);
    
    res.json({
        success: true,
        message: 'Report submitted. Our team will review this content.',
        reportId: `report-${Date.now()}`
    });
});

// ==================== HELPER FUNCTIONS ====================

function getMoodEmoji(value) {
    const emojis = { 5: '😊', 4: '😌', 3: '😐', 2: '😰', 1: '😢' };
    return emojis[value] || '😐';
}

function generateNeighborhoodName(location) {
    const neighborhoods = [
        'Downtown', 'Midtown', 'Uptown', 'East Side', 'West Side',
        'North End', 'South End', 'Riverside', 'Parkside', 'Harbor District'
    ];
    // Use location to consistently generate a neighborhood name
    const index = Math.abs(Math.floor(location.lat * 100 + location.lng * 100)) % neighborhoods.length;
    return neighborhoods[index];
}

function sendNearbyNotifications(request) {
    // In a real app, this would query users within radius and send push notifications
    console.log(`📍 Broadcasting support request to ${request.neighborhood} (${request.radius} mile radius)`);
}

function sendPushNotification(userId, title, message) {
    const notification = {
        id: `push-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title,
        message,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    pushNotifications.push(notification);
    console.log(`📱 Push notification sent to ${userId}: ${message}`);
}

// ==================== SERVER STARTUP ====================

// Load seed data and start server
loadSeedData();

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('   MoodMap Mock Backend Server');
    console.log('═══════════════════════════════════════════');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API endpoints available at http://localhost:${PORT}/`);
    console.log(`✓ Prototype UI available at http://localhost:${PORT}/`);
    console.log('');
    console.log('Available Endpoints:');
    console.log('  GET  /health');
    console.log('  POST /mood');
    console.log('  GET  /mood');
    console.log('  POST /hug-requests');
    console.log('  GET  /nearby-hug-requests');
    console.log('  POST /hug-responses');
    console.log('  POST /push/send');
    console.log('  GET  /push/notifications');
    console.log('  POST /report-abuse');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('═══════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
});

// MoodMap Mobile Prototype - Client-side JavaScript
// API Base URL - adjust if running on different port
const API_BASE_URL = 'http://localhost:3000';

// State Management
let currentUser = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    location: { lat: 40.7128, lng: -74.0060 } // Mock NYC location
};

let selectedMood = null;
let audioRecording = false;
let audioTimer = null;
let audioSeconds = 0;

// Crisis keywords for safety detection
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all', 'want to die', 'no reason to live'];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeMoodSelector();
    initializeAudioRecording();
    initializeCommunityFeatures();
    loadTimeline();
    loadNearbyHugRequests();
    
    // Refresh hug requests every 30 seconds
    setInterval(loadNearbyHugRequests, 30000);
});

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Refresh data when switching to certain tabs
    if (tabName === 'timeline') {
        loadTimeline();
    } else if (tabName === 'community') {
        loadNearbyHugRequests();
    }
}

// Mood Selector
function initializeMoodSelector() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const checkinDetails = document.getElementById('checkin-details');
    const submitBtn = document.getElementById('submit-checkin');
    
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove previous selection
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Select current mood
            button.classList.add('selected');
            selectedMood = {
                mood: button.dataset.mood,
                value: parseInt(button.dataset.value),
                emoji: button.querySelector('.emoji').textContent,
                label: button.querySelector('.label').textContent
            };
            
            // Show details section
            checkinDetails.classList.remove('hidden');
            document.getElementById('checkin-success').classList.add('hidden');
        });
    });
    
    submitBtn.addEventListener('click', submitMoodCheckin);
}

async function submitMoodCheckin() {
    if (!selectedMood) {
        alert('Please select a mood first');
        return;
    }
    
    const note = document.getElementById('mood-note').value.trim();
    
    // Check for crisis keywords
    if (note && detectCrisisKeywords(note)) {
        showSafetyBanner();
        return;
    }
    
    const checkinData = {
        userId: currentUser.id,
        mood: selectedMood.mood,
        value: selectedMood.value,
        note: note || null,
        hasAudio: audioRecording,
        timestamp: new Date().toISOString(),
        location: currentUser.location
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/mood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkinData)
        });
        
        if (response.ok) {
            // Show success message
            document.getElementById('checkin-success').classList.remove('hidden');
            document.getElementById('checkin-details').classList.add('hidden');
            
            // Reset form
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
            document.getElementById('mood-note').value = '';
            selectedMood = null;
            audioRecording = false;
            
            // Reload timeline
            loadTimeline();
        } else {
            alert('Failed to submit check-in. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting check-in:', error);
        alert('Network error. Please check your connection.');
    }
}

// Audio Recording (Simulated)
function initializeAudioRecording() {
    const audioBtn = document.getElementById('audio-btn');
    
    audioBtn.addEventListener('click', () => {
        if (audioRecording) {
            stopAudioRecording();
        } else {
            startAudioRecording();
        }
    });
}

function startAudioRecording() {
    audioRecording = true;
    audioSeconds = 0;
    
    document.getElementById('audio-text').textContent = 'Stop Recording';
    document.getElementById('audio-icon').textContent = '⏹️';
    document.getElementById('audio-timer').classList.remove('hidden');
    
    audioTimer = setInterval(() => {
        audioSeconds++;
        document.getElementById('timer-display').textContent = audioSeconds;
        
        if (audioSeconds >= 10) {
            stopAudioRecording();
        }
    }, 1000);
}

function stopAudioRecording() {
    clearInterval(audioTimer);
    audioTimer = null;
    
    document.getElementById('audio-text').textContent = audioRecording && audioSeconds > 0 
        ? `Audio Recorded (${audioSeconds}s)` 
        : 'Record 10s Audio Note';
    document.getElementById('audio-icon').textContent = '🎤';
    document.getElementById('audio-timer').classList.add('hidden');
}

// Timeline
async function loadTimeline() {
    try {
        const response = await fetch(`${API_BASE_URL}/mood?userId=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            renderHeatmap(data.moods);
            renderTimelineEntries(data.moods);
        }
    } catch (error) {
        console.error('Error loading timeline:', error);
        renderEmptyTimeline();
    }
}

function renderHeatmap(moods) {
    const heatmapContainer = document.getElementById('heatmap');
    heatmapContainer.innerHTML = '';
    
    // Get last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today - 6 + i + 7) % 7;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'heatmap-day';
        dayDiv.textContent = days[dayIndex];
        
        // Find mood for this day (simplified - just use recent moods)
        if (moods.length > i) {
            const mood = moods[moods.length - 1 - i];
            dayDiv.classList.add(`mood-${mood.value}`);
        }
        
        heatmapContainer.appendChild(dayDiv);
    }
}

function renderTimelineEntries(moods) {
    const container = document.getElementById('timeline-entries');
    
    if (moods.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No check-ins yet. Start tracking your mood!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Show most recent first
    moods.slice().reverse().forEach(mood => {
        const entry = document.createElement('div');
        entry.className = 'timeline-entry';
        
        const timeAgo = getTimeAgo(new Date(mood.timestamp));
        
        entry.innerHTML = `
            <div class="mood-info">
                <div class="mood-emoji">${mood.emoji || getMoodEmoji(mood.value)}</div>
                <div class="mood-details">
                    <div class="mood-label">${mood.mood || 'Unknown'}</div>
                    <div class="mood-time">${timeAgo}</div>
                </div>
            </div>
            ${mood.note ? `<div class="mood-note-text">${escapeHtml(mood.note)}</div>` : ''}
            ${mood.hasAudio ? `<div class="audio-indicator">🎤 Audio note included</div>` : ''}
        `;
        
        container.appendChild(entry);
    });
}

function renderEmptyTimeline() {
    document.getElementById('timeline-entries').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <p>No check-ins yet. Start tracking your mood!</p>
        </div>
    `;
}

// Community Features
function initializeCommunityFeatures() {
    const needHugBtn = document.getElementById('need-hug-btn');
    const hugRequestForm = document.getElementById('hug-request-form');
    const submitHugBtn = document.getElementById('submit-hug-request');
    const cancelHugBtn = document.getElementById('cancel-hug-request');
    
    needHugBtn.addEventListener('click', () => {
        needHugBtn.classList.add('hidden');
        hugRequestForm.classList.remove('hidden');
    });
    
    cancelHugBtn.addEventListener('click', () => {
        hugRequestForm.classList.add('hidden');
        needHugBtn.classList.remove('hidden');
        document.getElementById('hug-message').value = '';
    });
    
    submitHugBtn.addEventListener('click', submitHugRequest);
}

async function submitHugRequest() {
    const message = document.getElementById('hug-message').value.trim();
    const privacyLevel = document.getElementById('privacy-level').value;
    const radius = parseInt(document.getElementById('notification-radius').value);
    
    // Check for crisis keywords
    if (message && detectCrisisKeywords(message)) {
        showSafetyBanner();
        return;
    }
    
    const requestData = {
        userId: currentUser.id,
        message: message || 'Someone nearby needs support',
        location: currentUser.location,
        privacyLevel: privacyLevel,
        radius: radius,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/hug-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            alert('Your support request has been sent to nearby community members.');
            document.getElementById('hug-request-form').classList.add('hidden');
            document.getElementById('need-hug-btn').classList.remove('hidden');
            document.getElementById('hug-message').value = '';
            
            // Simulate push notification
            simulatePushNotification('Your support request is now active');
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to send request. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting hug request:', error);
        alert('Network error. Please check your connection.');
    }
}

async function loadNearbyHugRequests() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/nearby-hug-requests?lat=${currentUser.location.lat}&lng=${currentUser.location.lng}&radius=5`
        );
        const data = await response.json();
        
        if (data.success) {
            renderHugRequestsFeed(data.requests);
        }
    } catch (error) {
        console.error('Error loading hug requests:', error);
        renderEmptyFeed();
    }
}

function renderHugRequestsFeed(requests) {
    const container = document.getElementById('hug-requests-feed');
    
    // Filter out expired requests
    const activeRequests = requests.filter(req => new Date(req.expiresAt) > new Date());
    
    if (activeRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💙</div>
                <p>No active support requests nearby right now.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    activeRequests.forEach(request => {
        const card = document.createElement('div');
        card.className = 'hug-request-card';
        if (request.isVerifiedVolunteer) {
            card.classList.add('verified');
        }
        
        const timeAgo = getTimeAgo(new Date(request.timestamp));
        const timeLeft = getTimeRemaining(new Date(request.expiresAt));
        
        card.innerHTML = `
            ${request.isVerifiedVolunteer ? '<span class="verified-badge">✓ Verified</span>' : ''}
            <div class="request-header">
                <div class="location">📍 ${request.neighborhood || 'Nearby'}</div>
                <div class="timestamp">${timeAgo}</div>
            </div>
            <div class="message">${escapeHtml(request.message)}</div>
            <button class="respond-btn" onclick="openResponseModal('${request.id}')">
                Respond with Support
            </button>
            <div class="abuse-report">
                <a onclick="reportAbuse('${request.id}')">Report inappropriate content</a>
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 8px;">
                ⏱️ Expires in ${timeLeft}
            </div>
        `;
        
        container.appendChild(card);
    });
}

function renderEmptyFeed() {
    document.getElementById('hug-requests-feed').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">💙</div>
            <p>No active support requests nearby right now.</p>
        </div>
    `;
}

// Response Modal
function openResponseModal(requestId) {
    const modal = document.getElementById('response-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('response-modal-text').textContent = 
        'You\'re about to connect with someone who needs support. Please be kind and respectful.';
    
    document.getElementById('accept-hug').onclick = () => acceptHugRequest(requestId);
    document.getElementById('reject-hug').onclick = closeResponseModal;
}

function closeResponseModal() {
    document.getElementById('response-modal').classList.add('hidden');
}

async function acceptHugRequest(requestId) {
    try {
        const response = await fetch(`${API_BASE_URL}/hug-responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: requestId,
                responderId: currentUser.id,
                response: 'accept'
            })
        });
        
        if (response.ok) {
            closeResponseModal();
            alert('Connection made! The person has been notified. (In a real app, messaging would begin here.)');
            simulatePushNotification('Someone accepted your support request!');
            loadNearbyHugRequests();
        } else {
            alert('Failed to respond. The request may have expired.');
        }
    } catch (error) {
        console.error('Error responding to hug request:', error);
        alert('Network error. Please try again.');
    }
}

// Safety Features
function detectCrisisKeywords(text) {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function showSafetyBanner() {
    document.getElementById('safety-banner').classList.remove('hidden');
}

function closeSafetyBanner() {
    document.getElementById('safety-banner').classList.add('hidden');
}

function reportAbuse(requestId) {
    // In a real app, this would send a report to moderators
    alert('Thank you for reporting. Our team will review this content. (This is a simulation)');
    console.log('Abuse reported for request:', requestId);
}

// Push Notification Simulation
async function simulatePushNotification(message) {
    try {
        await fetch(`${API_BASE_URL}/push/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                title: 'MoodMap',
                message: message,
                type: 'info'
            })
        });
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MoodMap', { body: message });
        } else {
            console.log('Push notification:', message);
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

// Utility Functions
function getMoodEmoji(value) {
    const emojis = { 5: '😊', 4: '😌', 3: '😐', 2: '😰', 1: '😢' };
    return emojis[value] || '😐';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

function getTimeRemaining(date) {
    const seconds = Math.floor((date - new Date()) / 1000);
    
    if (seconds < 0) return 'Expired';
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.switchTab = switchTab;
window.openResponseModal = openResponseModal;
window.closeResponseModal = closeResponseModal;
window.reportAbuse = reportAbuse;
window.closeSafetyBanner = closeSafetyBanner;

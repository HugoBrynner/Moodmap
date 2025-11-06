# Push Notification Integration Guide

This document describes the push notification system for MoodMap and how to integrate it with production notification services.

## Overview

MoodMap uses push notifications to:
- Notify users when someone accepts their support request
- Alert users to nearby support requests (opt-in)
- Remind users about expiring support requests
- Confirm successful actions

## Mock Implementation

The current prototype includes a mock push notification endpoint at `POST /push/send`. This endpoint:
- Accepts notification payloads
- Logs notifications to console
- Stores notifications in memory
- Returns success responses

**Note:** No actual push notifications are sent in the mock backend.

---

## Notification Types

### 1. Support Request Accepted
**Trigger:** Someone accepts a user's "I need a hug" request
**Recipient:** User who created the request
**Priority:** High

```javascript
{
  "userId": "user-123",
  "title": "MoodMap",
  "message": "Someone accepted your support request!",
  "type": "alert",
  "data": {
    "requestId": "hug-456",
    "action": "open_chat",
    "responderId": "user-789"
  }
}
```

### 2. Support Request Created Successfully
**Trigger:** User successfully creates a support request
**Recipient:** Requesting user
**Priority:** Normal

```javascript
{
  "userId": "user-123",
  "title": "MoodMap",
  "message": "Your support request is now active",
  "type": "info",
  "data": {
    "requestId": "hug-456",
    "expiresAt": "2024-11-06T14:30:00Z"
  }
}
```

### 3. Nearby Support Request (Opt-in)
**Trigger:** New support request within user's notification radius
**Recipient:** Users who opted into nearby notifications
**Priority:** Normal

```javascript
{
  "userId": "user-789",
  "title": "MoodMap",
  "message": "Someone nearby needs support",
  "type": "info",
  "data": {
    "requestId": "hug-456",
    "neighborhood": "Downtown",
    "distance": 1.2
  }
}
```

### 4. Support Request Expiring Soon
**Trigger:** Support request has 5 minutes remaining
**Recipient:** User who created the request (if no responses)
**Priority:** Low

```javascript
{
  "userId": "user-123",
  "title": "MoodMap",
  "message": "Your support request will expire in 5 minutes",
  "type": "warning",
  "data": {
    "requestId": "hug-456",
    "action": "extend_request"
  }
}
```

---

## Production Integration

### Recommended Services

#### iOS (Apple Push Notification Service)
- Use APNs for iOS devices
- Requires Apple Developer account
- Certificate-based or token-based authentication
- Silent notifications for background updates

**Libraries:**
- `node-apn` (Node.js)
- Firebase Cloud Messaging (cross-platform)

#### Android (Firebase Cloud Messaging)
- Use FCM for Android devices
- Free tier available
- Supports both notification and data messages
- Background and foreground delivery

**Libraries:**
- `firebase-admin` (Node.js)
- Direct HTTP/2 API

#### Web (Web Push API)
- Use Web Push for browser notifications
- Requires VAPID keys
- Works across major browsers
- Service worker required

**Libraries:**
- `web-push` (Node.js)

---

## Implementation Steps

### Step 1: Choose a Service

**Option A: Firebase Cloud Messaging (Recommended)**
- Cross-platform (iOS, Android, Web)
- Free tier: 15M messages/month
- Easy setup with `firebase-admin`

**Option B: Native Services**
- APNs for iOS
- FCM for Android
- Web Push for browsers
- More control but more complexity

### Step 2: Store Device Tokens

Add endpoint to register device tokens:

```javascript
// POST /device-tokens
app.post('/device-tokens', (req, res) => {
  const { userId, token, platform } = req.body;
  
  // Store token in database
  deviceTokens.set(userId, {
    token,
    platform, // 'ios', 'android', 'web'
    updatedAt: new Date()
  });
  
  res.json({ success: true });
});
```

### Step 3: Update Push Endpoint

Replace mock implementation with real push service:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post('/push/send', async (req, res) => {
  const { userId, title, message, type, data } = req.body;
  
  // Get user's device token
  const deviceToken = await getDeviceToken(userId);
  
  if (!deviceToken) {
    return res.status(404).json({
      success: false,
      message: 'No device token found'
    });
  }
  
  // Send notification via FCM
  const notification = {
    token: deviceToken.token,
    notification: {
      title,
      body: message
    },
    data: data || {},
    android: {
      priority: type === 'alert' ? 'high' : 'normal'
    },
    apns: {
      payload: {
        aps: {
          sound: type === 'alert' ? 'default' : null,
          badge: 1
        }
      }
    }
  };
  
  try {
    const response = await admin.messaging().send(notification);
    res.json({
      success: true,
      messageId: response
    });
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### Step 4: Handle Notification Preferences

Add user preferences for notification types:

```javascript
const notificationPreferences = {
  nearbyRequests: true,    // Notify about nearby support requests
  requestAccepted: true,   // Notify when someone accepts your request
  requestExpiring: true,   // Notify when request is about to expire
  radius: 3               // Notification radius in miles
};
```

### Step 5: Implement Client-Side Registration

**Web (Service Worker):**

```javascript
// Register service worker
navigator.serviceWorker.register('/sw.js');

// Request notification permission
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // Get FCM token
    messaging.getToken().then(token => {
      // Send token to backend
      fetch('/device-tokens', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          token,
          platform: 'web'
        })
      });
    });
  }
});
```

**iOS (Swift):**

```swift
import UserNotifications
import FirebaseMessaging

// Request permission
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
    if granted {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

// Get FCM token
Messaging.messaging().token { token, error in
    if let token = token {
        // Send token to backend
    }
}
```

**Android (Kotlin):**

```kotlin
import com.google.firebase.messaging.FirebaseMessaging

FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Send token to backend
    }
}
```

---

## Notification Delivery Logic

### Nearby Request Notifications

When a user creates a support request, notify nearby users:

```javascript
async function notifyNearbyUsers(hugRequest) {
  // Find users within radius who have opted in
  const nearbyUsers = await findNearbyUsersWithNotifications(
    hugRequest.location,
    hugRequest.radius
  );
  
  // Send notifications
  for (const user of nearbyUsers) {
    await sendPushNotification(user.id, {
      title: 'MoodMap',
      message: 'Someone nearby needs support',
      type: 'info',
      data: {
        requestId: hugRequest.id,
        neighborhood: hugRequest.neighborhood,
        distance: calculateDistance(user.location, hugRequest.location)
      }
    });
  }
}
```

### Request Expiry Warnings

Check for expiring requests every minute:

```javascript
setInterval(async () => {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  
  const expiringRequests = hugRequests.filter(req => 
    req.status === 'active' &&
    req.responses === 0 &&
    new Date(req.expiresAt) <= fiveMinutesFromNow &&
    !req.expiryWarningShown
  );
  
  for (const request of expiringRequests) {
    await sendPushNotification(request.userId, {
      title: 'MoodMap',
      message: 'Your support request will expire in 5 minutes',
      type: 'warning',
      data: {
        requestId: request.id,
        action: 'extend_request'
      }
    });
    
    request.expiryWarningShown = true;
  }
}, 60000); // Check every minute
```

---

## Testing Push Notifications

### Local Testing

1. **Mock Implementation (Current):**
   - Logs notifications to console
   - Stores in memory for retrieval via GET endpoint
   - No actual device delivery

2. **FCM Test Messages:**
   ```bash
   curl -X POST https://fcm.googleapis.com/fcm/send \
     -H "Authorization: key=YOUR_SERVER_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "DEVICE_TOKEN",
       "notification": {
         "title": "Test",
         "body": "Test notification"
       }
     }'
   ```

3. **Postman Collection:**
   - Test `/push/send` endpoint
   - Verify payload structure
   - Check response codes

### Production Testing

1. **Device Testing:**
   - Test on physical iOS device
   - Test on physical Android device
   - Test on multiple browsers (Chrome, Firefox, Safari)

2. **Notification Appearance:**
   - Foreground notifications
   - Background notifications
   - Lock screen display
   - Notification center

3. **Action Handling:**
   - Tap notification → open app
   - Tap notification → open specific view
   - Dismiss notification

4. **Edge Cases:**
   - App not installed
   - Notifications disabled
   - Token expired/invalid
   - Network offline

---

## Privacy & Permissions

### Permission Requests

**When to ask:**
- After user creates first support request
- When user opts into nearby notifications
- During onboarding (optional)

**Best Practices:**
- Explain why notifications are helpful
- Make it easy to change settings later
- Respect "No" answers
- Don't repeatedly prompt

### Data Handling

**Security:**
- Encrypt device tokens at rest
- Use HTTPS for all push endpoints
- Validate notification payloads
- Implement rate limiting

**Privacy:**
- Don't include sensitive data in notification body
- Use data payload for sensitive information
- Allow users to customize notification types
- Provide opt-out options

---

## Rate Limiting

Prevent notification spam:

```javascript
const notificationRateLimits = {
  nearbyRequests: { max: 10, window: 3600000 }, // 10/hour
  requestAccepted: { max: 20, window: 3600000 }, // 20/hour
  general: { max: 50, window: 86400000 }         // 50/day
};
```

---

## Monitoring & Analytics

### Metrics to Track

1. **Delivery Metrics:**
   - Sent count
   - Delivered count
   - Failed count
   - Delivery rate

2. **Engagement Metrics:**
   - Open rate
   - Action rate (tap through)
   - Dismiss rate
   - Time to open

3. **User Metrics:**
   - Permission grant rate
   - Opt-out rate
   - Token refresh rate

### Logging

```javascript
function logPushNotification(userId, notification, result) {
  console.log({
    timestamp: new Date(),
    userId,
    type: notification.type,
    messageId: result.messageId,
    success: result.success,
    error: result.error
  });
}
```

---

## Error Handling

### Common Errors

1. **Invalid Token:**
   - Token expired or revoked
   - User uninstalled app
   - **Solution:** Remove token from database

2. **Permission Denied:**
   - User denied notification permission
   - **Solution:** Show in-app prompt to enable

3. **Service Unavailable:**
   - FCM/APNs temporarily down
   - **Solution:** Retry with exponential backoff

4. **Rate Limited:**
   - Too many requests to push service
   - **Solution:** Implement queue system

### Retry Logic

```javascript
async function sendPushWithRetry(notification, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await admin.messaging().send(notification);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

---

## Cost Estimates

### Firebase Cloud Messaging (FCM)
- **Free tier:** Unlimited messages
- **Cost:** $0 (no charges for FCM)

### Amazon SNS
- **Free tier:** 1M mobile push deliveries/month
- **Cost:** $0.50 per million notifications after

### OneSignal
- **Free tier:** Unlimited devices, 10k email subscribers
- **Cost:** $9/month for premium features

---

## Migration Path

### From Mock to Production

1. **Phase 1:** Continue using mock while developing client apps
2. **Phase 2:** Add FCM/APNs integration alongside mock
3. **Phase 3:** Switch to real push notifications in staging
4. **Phase 4:** Deploy to production with monitoring
5. **Phase 5:** Remove mock endpoint

---

## References

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [OneSignal Documentation](https://documentation.onesignal.com/)

---

## Version History

- **v1.0** (2024-11-06): Initial push notification integration guide for MVP

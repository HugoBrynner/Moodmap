# Privacy & Safety Implementation

This document outlines MoodMap's privacy-by-default design and safety controls.

## Core Principles

1. **Privacy by Default** - All personal data is private unless explicitly shared
2. **Anonymity First** - Community features use anonymized data
3. **User Control** - Users control what, when, and how they share
4. **Proactive Safety** - Detect and prevent harmful content
5. **Transparent Design** - Clear communication about data usage

---

## Privacy Features

### 1. Personal Data Protection

#### Mood Check-ins
- **Default:** Private to user only
- **Storage:** User-specific records
- **Access:** No one else can view individual check-ins
- **Visibility:** Timeline and heatmap only visible to user

**Implementation:**
```javascript
// Mood entries are always private
app.get('/mood', (req, res) => {
  const { userId } = req.query;
  
  // Only return moods for the requesting user
  const userMoods = moods.filter(m => m.userId === userId);
  
  res.json({ success: true, moods: userMoods });
});
```

#### Location Data
- **Granularity:** Neighborhood-level by default
- **Storage:** Precise coordinates stored but only neighborhood shown
- **Sharing:** Community requests show neighborhood, not exact location
- **Opt-in:** Users can choose city-wide sharing

**Neighborhood Anonymization:**
```javascript
function generateNeighborhoodName(location) {
  // Map precise coordinates to neighborhood name
  // Ensures multiple nearby users map to same neighborhood
  const neighborhoods = ['Downtown', 'Midtown', 'Uptown', ...];
  const index = Math.abs(
    Math.floor(location.lat * 100 + location.lng * 100)
  ) % neighborhoods.length;
  return neighborhoods[index];
}
```

### 2. Anonymous Community Requests

#### "I Need a Hug" Requests
- **Identity:** Always anonymous (no usernames or profiles)
- **Location:** Neighborhood-level granularity only
- **Message:** Optional, limited to 200 characters
- **Expiry:** Automatic after 30 minutes

**Anonymization:**
```javascript
{
  "id": "hug-123",              // Request ID only
  "userId": "hidden",           // User ID hidden from response
  "message": "...",             // Optional message
  "neighborhood": "Downtown",   // Neighborhood, not coordinates
  "timestamp": "...",
  "isVerifiedVolunteer": true   // Trust indicator only
}
```

### 3. Verified Volunteer System

**Purpose:** Build trust without revealing identity

**Criteria for Verification:**
- Account age > 30 days
- Positive response history
- No abuse reports
- Completed safety training (future)

**Implementation:**
```javascript
function isVerifiedVolunteer(userId) {
  const user = getUserProfile(userId);
  
  return (
    user.accountAge > 30 * 24 * 60 * 60 * 1000 &&
    user.positiveResponses > 5 &&
    user.abuseReports === 0
  );
}
```

**Display:**
- ✓ Verified badge on requests
- No personal information revealed
- Builds trust in community

---

## Safety Controls

### 1. Rate Limiting

**Purpose:** Prevent spam and abuse

**Limits:**
- Mood check-ins: 20 per hour per user
- Support requests: 3 per hour per user
- Responses: 10 per hour per user

**Implementation:**
```javascript
function checkRateLimit(userId, action, maxRequests, timeWindow) {
  const key = `${userId}-${action}`;
  const now = Date.now();
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, [now]);
    return true;
  }
  
  const requests = rateLimits.get(key)
    .filter(time => now - time < timeWindow);
  
  if (requests.length >= maxRequests) {
    return false;
  }
  
  requests.push(now);
  rateLimits.set(key, requests);
  return true;
}
```

### 2. Crisis Keyword Detection

**Purpose:** Identify users in crisis and provide resources

**Keywords Detected:**
- suicide
- kill myself
- end it all
- want to die
- no reason to live
- better off dead
- suicidal

**Action:**
- Block message from being posted
- Show crisis resources immediately
- Log for follow-up (if appropriate)

**Implementation:**
```javascript
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 
  'want to die', 'no reason to live'
];

function detectCrisisKeywords(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => 
    lowerText.includes(keyword)
  );
}

// In endpoint
if (detectCrisisKeywords(note)) {
  return res.status(400).json({
    success: false,
    message: 'Crisis keywords detected. Please seek immediate help.',
    crisisResources: {
      phone: '988 Suicide & Crisis Lifeline',
      text: 'Text HOME to 741741',
      url: 'https://988lifeline.org/'
    }
  });
}
```

**Crisis Resources:**
- **Phone:** 988 (Suicide & Crisis Lifeline)
- **Text:** HOME to 741741 (Crisis Text Line)
- **Web:** https://988lifeline.org/
- **Emergency:** 911

### 3. Abuse Reporting

**Purpose:** Allow users to report inappropriate content

**Report Types:**
- Inappropriate message
- Harassment
- Spam
- Other

**Implementation:**
```javascript
app.post('/report-abuse', (req, res) => {
  const { reporterId, contentId, contentType, reason } = req.body;
  
  // Log report for moderation review
  abuseReports.push({
    id: generateId(),
    reporterId,
    contentId,
    contentType,
    reason,
    timestamp: new Date(),
    status: 'pending'
  });
  
  // Auto-hide content after 3 reports
  const reportCount = abuseReports.filter(
    r => r.contentId === contentId
  ).length;
  
  if (reportCount >= 3) {
    hideContent(contentId);
  }
  
  res.json({
    success: true,
    message: 'Report submitted. Our team will review this content.'
  });
});
```

**User Feedback:**
"Thank you for reporting. Our team will review this content."

### 4. Content Moderation

**Automated Moderation:**
- Crisis keyword detection (immediate)
- Profanity filter (warning)
- Spam detection (rate limits)

**Manual Moderation:**
- Review abuse reports
- Investigate patterns
- Take action on accounts

**Moderation Actions:**
1. **Warning:** First offense, educational message
2. **Timeout:** 24-hour suspension
3. **Suspension:** 7-day suspension
4. **Ban:** Permanent account ban

### 5. Request Expiry

**Purpose:** Prevent stale requests and reduce clutter

**Expiry Time:** 30 minutes from creation

**Implementation:**
```javascript
app.get('/nearby-hug-requests', (req, res) => {
  const now = new Date();
  
  // Filter out expired requests
  const activeRequests = hugRequests.filter(request => {
    return (
      new Date(request.expiresAt) > now &&
      request.status === 'active'
    );
  });
  
  res.json({ success: true, requests: activeRequests });
});
```

**User Communication:**
"⏱️ Requests expire after 30 minutes"

---

## Data Handling

### 1. Data Minimization

**Collect only essential data:**
- Mood value and timestamp
- Location (for community features only)
- Optional note/audio flag
- No names, emails, or identifiable info in prototype

### 2. Data Storage (Mock Backend)

**Current Implementation:**
- In-memory storage
- No persistent database
- Data cleared on restart
- Suitable for prototype only

**Production Requirements:**
- Encrypted at rest
- Encrypted in transit (HTTPS)
- Regular backups
- Secure deletion

### 3. Data Access

**Who can access:**
- User: Their own mood data (full access)
- User: Anonymous community requests (limited)
- System: Aggregated analytics (anonymized)
- No one: Other users' personal data

**Access Control:**
```javascript
function canAccessMood(requesterId, moodEntry) {
  return requesterId === moodEntry.userId;
}

function canAccessHugRequest(requesterId, request) {
  // Anyone can see active community requests (anonymized)
  return (
    new Date(request.expiresAt) > new Date() &&
    request.status === 'active'
  );
}
```

### 4. Data Retention

**Prototype:** No retention policy (in-memory)

**Production Recommendations:**
- Mood data: Keep indefinitely (user's choice to delete)
- Support requests: Delete after 7 days
- Responses: Delete after 7 days
- Abuse reports: Keep for 1 year
- Logs: Keep for 90 days

---

## User Controls

### 1. Privacy Settings (Future)

**Profile Visibility:**
- [ ] Private (default)
- [ ] Community (anonymous)
- [ ] Public (with consent)

**Location Sharing:**
- [ ] Never
- [x] Neighborhood only (default)
- [ ] City-wide
- [ ] Precise location (opt-in)

**Notification Preferences:**
- [x] Request accepted (default)
- [ ] Nearby requests (opt-in)
- [ ] Request expiring (opt-in)
- Notification radius: 1, 3, or 5 miles

### 2. Data Management (Future)

**Export Data:**
- Download all mood check-ins
- Download support request history
- JSON or CSV format

**Delete Data:**
- Delete all mood data
- Delete account
- Permanent deletion within 30 days

### 3. Block & Report

**Block Users:**
- Prevent seeing requests from specific users
- Prevent those users from responding to your requests

**Report Content:**
- Available on all community content
- Quick and easy to use
- Anonymous reporting

---

## Compliance Considerations

### GDPR (EU)
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ User consent (implicit for prototype)
- ⚠️ Need: Right to access, delete, export
- ⚠️ Need: Privacy policy
- ⚠️ Need: Data protection officer (if applicable)

### CCPA (California)
- ✅ Disclosure of data collected
- ⚠️ Need: Privacy policy
- ⚠️ Need: Do not sell my data option
- ⚠️ Need: Delete data option

### COPPA (Children)
- ⚠️ Age verification required if targeting children
- ⚠️ Parental consent required for users under 13

### HIPAA (Healthcare)
**Note:** MoodMap is NOT a medical app
- Not diagnosing or treating conditions
- Not replacing professional care
- Explicitly state: "Not a substitute for professional help"

---

## Security Best Practices

### 1. Authentication (Production)

**Requirements:**
- Secure password hashing (bcrypt, scrypt)
- Multi-factor authentication (optional)
- Session management
- JWT tokens with expiry

### 2. API Security

**Implemented:**
- CORS enabled
- JSON body parsing
- Input validation

**Needed for Production:**
- Authentication required
- API rate limiting
- Request signing
- SQL injection prevention
- XSS prevention

### 3. Network Security

**Current:**
- HTTP (local development)

**Production:**
- HTTPS only (TLS 1.3)
- Certificate pinning (mobile apps)
- Secure headers (CSP, HSTS)

---

## Trust & Safety Team (Future)

### Roles

**Community Manager:**
- Review abuse reports
- Communicate with users
- Develop safety guidelines

**Safety Analyst:**
- Monitor patterns
- Identify new risks
- Improve detection systems

**Developer:**
- Implement safety features
- Fix security issues
- Build moderation tools

### Processes

**Report Review:**
1. Receive report
2. Review content and context
3. Make decision
4. Take action
5. Notify user (if appropriate)

**Pattern Detection:**
- Monitor for spam accounts
- Track repeat offenders
- Identify new abuse vectors

**Transparency:**
- Publish safety reports
- Share statistics
- Explain actions

---

## Safety Education

### User Onboarding

**First Launch:**
- Explain privacy features
- Show safety tools
- Highlight resources

**Community Guidelines:**
- Be kind and respectful
- No harassment or abuse
- Protect your privacy
- Report inappropriate content

### Crisis Resources

**Always Available:**
- 988 Suicide & Crisis Lifeline
- Crisis Text Line (741741)
- National Domestic Violence Hotline
- SAMHSA's National Helpline

**In-App Resources:**
- Crisis banner (triggered by keywords)
- Help center link
- Emergency contacts

---

## Testing Privacy & Safety

### Test Cases

1. **Rate Limiting:**
   - Submit 21 mood check-ins in 1 hour → Should be blocked
   - Submit 4 support requests in 1 hour → Should be blocked

2. **Crisis Detection:**
   - Submit mood note with "suicide" → Should be blocked
   - Show crisis resources → Should display phone numbers

3. **Anonymity:**
   - View support requests → Should not see user IDs
   - Check location → Should only show neighborhood

4. **Expiry:**
   - Create support request → Should expire after 30 min
   - View expired request → Should not appear in feed

5. **Abuse Reporting:**
   - Report content → Should log report
   - 3 reports on same content → Should hide content

### Security Testing

**Automated:**
- OWASP ZAP security scan
- npm audit for dependencies
- CodeQL for vulnerabilities

**Manual:**
- Penetration testing
- Privacy audit
- GDPR compliance review

---

## Incident Response

### Crisis Situation

**If user reports immediate danger:**
1. Display crisis resources immediately
2. Encourage contacting 988 or 911
3. Log incident for follow-up
4. Do NOT attempt to provide counseling

### Security Breach

**If data breach occurs:**
1. Contain the breach
2. Assess impact
3. Notify affected users (within 72 hours for GDPR)
4. Report to authorities if required
5. Improve security measures

### Abuse Pattern

**If pattern detected:**
1. Investigate thoroughly
2. Take action on accounts
3. Update detection systems
4. Communicate with community

---

## Version History

- **v1.0** (2024-11-06): Initial privacy and safety documentation for MVP

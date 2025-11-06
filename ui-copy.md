# MoodMap UI Copy Guidelines

This document defines the user-facing text, messaging, and tone for the MoodMap application.

## Brand Voice

**Tone:** Warm, supportive, non-judgmental, empowering
**Style:** Clear, conversational, compassionate
**Principles:**
- Use inclusive, person-first language
- Avoid clinical/medical terminology
- Be concise but compassionate
- Emphasize privacy and safety
- Empower users to make their own choices

---

## Main Screen Headers

### Check-in Tab
**Header:** "How are you feeling today?"
**Subtext:** "Take a moment to check in with yourself"

### Timeline Tab
**Header:** "Your Personal Timeline"
**Subtext:** "🔒 Private - Only visible to you"

### Community Tab
**Header:** "Community Support"
**Subtext:** "Connect with your neighborhood"

---

## Mood Check-in Flow

### Mood Selection
**Prompt:** "Select Your Mood"

**Mood Labels:**
- 😊 Happy
- 😌 Content
- 😐 Neutral
- 😰 Anxious
- 😢 Sad

### Optional Details
**Header:** "Add Details (Optional)"
**Note Placeholder:** "How are you feeling? (Optional)"
**Audio Button:** "🎤 Record 10s Audio Note"
**Submit Button:** "Submit Check-in"

### Success Message
"✓ Check-in recorded! View your [timeline](#)."

---

## Community Features

### Request Support Button
**Primary CTA:** "I Need a Hug 🤗"

### Request Form
**Header:** "Request Community Support"
**Description:** "Your request will be shared anonymously with verified community members nearby."

**Form Labels:**
- "Anonymous (always enabled for safety)"
- "Privacy Level:" [Neighborhood (recommended) / City-wide]
- "Notification Radius:" [1 mile / 3 miles (default) / 5 miles]

**Message Placeholder:** "Optional message (kept anonymous)..."

**Actions:**
- "Send Request" (Primary)
- "Cancel" (Secondary)

**Expiry Note:** "⏱️ Requests expire after 30 minutes"

### Success Message
"Your support request has been sent to nearby community members."

---

## Community Feed

### Feed Header
**Title:** "Nearby Support Requests"
**Description:** "Respond to community members who need support"

### Request Cards
**Location Format:** "📍 [Neighborhood Name]"
**Time Format:** "[X] min/hours ago"
**Expiry Format:** "⏱️ Expires in [X] minutes"

**Verified Badge:** "✓ Verified"

**CTA Button:** "Respond with Support"

**Report Link:** "Report inappropriate content"

### Empty State
**Icon:** 💙
**Message:** "No active support requests nearby right now."

---

## Response Modal

### Accept/Reject Flow
**Header:** "Respond to Support Request"
**Body:** "You're about to connect with someone who needs support. Please be kind and respectful."

**Actions:**
- "Accept & Connect" (Primary)
- "Not Now" (Secondary)

### Connection Success
"Connection made! The person has been notified. (In a real app, messaging would begin here.)"

### Push Notification to Requester
**Title:** "MoodMap"
**Message:** "Someone accepted your support request!"

---

## Safety & Privacy

### Safety Banner (Crisis Detection)
**Header:** "⚠️ Safety Notice:"
**Message:** "If you're in crisis, please contact: [988 Suicide & Crisis Lifeline] or [911]"
**CTA:** "Close"

### Crisis Resources Response
**Message:** "Your message suggests you may be in crisis. Please contact emergency services."

**Resources:**
- **Phone:** 988 Suicide & Crisis Lifeline
- **Text:** Text HOME to 741741 (Crisis Text Line)
- **Web:** https://988lifeline.org/

### Rate Limit Messages
**Mood Check-ins:** "Rate limit exceeded. Please try again later." (20/hour)
**Support Requests:** "You can only send 3 support requests per hour. Please try again later."

### Expired Request
"This support request has expired."

### Abuse Report Confirmation
"Thank you for reporting. Our team will review this content. (This is a simulation)"

---

## Timeline

### Empty Timeline
**Icon:** 📊
**Message:** "No check-ins yet. Start tracking your mood!"

### Heatmap
**Header:** "This Week's Mood Heatmap"

### Recent Check-ins
**Header:** "Recent Check-ins"
**Time Format:** "Just now" / "[X] min ago" / "[X] hours ago" / "[X] days ago"
**Audio Indicator:** "🎤 Audio note included"

---

## Error Messages

### Network Errors
"Network error. Please check your connection."

### Generic Error
"Failed to [action]. Please try again."

### Validation Errors
- "Please select a mood first"
- "Missing required fields: [field names]"
- "Request not found"

---

## Accessibility

### ARIA Labels
- Mood buttons: "Select [mood name] mood"
- Tab buttons: "Navigate to [tab name] tab"
- Audio button: "Record audio note" / "Stop recording"
- Respond button: "Respond to support request from [neighborhood]"

### Screen Reader Announcements
- "Mood check-in submitted successfully"
- "Support request created"
- "Loading nearby requests"
- "[X] new support requests available"

---

## Push Notification Copy

### Request Sent
**Title:** "MoodMap"
**Message:** "Your support request is now active"

### Request Accepted
**Title:** "MoodMap"
**Message:** "Someone accepted your support request!"

### Request Expiring Soon
**Title:** "MoodMap"
**Message:** "Your support request will expire in 5 minutes"

### New Nearby Request
**Title:** "MoodMap"
**Message:** "Someone nearby needs support"

---

## Privacy Policy References

**Check-in Screen:**
"Your mood data is private by default and only visible to you."

**Community Screen:**
"All support requests are anonymous to protect your privacy."

**Settings (Future):**
"You control who sees your data and when."

---

## Tone Examples

### ✅ Good Examples
- "Take a moment to check in with yourself"
- "Someone nearby needs support"
- "You're about to connect with someone who needs support"
- "Your request will be shared anonymously"

### ❌ Avoid
- "Diagnose your mental health"
- "Get help for your problems"
- "Fix your mood"
- "Mental health crisis"

---

## Localization Notes

For future internationalization:
- Keep strings under 80 characters where possible
- Avoid idioms and culturally-specific phrases
- Use clear, literal language
- Be mindful of emoji meanings across cultures
- Crisis resource phone numbers and URLs will vary by country

---

## Emoji Usage Guidelines

**Consistent Emoji:**
- 🔒 Privacy indicator
- 📍 Location indicator
- ⏱️ Time/expiry indicator
- 💙 Community/support indicator
- 🎤 Audio indicator
- ⚠️ Warning/safety indicator
- ✓ Verification badge
- 📊 Data/timeline indicator

**Mood Emoji:**
- 😊 Happy (value 5)
- 😌 Content (value 4)
- 😐 Neutral (value 3)
- 😰 Anxious (value 2)
- 😢 Sad (value 1)
- 🤗 Hug/support

---

## Version History

- **v1.0** (2024-11-06): Initial UI copy guidelines for MVP prototype

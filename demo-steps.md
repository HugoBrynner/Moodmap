# MoodMap Demo Steps

This document provides detailed step-by-step instructions for demonstrating all features of the MoodMap prototype.

## Prerequisites

Before starting the demo, ensure:

1. **Node.js 18+** is installed
2. **Dependencies installed:** Run `npm install express body-parser cors`
3. **Backend running:** `node mock-backend.js` (in one terminal)
4. **Frontend served:** `npx http-server prototype -p 8080` (in another terminal)
5. **Browser open:** Navigate to `http://localhost:8080`

Alternatively, use the single-server setup:
- Run `node mock-backend.js` only
- Navigate to `http://localhost:3000`

---

## Demo Flow Overview

1. **Emotional Check-in** (2-3 minutes)
2. **Personal Timeline & Heatmap** (1-2 minutes)
3. **Community Support Request** (2-3 minutes)
4. **Responding to Requests** (2-3 minutes)
5. **Safety Features** (1-2 minutes)

**Total Demo Time:** 10-15 minutes

---

## Part 1: Emotional Check-in

### Objective
Demonstrate the quick 1-3 tap mood tracking feature with optional details.

### Steps

1. **Open the app**
   - Navigate to `http://localhost:8080` (or `:3000`)
   - App opens on the "Check-in" tab by default
   - Header shows: "How are you feeling today?"

2. **Quick check-in (1 tap)**
   - Click any mood button (e.g., "😊 Happy")
   - Button highlights with purple border
   - Details section appears below

3. **Submit without details**
   - Click "Submit Check-in" immediately
   - Success message appears: "✓ Check-in recorded!"
   - Link to timeline is shown

### What to Highlight

✅ **Speed:** Check-in takes just 1 tap
✅ **Privacy:** Note says "Private - Only visible to you"
✅ **Simplicity:** No account required for demo

---

## Part 2: Adding Optional Details

### Objective
Show that users can add context to their check-ins.

### Steps

1. **Select another mood**
   - Choose "😰 Anxious" button
   - Details section appears again

2. **Add a text note**
   - Click in the note textarea
   - Type: "Feeling a bit overwhelmed with work today"
   - Shows character count (280 max)

3. **Simulate audio recording**
   - Click "🎤 Record 10s Audio Note" button
   - Button changes to "⏹️ Stop Recording"
   - Timer appears and counts up: "Recording: 3s / 10s"
   - Click again to stop, or let it auto-stop at 10 seconds
   - Button changes to "Audio Recorded (Xs)"

4. **Submit check-in**
   - Click "Submit Check-in"
   - Success message appears
   - All form fields reset

### What to Highlight

✅ **Optional:** Users can skip note/audio entirely
✅ **Flexible:** Text OR audio OR both
✅ **Time-bound:** Audio limited to 10 seconds (respects user time)

---

## Part 3: Personal Timeline & Heatmap

### Objective
Demonstrate private mood tracking and visualization.

### Steps

1. **Switch to Timeline tab**
   - Click "Timeline" tab in navigation
   - Tab highlights with purple underline

2. **View heatmap**
   - See "This Week's Mood Heatmap" section
   - Days of week shown (Mon-Sun)
   - Each day colored by mood:
     - 😊 Happy = Green
     - 😌 Content = Light green
     - 😐 Neutral = Yellow
     - 😰 Anxious = Orange
     - 😢 Sad = Red

3. **View recent check-ins**
   - Scroll down to "Recent Check-ins"
   - See list of mood entries
   - Each entry shows:
     - Large mood emoji
     - Mood label (e.g., "Anxious")
     - Time ago (e.g., "2 min ago")
     - Optional note text
     - 🎤 indicator if audio included

4. **Check privacy notice**
   - Top of timeline shows: "🔒 Private - Only visible to you"

### What to Highlight

✅ **Privacy:** Data is private by default
✅ **Visualization:** Heatmap shows patterns at a glance
✅ **History:** Recent check-ins preserved
✅ **Context:** Notes and audio indicators show detail

---

## Part 4: Community Support - Requesting Help

### Objective
Show how users can request community support anonymously.

### Steps

1. **Switch to Community tab**
   - Click "Community" tab in navigation

2. **View existing requests**
   - See "Nearby Support Requests" feed
   - 2-3 seed requests should be visible:
     - Location shown as neighborhood (e.g., "📍 Downtown")
     - Time ago displayed
     - Optional message visible
     - Some have "✓ Verified" badge
     - "Respond with Support" button on each

3. **Create new support request**
   - Click large "I Need a Hug 🤗" button at top
   - Button is replaced by request form

4. **Configure request**
   - **Anonymous checkbox:** Already checked and disabled (always on)
   - **Privacy Level:** Dropdown shows "Neighborhood (recommended)" selected
     - Other option: "City-wide"
   - **Notification Radius:** Dropdown shows "3 miles (default)" selected
     - Other options: 1 mile, 5 miles
   - **Optional Message:** Type "Having a rough day, could use someone to talk to"

5. **Submit request**
   - Click "Send Request" button
   - Alert appears: "Your support request has been sent to nearby community members."
   - Form closes, "I Need a Hug" button returns
   - (In real app, nearby users would receive push notification)

6. **View your request in feed**
   - Scroll down to feed
   - Your request may appear with other requests
   - Shows neighborhood, not exact location
   - Shows time: "Just now"
   - Expiry note: "⏱️ Expires in 29 minutes"

### What to Highlight

✅ **Anonymity:** No names or profiles shared
✅ **Privacy:** Neighborhood-level location only
✅ **Time-bound:** 30-minute expiry prevents stale requests
✅ **Control:** Users choose radius and privacy level
✅ **Optional message:** Can send with or without message

---

## Part 5: Responding to Support Requests

### Objective
Demonstrate how community members can offer support.

### Steps

1. **Browse support requests**
   - View the feed of nearby requests
   - Notice different neighborhoods
   - See verified badges on some requests
   - Read optional messages

2. **Respond to a request**
   - Click "Respond with Support" on any request card
   - Modal dialog appears

3. **Review connection modal**
   - Modal shows: "Respond to Support Request"
   - Message: "You're about to connect with someone who needs support. Please be kind and respectful."
   - Two buttons: "Accept & Connect" and "Not Now"

4. **Accept the request**
   - Click "Accept & Connect"
   - Modal closes
   - Alert appears: "Connection made! The person has been notified. (In a real app, messaging would begin here.)"
   - Request disappears from feed or updates status
   - (In real app, both users would be connected for chat)

5. **Reject option (optional)**
   - Click "Respond with Support" on another request
   - Click "Not Now" button
   - Modal closes
   - Request remains in feed for others

### What to Highlight

✅ **Clear intent:** Modal confirms action before connecting
✅ **Respectful:** Reminds users to be kind
✅ **Verification:** ✓ badges build trust
✅ **Opt-out:** "Not Now" allows users to decline

---

## Part 6: Safety Features

### Objective
Demonstrate crisis detection and safety controls.

### Steps

**A. Crisis Keyword Detection**

1. **Go to Check-in tab**
   - Click "Check-in" tab

2. **Select a mood**
   - Click any mood button (e.g., "😢 Sad")

3. **Enter crisis keyword**
   - In the note field, type: "I want to end it all"
   - Click "Submit Check-in"

4. **Observe crisis banner**
   - Red banner appears at top: "⚠️ Safety Notice:"
   - Shows: "If you're in crisis, please contact: 988 Suicide & Crisis Lifeline or 911"
   - Has "Close" button
   - Check-in is NOT submitted

5. **Close banner**
   - Click "Close" button on banner
   - Banner disappears
   - Form remains for user to try again

**B. Abuse Reporting**

1. **Go to Community tab**
   - Click "Community" tab

2. **View a support request**
   - Scroll to any request in feed
   - Notice small link at bottom: "Report inappropriate content"

3. **Click report link**
   - Click "Report inappropriate content"
   - Alert appears: "Thank you for reporting. Our team will review this content. (This is a simulation)"
   - In production, this would flag content for moderation

**C. Rate Limiting (Optional)**

1. **Test rapid check-ins**
   - Go to Check-in tab
   - Submit 20+ mood check-ins rapidly
   - After 20th within an hour, you'll see: "Rate limit exceeded. Please try again later."
   - Prevents spam and abuse

2. **Test rapid support requests**
   - Go to Community tab
   - Try to create 4+ support requests within an hour
   - After 3rd request: "You can only send 3 support requests per hour. Please try again later."

### What to Highlight

✅ **Proactive safety:** Crisis keywords detected automatically
✅ **Resources provided:** Crisis hotlines shown immediately
✅ **User empowerment:** Abuse reporting available on all content
✅ **Spam prevention:** Rate limits protect community

---

## Part 7: Additional Features to Note

### Request Expiry

**Demonstration:**
- Note that each request shows "⏱️ Expires in X minutes"
- After 30 minutes, requests automatically disappear from feed
- Prevents stale/outdated requests

### Verified Volunteers

**Demonstration:**
- Some requests have "✓ Verified" badge
- Builds trust in community
- Badge criteria:
  - Account age > 30 days
  - Positive response history
  - No abuse reports
  - Future: Safety training completed

### Seed Data

**Demonstration:**
- App loads with pre-populated data:
  - 3 mood check-ins for demo user
  - 3 nearby support requests
- Allows immediate interaction without setup

---

## Testing Checklist

Use this checklist when demonstrating:

### Check-in Flow
- [ ] Select mood (happy, content, neutral, anxious, sad)
- [ ] Submit without details (1-tap)
- [ ] Add text note
- [ ] Record simulated audio
- [ ] Submit with details
- [ ] View success message

### Timeline
- [ ] View heatmap with colors
- [ ] View recent check-ins list
- [ ] Verify privacy notice
- [ ] Check emoji display
- [ ] Check time ago format

### Community Request
- [ ] View existing requests
- [ ] Click "I Need a Hug"
- [ ] Configure privacy settings
- [ ] Add optional message
- [ ] Submit request
- [ ] See confirmation

### Community Response
- [ ] Browse requests
- [ ] Click "Respond with Support"
- [ ] View modal
- [ ] Accept connection
- [ ] See confirmation
- [ ] Test reject option

### Safety
- [ ] Trigger crisis keyword detection
- [ ] View safety banner
- [ ] Close banner
- [ ] Click abuse report link
- [ ] (Optional) Test rate limiting

---

## Common Demo Issues & Solutions

### Issue: Backend not responding
**Solution:** 
- Check if `node mock-backend.js` is running
- Verify port 3000 is not in use
- Check console for errors

### Issue: No seed data appearing
**Solution:**
- Ensure `seed-data.json` is in root directory
- Check backend console for "Seed data loaded" message
- Restart backend if needed

### Issue: Timeline is empty
**Solution:**
- Make sure you submitted at least one check-in
- Check that userId is consistent (stored in localStorage)
- Verify API calls in browser dev tools Network tab

### Issue: Community requests not showing
**Solution:**
- Check mock location coordinates in `app.js`
- Verify seed data has nearby requests
- Check expiry times in seed data (may need to update)

### Issue: CORS errors
**Solution:**
- Ensure backend has CORS enabled
- Check `mock-backend.js` has `app.use(cors())`
- Restart backend

---

## Customizing the Demo

### Update Seed Data

Edit `seed-data.json` to customize initial data:

```json
{
  "moods": [
    {
      "id": "mood-1",
      "userId": "user-demo",
      "mood": "happy",
      "value": 5,
      "note": "Your custom note",
      "timestamp": "2024-11-06T08:00:00.000Z",
      ...
    }
  ],
  "hugRequests": [...]
}
```

### Adjust Expiry Times

In `seed-data.json`, update `expiresAt` to future times:

```javascript
// Set expiry to 30 minutes from now
const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
```

### Change Location

In `prototype/app.js`, update mock location:

```javascript
let currentUser = {
    id: 'user-demo',
    location: { 
        lat: 40.7128,  // Your latitude
        lng: -74.0060  // Your longitude
    }
};
```

---

## Presentation Tips

1. **Start with the problem:** "People need simple ways to track their mental health and connect with their community."

2. **Emphasize privacy:** Repeatedly mention "private by default" and "anonymous community."

3. **Show, don't tell:** Walk through each feature rather than just describing it.

4. **Highlight 1-3 taps:** Emphasize the speed and simplicity throughout.

5. **Address safety proactively:** Don't wait for questions about crisis detection.

6. **Use realistic scenarios:** "Imagine you're having a rough day..." or "What if you see someone needs support?"

7. **Note it's a prototype:** Clarify this is an MVP for demonstration, not production-ready.

8. **Invite interaction:** Let audience members try features if presenting in person.

---

## Q&A Preparation

### Expected Questions

**Q: Is this a replacement for therapy?**
A: No, MoodMap is a wellness tool, not medical advice. We encourage professional help when needed.

**Q: How do you prevent abuse?**
A: Multiple layers: rate limiting, crisis keyword detection, abuse reporting, verified volunteers, and 30-minute request expiry.

**Q: What about user authentication?**
A: This prototype uses mock users. Production would have secure authentication and authorization.

**Q: How do you protect privacy?**
A: Privacy-by-default design, neighborhood-level location, anonymous community features, no sharing without consent.

**Q: Can I see who needs help?**
A: No, all support requests are anonymous. You only see neighborhood and optional message.

**Q: What happens after accepting a request?**
A: In production, users would be connected via in-app messaging with continued anonymity and safety controls.

**Q: How is this different from other mental health apps?**
A: Focus on community support, true anonymity, mobile-first design, and privacy-by-default.

**Q: Will you add more features?**
A: Potential future features: group support, professional resources, crisis intervention, community challenges.

---

## Next Steps After Demo

1. **Gather feedback:** What worked? What confused people?
2. **Test with users:** Have 5-10 people try it independently
3. **Iterate on design:** Improve based on feedback
4. **Add authentication:** Implement real user accounts
5. **Deploy backend:** Move from mock to production database
6. **Mobile apps:** Build native iOS/Android apps
7. **Professional resources:** Partner with crisis services

---

## Version History

- **v1.0** (2024-11-06): Initial demo steps for MVP prototype

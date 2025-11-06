# MoodMap

A mobile-first emotional check-in app with community support features.

## Overview

MoodMap is a prototype emotional wellness application that allows users to:
- Track their emotional state with 1-3 tap check-ins
- View personal heatmaps and timelines (private by default)
- Request community support through "I need a hug" feature
- Connect with nearby community members in a safe, privacy-focused way

## Features

### Emotional Check-ins
- Quick 1-3 tap emotional check-ins
- Optional short notes or simulated 10-second audio recordings
- Private personal timeline and heatmap visualization

### Community Support ("I Need a Hug")
- Send anonymous support requests to your neighborhood
- Neighborhood-level granularity (default)
- 30-minute expiry on requests
- Radius-based opt-in notifications
- Accept/reject flow for responders
- Safety banner and controls

### Privacy & Safety
- Privacy-by-default design
- Rate limits on requests
- Crisis-keyword detection (blocks broadcast, provides resources)
- Abuse reporting stub
- Verified volunteer flag system

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or npx available

### Installation

1. Clone this repository:
```bash
git clone https://github.com/HugoBrynner/Moodmap.git
cd Moodmap
```

2. Install dependencies:
```bash
npm install express body-parser cors
```

### Running the Application

#### Option 1: Two-Server Setup (Recommended for Development)

**Terminal 1 - Start the mock backend:**
```bash
node mock-backend.js
```
The backend will run on http://localhost:3000

**Terminal 2 - Serve the prototype:**
```bash
npx http-server prototype -p 8080
```
The prototype will be available at http://localhost:8080

#### Option 2: Single-Server Setup

The mock backend can also serve the static prototype files:
```bash
node mock-backend.js
```
Then open http://localhost:3000 in your browser

### Demo Steps

1. **Emotional Check-in:**
   - Open the app at http://localhost:8080 (or http://localhost:3000)
   - Tap one of the mood buttons (Happy, Sad, Anxious, etc.)
   - Optionally add a note or simulate an audio recording
   - View your personal timeline/heatmap

2. **Request Community Support:**
   - Navigate to the "Community" tab
   - Tap "I Need a Hug" button
   - Choose privacy settings (neighborhood granularity by default)
   - Submit your request
   - Request expires after 30 minutes automatically

3. **Respond to Support Requests:**
   - View the community feed of nearby hug requests
   - See anonymized requests with neighborhood-level location
   - Accept or reject a request
   - Connect safely with community members

4. **Privacy & Safety Features:**
   - All check-ins are private by default
   - Rate limits prevent spam (configurable in backend)
   - Crisis keywords are detected and trigger resource notifications
   - Abuse reporting available on all community content
   - Verified volunteer badges visible on trusted responders

## API Documentation

See `api-spec.yaml` for complete API documentation.

### Core Endpoints

- `POST /mood` - Submit emotional check-in
- `POST /hug-requests` - Create support request
- `GET /nearby-hug-requests` - Get nearby support requests
- `POST /hug-responses` - Respond to support request
- `POST /push/send` - Send push notification (mock)

## Documentation Files

- `api-spec.yaml` - Complete API specification
- `seed-data.json` - Sample data for testing
- `ui-copy.md` - UI text and messaging guidelines
- `push-hooks.md` - Push notification integration guide
- `privacy-safety.md` - Privacy and safety implementation details
- `demo-steps.md` - Detailed demo walkthrough

## Project Structure

```
Moodmap/
├── README.md              # This file
├── mock-backend.js        # Node/Express mock API server
├── seed-data.json         # Sample data for testing
├── api-spec.yaml          # API specification
├── ui-copy.md            # UI copy guidelines
├── push-hooks.md         # Push notification hooks
├── privacy-safety.md     # Privacy & safety documentation
├── demo-steps.md         # Detailed demo instructions
└── prototype/            # Mobile-first static prototype
    ├── index.html        # Main HTML structure
    ├── styles.css        # Mobile-first styles
    └── app.js            # Client-side JavaScript
```

## Technology Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express
- **Data Storage:** In-memory (mock)
- **Design Approach:** Mobile-first, progressive enhancement

## Development Notes

- This is a prototype/MVP for demonstration purposes
- Data is stored in memory and will reset when the server restarts
- Push notifications are simulated (see `push-hooks.md` for integration guide)
- For production deployment, replace mock backend with persistent storage
- Implement proper authentication and authorization for production use

## Testing

The prototype includes:
- Seed data for immediate testing
- Simulated user interactions
- Mock push notification endpoint
- Sample crisis keyword detection

## Contributing

This is a prototype project. For contribution guidelines, please contact the project maintainer.

## License

TBD

## Contact

For questions or feedback, please open an issue on GitHub.
# SuperBryn Voice Agent - Frontend

A modern React-based web interface for the SuperBryn AI voice assistant.

## Features

- **Voice Call Interface**: Real-time voice conversation with AI
- **Visual Avatar**: Beyond Presence avatar with lip-sync
- **Live Transcription**: See conversation in real-time
- **Tool Visualization**: Watch AI actions as they happen
- **Call Summaries**: View conversation summaries after each call

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **WebRTC**: LiveKit Client SDK

## Prerequisites

- Node.js 18+ or Bun
- Backend server running (see backend README)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

## Configuration

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

For production:
```env
VITE_API_URL=https://your-backend-url.com
```

## Running Locally

```bash
# Using bun
bun run dev

# Using npm
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
# Build
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Avatar/
│   │   │   └── AvatarView.tsx      # Avatar display with animations
│   │   ├── Conversation/
│   │   │   └── Transcript.tsx      # Message transcript
│   │   ├── Controls/
│   │   │   └── ControlBar.tsx      # Call controls
│   │   ├── Layout/
│   │   │   └── Header.tsx          # App header
│   │   ├── Summary/
│   │   │   └── SummaryModal.tsx    # Call summary modal
│   │   ├── Tools/
│   │   │   ├── ToolCard.tsx        # Individual tool display
│   │   │   └── ToolPanel.tsx       # Tool calls panel
│   │   └── ui/                     # shadcn/ui components
│   ├── hooks/
│   │   └── useVoiceAgent.ts        # Voice agent connection logic
│   ├── stores/
│   │   └── conversationStore.ts    # Zustand state management
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   └── utils.ts                # Utility functions
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## Key Components

### AvatarView
Displays the Beyond Presence video avatar with:
- Beautiful connecting animation during load
- Speaking/listening state indicators
- Fallback CSS avatar if video fails

### ControlBar
Call controls including:
- Start/End call buttons
- Mute toggle
- Call duration timer
- Connection status

### ToolPanel
Shows AI tool calls in real-time:
- Tool-specific icons and colors
- Running/completed states
- Timestamps

### Transcript
Live conversation transcript with:
- User and AI messages
- Response time metrics
- Auto-scroll to latest

## State Management

Uses Zustand for global state:

```typescript
interface ConversationState {
  callState: 'idle' | 'connecting' | 'active' | 'ending' | 'summary';
  avatarStatus: 'idle' | 'loading' | 'ready' | 'failed';
  messages: TranscriptMessage[];
  toolCalls: ToolCall[];
  summary: CallSummary | null;
  // ... actions
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_API_URL`: Your backend URL
4. Deploy

### Netlify

1. Push to GitHub
2. Create new site from Git
3. Build command: `bun run build`
4. Publish directory: `dist`
5. Add environment variables

### Manual

```bash
# Build
bun run build

# The dist/ folder contains static files
# Upload to any static hosting (S3, GitHub Pages, etc.)
```

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

Requires:
- WebRTC support
- Microphone access

## Known Limitations

1. **Microphone Permission**: Must allow microphone access for voice input
2. **Avatar Load Time**: Beyond Presence takes ~12-15 seconds on first connection
3. **Mobile**: Best experience on desktop browsers

## Troubleshooting

### "Microphone not working"
- Ensure browser has microphone permission
- Check that no other app is using the microphone
- Try refreshing the page

### "Avatar not loading"
- Beyond Presence may have cold start delay
- Check backend logs for avatar errors
- Verify Beyond Presence API key is valid

### "Connection failed"
- Verify backend is running
- Check VITE_API_URL is correct
- Ensure LiveKit credentials are valid

## License

MIT

# 🎙️ Echo Voice Agent - Frontend

A modern React frontend for the Echo AI Voice Agent, featuring real-time voice conversations with a visual avatar.

![React](https://img.shields.io/badge/React-18+-blue?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0+-purple?logo=vite&logoColor=white)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Conversation** | Real-time voice input with visual feedback |
| 👤 **Avatar Display** | Live video avatar with lip-sync |
| 📝 **Live Transcription** | See conversation as it happens |
| 🔧 **Tool Visualization** | See what actions the AI is taking |
| 📊 **Call Summary** | AI-generated summary after each call |
| 💰 **Cost Tracking** | Estimated costs per call |
| 📱 **Responsive Design** | Works on desktop and mobile |

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Voice** | LiveKit Client SDK |
| **State** | React Hooks + Zustand |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Backend server running (see backend README)

### Installation

```bash
# Clone the repository
git clone https://github.com/jay-arora31/echo-frontend
cd echo-frontend

# Install dependencies
bun install
# or
npm install

# Configure environment
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

### Run Development Server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── VoiceAgent.tsx  # Main voice agent component
│   │   ├── CallingScreen.tsx
│   │   ├── SummaryModal.tsx
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   │   ├── useVoiceAgent.ts
│   │   └── useAudioAnalyzer.ts
│   ├── lib/                # Utilities
│   │   ├── api.ts          # Backend API client
│   │   └── utils.ts
│   ├── stores/             # State management
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Static assets
├── index.html
├── vite.config.ts
└── package.json





## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |

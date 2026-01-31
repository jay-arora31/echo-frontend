import { create } from 'zustand';
import type { TranscriptMessage, ToolCall, CallState, CallSummary } from '@/types';
import type { TrackReference } from '@livekit/components-react';

export type AvatarStatus = 'idle' | 'loading' | 'ready' | 'failed';

interface PreWarmData {
  roomName: string;
  token: string;
  livekitUrl: string;
  timestamp: number;
}

interface ConversationState {
  // Call state
  callState: CallState;
  roomName: string | null;
  callStartTime: Date | null;

  // Pre-warm state (for faster connection)
  preWarmData: PreWarmData | null;
  isPreWarming: boolean;

  // Avatar state
  isSpeaking: boolean;
  isListening: boolean;
  avatarVideoTrack: TrackReference | null;
  avatarStatus: AvatarStatus;
  avatarMessage: string;

  // Transcript
  messages: TranscriptMessage[];

  // Streaming text (real-time typing effect)
  streamingText: string | null;

  // Tool calls
  toolCalls: ToolCall[];

  // Summary
  summary: CallSummary | null;

  // User info
  userId: string | null;
  userName: string | null;
  userPhone: string | null;

  // Actions
  setCallState: (state: CallState) => void;
  setRoomName: (name: string | null) => void;
  startCall: () => void;
  endCall: () => void;

  setIsSpeaking: (speaking: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setAvatarVideoTrack: (track: TrackReference | null) => void;
  setAvatarStatus: (status: AvatarStatus, message?: string) => void;

  addMessage: (role: 'user' | 'assistant', content: string, responseTime?: number) => void;
  clearMessages: () => void;

  // Streaming text actions
  setStreamingText: (text: string | null) => void;

  addToolCall: (tool: string) => void;
  updateToolCall: (tool: string, status: ToolCall['status'], result?: string) => void;
  clearToolCalls: () => void;

  setSummary: (summary: CallSummary | null) => void;

  setUser: (id: string | null, name: string | null, phone: string | null) => void;

  // Pre-warm actions
  setPreWarmData: (data: PreWarmData | null) => void;
  setIsPreWarming: (isPreWarming: boolean) => void;

  reset: () => void;
  softReset: () => void; // Reset for new call but keep pre-warm data
}

export const useConversationStore = create<ConversationState>((set) => ({
  // Initial state
  callState: 'idle',
  roomName: null,
  callStartTime: null,
  preWarmData: null,
  isPreWarming: false,
  isSpeaking: false,
  isListening: false,
  avatarVideoTrack: null,
  avatarStatus: 'idle',
  avatarMessage: '',
  messages: [],
  streamingText: null,
  toolCalls: [],
  summary: null,
  userId: null,
  userName: null,
  userPhone: null,

  // Actions
  setCallState: (callState) => set({ callState }),

  setRoomName: (roomName) => set({ roomName }),

  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),

  setIsListening: (isListening) => set({ isListening }),

  setAvatarVideoTrack: (avatarVideoTrack) => set({ avatarVideoTrack }),

  setAvatarStatus: (avatarStatus, message) => set({
    avatarStatus,
    avatarMessage: message || ''
  }),

  startCall: () => set({
    callState: 'connecting',
    callStartTime: new Date(),
    messages: [],
    streamingText: null,
    toolCalls: [],
    summary: null,
    isSpeaking: false,
    isListening: false,
    avatarVideoTrack: null,
    avatarStatus: 'loading',
    avatarMessage: 'Connecting...',
  }),

  endCall: () => set({
    callState: 'generating_summary',
    isSpeaking: false,
    isListening: false,
  }),

  addMessage: (role, content, responseTime) => {
    const message: TranscriptMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      responseTime: responseTime,
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  clearMessages: () => set({ messages: [] }),

  setStreamingText: (streamingText) => set({ streamingText }),

  addToolCall: (tool) => {
    const toolCall: ToolCall = {
      id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      tool,
      status: 'running',
      timestamp: new Date(),
    };
    set((state) => ({ toolCalls: [...state.toolCalls, toolCall] }));
  },

  updateToolCall: (tool, status, result) => {
    set((state) => ({
      toolCalls: state.toolCalls.map((tc) =>
        tc.tool === tool && tc.status === 'running'
          ? { ...tc, status, result }
          : tc
      ),
    }));
  },

  clearToolCalls: () => set({ toolCalls: [] }),

  setSummary: (summary) => set({ summary, callState: 'summary' }),

  setUser: (userId, userName, userPhone) => set({ userId, userName, userPhone }),

  // Pre-warm actions
  setPreWarmData: (preWarmData) => set({ preWarmData }),
  setIsPreWarming: (isPreWarming) => set({ isPreWarming }),

  reset: () => set({
    callState: 'idle',
    roomName: null,
    callStartTime: null,
    preWarmData: null,
    isPreWarming: false,
    isSpeaking: false,
    isListening: false,
    messages: [],
    streamingText: null,
    toolCalls: [],
    summary: null,
    userId: null,
    userName: null,
    userPhone: null,
    avatarVideoTrack: null,
    avatarStatus: 'idle',
    avatarMessage: '',
  }),

  // Soft reset - clears conversation but keeps pre-warm data for faster reconnect
  softReset: () => set({
    callState: 'idle',
    roomName: null,
    callStartTime: null,
    // Keep preWarmData and isPreWarming!
    isSpeaking: false,
    isListening: false,
    messages: [],
    streamingText: null,
    toolCalls: [],
    summary: null,
    avatarVideoTrack: null,
    avatarStatus: 'idle',
    avatarMessage: '',
  }),
}));

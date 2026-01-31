// Types for the voice agent application

export interface User {
  id: string;
  phone_number: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  formatted: string;
}

export interface CostBreakdown {
  deepgram_stt: number;
  cartesia_tts: number;
  openai_llm: number;
  beyond_presence_avatar: number;
  total: number;
  usage?: {
    stt_minutes: number;
    tts_characters: number;
    llm_input_tokens: number;
    llm_output_tokens: number;
    avatar_minutes: number;
  };
}

export interface CallSummary {
  id: string;
  user_id: string | null;
  session_id: string;
  summary: string;
  appointments_booked: Appointment[] | null;
  user_preferences: Record<string, unknown> | null;
  duration_seconds: number | null;
  created_at: string;
  cost?: CostBreakdown | null;
}

export interface RoomInfo {
  room_name: string;
  message: string;
}

export interface TokenInfo {
  token: string;
  room_name: string;
  livekit_url: string;
}

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseTime?: number; // Response time in seconds (for assistant messages)
}

export interface ToolCall {
  id: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
  result?: string;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type CallState = 'idle' | 'connecting' | 'active' | 'ending' | 'generating_summary' | 'summary';


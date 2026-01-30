// API client for backend communication

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Room API
export async function createRoom() {
  return fetchApi<{ room_name: string; message: string }>('/api/room/create', {
    method: 'POST',
  });
}

export async function getToken(roomName: string, participantName: string = 'user') {
  return fetchApi<{ token: string; room_name: string; livekit_url: string }>(
    '/api/room/token',
    {
      method: 'POST',
      body: JSON.stringify({ room_name: roomName, participant_name: participantName }),
    }
  );
}

// User API
export async function identifyUser(phoneNumber: string, name?: string) {
  return fetchApi<{
    id: string;
    phone_number: string;
    name: string | null;
  }>('/api/users/identify', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phoneNumber, name }),
  });
}

// Appointments API
export async function getAvailableSlots(daysAhead: number = 7) {
  return fetchApi<{ date: string; time: string; formatted: string }[]>(
    `/api/appointments/slots?days_ahead=${daysAhead}`
  );
}

export async function getUserAppointments(userId: string) {
  return fetchApi<
    {
      id: string;
      appointment_date: string;
      appointment_time: string;
      status: string;
      notes: string | null;
    }[]
  >(`/api/appointments/user/${userId}`);
}

// Summary API
export async function getSummary(sessionId: string) {
  return fetchApi<{
    id: string;
    summary: string;
    appointments_booked: unknown[];
    user_preferences: Record<string, unknown>;
    duration_seconds: number | null;
  }>(`/api/summaries/session/${sessionId}`);
}


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getToolIcon(tool: string): string {
  const icons: Record<string, string> = {
    identify_user: '🔍',
    fetch_slots: '📅',
    book_appointment: '✅',
    retrieve_appointments: '📋',
    cancel_appointment: '❌',
    modify_appointment: '✏️',
    end_conversation: '👋',
  };
  return icons[tool] || '🔧';
}

export function getToolLabel(tool: string): string {
  const labels: Record<string, string> = {
    identify_user: 'Identifying User',
    fetch_slots: 'Fetching Slots',
    book_appointment: 'Booking Appointment',
    retrieve_appointments: 'Retrieving Appointments',
    cancel_appointment: 'Cancelling Appointment',
    modify_appointment: 'Modifying Appointment',
    end_conversation: 'Ending Conversation',
  };
  return labels[tool] || tool;
}

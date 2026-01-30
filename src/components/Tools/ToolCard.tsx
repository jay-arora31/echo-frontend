import { CheckCircle2, Loader2, Phone, Calendar, Clock, User, Search, XCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolCall } from '@/types';

interface ToolCardProps {
  toolCall: ToolCall;
}

const toolConfig: Record<string, { icon: typeof Phone; color: string; bgColor: string; description: string }> = {
  identify_user: {
    icon: Phone,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Looking up user by phone number',
  },
  create_user: {
    icon: User,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Creating new user account',
  },
  get_availability: {
    icon: Search,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Checking available appointment slots',
  },
  fetch_slots: {
    icon: Search,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Fetching available slots',
  },
  book_appointment: {
    icon: Calendar,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Booking appointment',
  },
  cancel_appointment: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Cancelling appointment',
  },
  modify_appointment: {
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Modifying appointment',
  },
  retrieve_appointments: {
    icon: FileText,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Retrieving appointments',
  },
  get_user_appointments: {
    icon: FileText,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Fetching user appointments',
  },
  end_conversation: {
    icon: CheckCircle2,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    description: 'Ending conversation',
  },
};

const defaultConfig = {
  icon: Calendar,
  color: 'text-slate-500',
  bgColor: 'bg-slate-500/10',
  description: 'Processing...',
};

export function ToolCard({ toolCall }: ToolCardProps) {
  const config = toolConfig[toolCall.tool] || defaultConfig;
  const Icon = config.icon;
  const isRunning = toolCall.status === 'running';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-300',
        isRunning
          ? 'border-primary/50 bg-primary/5 shadow-sm'
          : 'border-border bg-card'
      )}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-lg', config.bgColor)}>
        {isRunning ? (
          <Loader2 className={cn('w-4 h-4 animate-spin', config.color)} />
        ) : (
          <Icon className={cn('w-4 h-4', config.color)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {toolCall.tool.replace(/_/g, ' ')}
          </span>
          {isRunning && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary text-primary-foreground animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {config.description}
        </p>
      </div>

      {/* Status & Time */}
      <div className="flex flex-col items-end gap-1">
        {toolCall.status === 'completed' && (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
        <span className="text-[10px] text-muted-foreground">
          {formatTime(toolCall.timestamp)}
        </span>
      </div>
    </div>
  );
}

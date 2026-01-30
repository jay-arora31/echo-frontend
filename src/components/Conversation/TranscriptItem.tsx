import { User, Bot, Zap } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TranscriptMessage } from '@/types';

interface TranscriptItemProps {
  message: TranscriptMessage;
}

export function TranscriptItem({ message }: TranscriptItemProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar with glow effect */}
      <Avatar className={cn(
        'w-9 h-9 ring-2 shadow-lg transition-all',
        isUser
          ? 'ring-primary/30 shadow-primary/20'
          : 'ring-violet-500/30 shadow-violet-500/20'
      )}>
        <AvatarFallback className={cn(
          'text-white font-medium',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/80'
            : 'bg-gradient-to-br from-violet-500 to-purple-600'
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message bubble */}
      <div
        className={cn(
          'flex-1 max-w-[85%]',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        {/* Sender label */}
        <div className={cn(
          'text-xs font-medium mb-1 px-1',
          isUser ? 'text-primary/70' : 'text-violet-600/70 dark:text-violet-400/70'
        )}>
          {isUser ? 'You' : 'SuperBryn AI'}
        </div>

        {/* Message content */}
        <div
          className={cn(
            'inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
            isUser
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
              : 'bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 text-foreground rounded-bl-md border border-slate-200/50 dark:border-slate-700/50'
          )}
        >
          {message.content}
        </div>

        {/* Metadata row */}
        <div className={cn(
          'mt-1.5 flex items-center gap-2 text-xs px-1',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-muted-foreground/70">{formatTime(message.timestamp)}</span>

          {/* Show response time for assistant messages with nice badge */}
          {!isUser && message.responseTime !== undefined && message.responseTime > 0 && (
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
              message.responseTime < 3
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : message.responseTime < 5
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            )}>
              <Zap className="w-2.5 h-2.5" />
              {message.responseTime}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

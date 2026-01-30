import { useEffect, useRef } from 'react';
import { User, Bot, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversationStore } from '@/stores/conversationStore';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

export function Transcript() {
  const { messages, streamingText } = useConversationStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Conversation
          {messages.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({messages.length} messages)
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-4">
          {messages.length === 0 && !streamingText ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <Bot className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No messages yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a call to begin the conversation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={cn(
                      'flex-1 max-w-[80%]',
                      message.role === 'user' ? 'text-right' : ''
                    )}
                  >
                    <div
                      className={cn(
                        'inline-block px-4 py-2 rounded-2xl',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-2 mt-1 text-xs text-muted-foreground',
                        message.role === 'user' ? 'justify-end' : ''
                      )}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {message.responseTime !== undefined && message.responseTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {message.responseTime}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming text indicator */}
              {streamingText && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="inline-block px-4 py-2 rounded-2xl bg-muted rounded-bl-md">
                      <p className="text-sm">{streamingText}</p>
                      <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Typing...
                    </p>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

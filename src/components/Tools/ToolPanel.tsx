import { Wrench, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolCard } from './ToolCard';
import { useConversationStore } from '@/stores/conversationStore';
import { Badge } from '@/components/ui/badge';

export function ToolPanel() {
  const { toolCalls } = useConversationStore();

  const runningCount = toolCalls.filter((t) => t.status === 'running').length;
  const completedCount = toolCalls.filter((t) => t.status === 'completed').length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {runningCount > 0 ? (
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            ) : (
              <Wrench className="w-4 h-4 text-muted-foreground" />
            )}
            <span>AI Actions</span>
          </div>
          {toolCalls.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{toolCalls.length}
            </Badge>
          )}
        </CardTitle>
        {runningCount > 0 && (
          <p className="text-xs text-muted-foreground">
            Processing {runningCount} action{runningCount > 1 ? 's' : ''}...
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {toolCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No actions yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tool calls will appear here during the conversation
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-2">
              {toolCalls.map((toolCall) => (
                <ToolCard key={toolCall.id} toolCall={toolCall} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

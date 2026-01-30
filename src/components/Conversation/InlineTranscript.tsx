import { useEffect, useRef } from 'react';
import { useConversationStore } from '@/stores/conversationStore';
import { cn } from '@/lib/utils';

/**
 * Inline transcript that appears below the avatar when conversation starts
 * Shows all messages in a scrollable container
 */
export function InlineTranscript() {
    const { messages } = useConversationStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Don't show anything until avatar starts speaking (first message)
    if (messages.length === 0) return null;

    return (
        <div className="w-full max-w-md mx-auto mt-4 animate-fade-in">
            {/* Transcript container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversation
                    </span>
                </div>

                {/* Messages - scrollable */}
                <div className="max-h-48 overflow-y-auto p-3 space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col gap-0.5",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}
                        >
                            {/* Speaker label */}
                            <span className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider px-1",
                                msg.role === 'user' ? "text-gray-400" : "text-[#4285F4]"
                            )}>
                                {msg.role === 'user' ? 'You' : 'Echo'}
                            </span>

                            {/* Message bubble */}
                            <div className={cn(
                                "max-w-[85%] px-3 py-2 rounded-xl text-sm",
                                msg.role === 'user'
                                    ? "bg-gray-100 text-gray-700 rounded-tr-sm"
                                    : "bg-[#E8F0FE] text-gray-800 rounded-tl-sm"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Footer with message count */}
                <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
}

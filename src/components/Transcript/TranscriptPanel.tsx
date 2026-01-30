import { useConversationStore } from '@/stores/conversationStore';
import { X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface TranscriptPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TranscriptPanel({ isOpen, onClose }: TranscriptPanelProps) {
    const { messages } = useConversationStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div className={cn(
                "fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50",
                "transform transition-transform duration-300 ease-out",
                "flex flex-col border-l border-gray-100",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#4285F4]" />
                        <h2 className="font-semibold text-gray-800">Transcript</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col gap-1 animate-fade-in",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}
                        >
                            {/* Label */}
                            <span className={cn(
                                "text-xs font-medium uppercase tracking-wider",
                                msg.role === 'user' ? "text-gray-400" : "text-[#4285F4]"
                            )}>
                                {msg.role === 'user' ? 'You' : 'Echo'}
                            </span>

                            {/* Bubble */}
                            <div className={cn(
                                "max-w-[90%] px-4 py-3 rounded-2xl",
                                msg.role === 'user'
                                    ? "bg-gray-100 text-gray-800 rounded-tr-md"
                                    : "bg-[#E8F0FE] text-gray-800 rounded-tl-md"
                            )}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>

                            {/* Timestamp */}
                            <span className="text-[10px] text-gray-300 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400 text-center">
                        {messages.length} message{messages.length !== 1 ? 's' : ''} in this conversation
                    </p>
                </div>
            </div>
        </>
    );
}

import { useEffect, useState, useRef } from 'react';
import { useConversationStore } from '@/stores/conversationStore';
import { cn } from '@/lib/utils';

export function LiveCaptions() {
    const { messages } = useConversationStore();
    const [displayText, setDisplayText] = useState('');
    const [fullText, setFullText] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [speaker, setSpeaker] = useState<'user' | 'ai'>('ai');
    const [isTyping, setIsTyping] = useState(false);
    const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastMessageIdRef = useRef<string>('');

    // Typewriter effect - FAST speed (15ms/char)
    useEffect(() => {
        if (fullText && isTyping) {
            let currentIndex = 0;
            setDisplayText('');

            const typeChar = () => {
                if (currentIndex < fullText.length) {
                    setDisplayText(fullText.slice(0, currentIndex + 1));
                    currentIndex++;
                    // Fast typing: 15ms for AI, 10ms for user
                    const speed = speaker === 'ai' ? 15 : 10;
                    typeTimeoutRef.current = setTimeout(typeChar, speed);
                } else {
                    setIsTyping(false);
                }
            };

            typeChar();

            return () => {
                if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
            };
        }
    }, [fullText, speaker]);

    // Handle new messages
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            const msgId = `${lastMsg.role}-${lastMsg.content.substring(0, 20)}`;

            // Only process if this is a new message
            if (msgId !== lastMessageIdRef.current && lastMsg.content) {
                lastMessageIdRef.current = msgId;
                setFullText(lastMsg.content);
                setSpeaker(lastMsg.role === 'user' ? 'user' : 'ai');
                setIsVisible(true);
                setIsTyping(true);

                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

                // Hide after typing would finish + buffer
                const typingTime = lastMsg.content.length * 15 + 3000;
                hideTimeoutRef.current = setTimeout(() => {
                    setIsVisible(false);
                    setFullText('');
                    setDisplayText('');
                }, typingTime);
            }
        }
    }, [messages]);

    // Don't show anything if no text
    if (!isVisible || !displayText) return null;

    return (
        <div className={cn(
            "mt-6 text-center max-w-xl mx-auto transition-all duration-300",
            "opacity-100 translate-y-0"
        )}>
            <p className={cn(
                "text-lg leading-relaxed",
                speaker === 'user' ? "text-gray-500" : "text-gray-700"
            )}>
                <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider mr-2",
                    speaker === 'user' ? "text-gray-400" : "text-[#4285F4]"
                )}>
                    {speaker === 'user' ? 'You:' : 'Echo:'}
                </span>
                {displayText}
                {/* Typing cursor - only shows while actively typing text */}
                {isTyping && displayText && (
                    <span className="inline-block w-0.5 h-5 bg-[#4285F4] ml-0.5 animate-pulse" />
                )}
            </p>
        </div>
    );
}

import { useConversationStore } from '@/stores/conversationStore';
import { CheckCircle, Clock, MessageSquare, RefreshCw, Home, Sparkles, DollarSign, Mic, Volume2, Brain, User } from 'lucide-react';

interface SummaryPageProps {
    isGenerating: boolean;
    onNewCall: () => void;
    onClose: () => void;
}

export function SummaryPage({ isGenerating, onNewCall, onClose }: SummaryPageProps) {
    const { summary, messages, callStartTime, toolCalls } = useConversationStore();

    // Calculate stats
    const callDuration = callStartTime
        ? Math.floor((Date.now() - callStartTime.getTime()) / 1000)
        : 0;
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const messageCount = messages.length;
    const completedTools = toolCalls.filter(tc => tc.status === 'completed');

    if (isGenerating) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-8 animate-fade-in">
                    {/* Google-style spinner */}
                    <div className="relative w-16 h-16">
                        <svg className="animate-spin" viewBox="0 0 50 50">
                            <circle
                                className="stroke-[#4285F4]"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                cx="25"
                                cy="25"
                                r="20"
                                strokeDasharray="80, 200"
                                strokeDashoffset="0"
                            />
                        </svg>
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-medium text-[#202124]">
                            Generating summary...
                        </h1>
                        <p className="text-sm text-[#5f6368]">
                            Analyzing your conversation
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen max-h-screen w-full bg-[#f8f9fa] overflow-y-auto">
            {/* Top bar - Google style */}
            <div className="bg-white border-b border-[#dadce0] sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-[#1a73e8]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-medium text-[#202124]">Call completed</h1>
                            <p className="text-sm text-[#5f6368]">Your conversation summary</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 border border-[#dadce0]">
                        <div className="flex items-center gap-2 text-[#5f6368] text-xs font-medium mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            DURATION
                        </div>
                        <p className="text-2xl font-medium text-[#202124]">{durationString}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-[#dadce0]">
                        <div className="flex items-center gap-2 text-[#5f6368] text-xs font-medium mb-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            MESSAGES
                        </div>
                        <p className="text-2xl font-medium text-[#202124]">{messageCount}</p>
                    </div>
                </div>

                {/* Summary card */}
                <div className="bg-white rounded-lg p-5 border border-[#dadce0]">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                        <span className="text-sm font-medium text-[#1a73e8]">AI Summary</span>
                    </div>
                    <p className="text-[#202124] leading-relaxed">
                        {summary?.summary || 'Call completed successfully.'}
                    </p>
                </div>

                {/* Actions completed */}
                {completedTools.length > 0 && (
                    <div className="bg-white rounded-lg p-5 border border-[#dadce0]">
                        <div className="text-xs font-medium text-[#5f6368] mb-3">ACTIONS COMPLETED</div>
                        <div className="space-y-2">
                            {completedTools.map((tool, i) => (
                                <div key={i} className="flex items-center gap-2 text-[#202124]">
                                    <CheckCircle className="w-4 h-4 text-[#34a853] flex-shrink-0" />
                                    <span className="capitalize text-sm">{tool.tool.replace(/_/g, ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cost breakdown */}
                {summary?.cost && (
                    <div className="bg-white rounded-lg border border-[#dadce0] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#dadce0] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[#5f6368]" />
                                <span className="text-xs font-medium text-[#5f6368]">ESTIMATED COST</span>
                            </div>
                            <span className="text-lg font-medium text-[#1a73e8]">
                                ${summary.cost.total.toFixed(4)}
                            </span>
                        </div>
                        <div className="px-5 py-3 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-[#5f6368]">
                                    <Mic className="w-4 h-4" />
                                    Deepgram (STT)
                                </div>
                                <span className="font-mono text-[#202124]">${summary.cost.deepgram_stt.toFixed(4)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-[#5f6368]">
                                    <Volume2 className="w-4 h-4" />
                                    Cartesia (TTS)
                                </div>
                                <span className="font-mono text-[#202124]">${summary.cost.cartesia_tts.toFixed(4)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-[#5f6368]">
                                    <Brain className="w-4 h-4" />
                                    OpenAI (LLM)
                                </div>
                                <span className="font-mono text-[#202124]">${summary.cost.openai_llm.toFixed(4)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-[#5f6368]">
                                    <User className="w-4 h-4" />
                                    Avatar
                                </div>
                                <span className="font-mono text-[#202124]">${summary.cost.beyond_presence_avatar.toFixed(4)}</span>
                            </div>
                            <div className="pt-3 mt-1 border-t border-[#dadce0] flex items-center justify-between text-sm font-medium">
                                <span className="text-[#202124]">Total</span>
                                <span className="font-mono text-[#202124]">${summary.cost.total.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action buttons - Google style */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#dadce0] bg-white text-[#1a73e8] font-medium text-sm hover:bg-[#f8f9fa] transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </button>
                    <button
                        onClick={onNewCall}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1a73e8] text-white font-medium text-sm hover:bg-[#1557b0] transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        New Call
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useConversationStore } from '@/stores/conversationStore';
import { cn } from '@/lib/utils';
import { Calendar, User, CheckCircle, Clock, X } from 'lucide-react';

export function ContextCards() {
    const toolCalls = useConversationStore((state) => state.toolCalls);
    const [activeCard, setActiveCard] = useState<any | null>(null);

    // Auto-show last completed tool call
    useEffect(() => {
        if (toolCalls.length > 0) {
            const lastTool = toolCalls[toolCalls.length - 1];
            // Only show if recent or if it's a major action
            if (lastTool.status === 'completed' || lastTool.status === 'running') {
                setActiveCard(lastTool);

                // Auto-hide after 8 seconds unless it's a booking
                if (lastTool.status === 'completed' && lastTool.tool !== 'book_appointment') {
                    const timer = setTimeout(() => setActiveCard(null), 8000);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [toolCalls.length, toolCalls[toolCalls.length - 1]?.status]);

    if (!activeCard) return null;

    return (
        <div className="fixed bottom-24 right-8 z-40 w-80 animate-slide-up">
            {/* Google-style Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", getIconColor(activeCard.tool))}>
                            {getToolIcon(activeCard.tool)}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">
                                {getToolTitle(activeCard.tool)}
                            </h3>
                            <p className="text-xs text-gray-400">
                                {activeCard.status === 'running' ? 'Processing...' : 'Completed'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveCard(null)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="text-sm text-gray-600">
                    {renderToolContent(activeCard)}
                </div>

            </div>
        </div>
    );
}

// Helpers - Google brand colors
function getToolIcon(tool: string) {
    switch (tool) {
        case 'book_appointment': return <Calendar className="w-4 h-4 text-white" />;
        case 'modify_appointment': return <Clock className="w-4 h-4 text-white" />;
        case 'cancel_appointment': return <Clock className="w-4 h-4 text-white" />;
        case 'identify_user': return <User className="w-4 h-4 text-white" />;
        default: return <CheckCircle className="w-4 h-4 text-white" />;
    }
}

function getIconColor(tool: string) {
    switch (tool) {
        case 'book_appointment': return 'bg-[#4285F4]'; // Google Blue
        case 'modify_appointment': return 'bg-[#FBBC04]'; // Google Yellow
        case 'cancel_appointment': return 'bg-[#EA4335]'; // Google Red
        case 'identify_user': return 'bg-[#34A853]'; // Google Green
        default: return 'bg-gray-400';
    }
}

function getToolTitle(tool: string) {
    switch (tool) {
        case 'book_appointment': return 'Booking Confirmation';
        case 'modify_appointment': return 'Appointment Update';
        case 'cancel_appointment': return 'Cancellation';
        case 'identify_user': return 'User Verified';
        case 'get_availability': return 'Checking Schedule';
        case 'get_appointments': return 'Reviewing Appointments';
        default: return 'System Action';
    }
}

function renderToolContent(tool: any) {
    // Attempt to parse args if string
    let args = tool.args;
    if (typeof args === 'string') {
        try { args = JSON.parse(args); } catch (e) { }
    }

    switch (tool.tool) {
        case 'book_appointment':
            // Result format: "Friday, January 31 at 2:00 PM"
            let displayDate = 'Confirmed';
            let displayTime = 'Confirmed';

            if (tool.result) {
                const parts = tool.result.split(' at ');
                if (parts.length === 2) {
                    displayDate = parts[0]; // "Friday, January 31"
                    displayTime = parts[1]; // "2:00 PM"
                }
            }

            return (
                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#E8F0FE] p-3 rounded-lg">
                        <span className="text-xs text-gray-500">Date</span>
                        <span className="font-medium text-gray-800">{displayDate}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#E8F0FE] p-3 rounded-lg">
                        <span className="text-xs text-gray-500">Time</span>
                        <span className="font-medium text-gray-800">{displayTime}</span>
                    </div>
                </div>
            );
        case 'identify_user':
            return (
                <div className="flex items-center gap-2 bg-[#E6F4EA] p-3 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-[#34A853]" />
                    <span className="text-gray-700">Phone Number Verified</span>
                </div>
            )
        default:
            return <p className="text-sm text-gray-500 italic">Action executed successfully.</p>;
    }
}

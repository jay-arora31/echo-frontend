import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingControlBarProps {
    onEndCall: () => void;
    isListening?: boolean;
    onToggleMic?: () => void;
    micEnabled?: boolean;
}

export function FloatingControlBar({
    onEndCall,
    isListening: _isListening,
    micEnabled = true,
    onToggleMic,
}: FloatingControlBarProps) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
            {/* Clean pill control bar */}
            <div className="flex items-center gap-3 p-2 rounded-full bg-white shadow-xl border border-gray-100">

                {/* Mic Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full h-12 w-12 transition-all duration-300",
                        micEnabled
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : "bg-red-100 hover:bg-red-200 text-[#EA4335]"
                    )}
                    onClick={onToggleMic}
                    title={micEnabled ? "Mute" : "Unmute"}
                >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                {/* End Call */}
                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-12 w-12 bg-[#EA4335] hover:bg-[#D93025] shadow-lg shadow-red-200 hover:scale-105 transition-all"
                    onClick={onEndCall}
                    title="End call"
                >
                    <PhoneOff className="h-5 w-5 text-white" />
                </Button>
            </div>
        </div>
    );
}

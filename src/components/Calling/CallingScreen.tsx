import { useEffect, useRef } from 'react';
import { Phone, X } from 'lucide-react';
import { useConnectingSound } from '@/hooks/useConnectingSound';

interface CallingScreenProps {
    isVisible: boolean;
    onCancel: () => void;
}

export function CallingScreen({ isVisible, onCancel }: CallingScreenProps) {
    const { startRingtone, stopRingtone } = useConnectingSound();
    const hasStartedRef = useRef(false);

    // Start/stop ringtone based on visibility
    useEffect(() => {
        if (isVisible && !hasStartedRef.current) {
            hasStartedRef.current = true;
            startRingtone();
        } else if (!isVisible && hasStartedRef.current) {
            hasStartedRef.current = false;
            stopRingtone();
        }

        return () => {
            if (hasStartedRef.current) {
                hasStartedRef.current = false;
                stopRingtone();
            }
        };
    }, [isVisible, startRingtone, stopRingtone]);

    if (!isVisible) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white">
            <div className="flex flex-col items-center gap-8 animate-fade-in">

                {/* Pulsing Rings + Avatar */}
                <div className="relative flex items-center justify-center">
                    {/* Ring 1 - Outermost */}
                    <div className="absolute w-64 h-64 rounded-full border-2 border-[#4285F4]/20 animate-ping-slow" />

                    {/* Ring 2 */}
                    <div
                        className="absolute w-48 h-48 rounded-full border-2 border-[#4285F4]/30 animate-ping-slow"
                        style={{ animationDelay: '0.3s' }}
                    />

                    {/* Ring 3 */}
                    <div
                        className="absolute w-32 h-32 rounded-full border-2 border-[#4285F4]/40 animate-ping-slow"
                        style={{ animationDelay: '0.6s' }}
                    />

                    {/* Center Avatar */}
                    <div className="relative z-10 w-24 h-24 rounded-full bg-[#4285F4] flex items-center justify-center shadow-xl shadow-blue-200 animate-bounce-slow">
                        <Phone className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Calling Echo<span className="animate-pulse">...</span>
                    </h2>
                    <p className="text-sm text-gray-500">
                        Connecting to your AI assistant
                    </p>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-[#EA4335] text-white font-medium shadow-lg shadow-red-200 hover:bg-[#D93025] hover:scale-105 active:scale-95 transition-all"
                >
                    <X className="w-5 h-5" />
                    Cancel
                </button>

                {/* Subtle hint */}
                <p className="mt-8 text-xs text-gray-400 animate-pulse">
                    Please wait while we establish connection...
                </p>
            </div>
        </div>
    );
}

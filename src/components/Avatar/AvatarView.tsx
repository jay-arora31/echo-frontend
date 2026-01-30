import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { TrackReference } from "@livekit/components-react";
import { VideoTrack } from "@livekit/components-react";

interface AvatarViewProps {
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  avatarVideoTrack: TrackReference | null;
}

export function AvatarView({ isConnected, isSpeaking, isListening, avatarVideoTrack }: AvatarViewProps) {
  return (
    <div className="relative flex items-center justify-center">

      {/* Pulsing Aura (when speaking) */}
      {isSpeaking && (
        <div className="absolute w-[340px] h-[340px] rounded-[70px] bg-[#4285F4]/10 animate-pulse-ring" />
      )}

      {/* The Avatar Container - Larger, cleaner */}
      <div className={cn(
        "relative w-[300px] h-[300px] rounded-[60px] overflow-hidden",
        "bg-white shadow-2xl transition-all duration-500",
        "border-4",
        // Status via ring color only
        isSpeaking
          ? "border-[#4285F4] shadow-[0_0_60px_rgba(66,133,244,0.25)]"
          : isListening
            ? "border-[#34A853] shadow-[0_0_40px_rgba(52,168,83,0.15)]"
            : isConnected
              ? "border-gray-200"
              : "border-gray-100"
      )}>

        {/* Avatar Video or Fallback */}
        {avatarVideoTrack ? (
          <VideoTrack
            trackRef={avatarVideoTrack}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            {isConnected ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#E8F0FE] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#4285F4] animate-spin" />
                </div>
                <p className="text-sm font-medium text-gray-400">Loading avatar...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <p className="text-xs text-gray-400">Connecting...</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

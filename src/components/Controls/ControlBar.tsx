import { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConversationStore } from '@/stores/conversationStore';
import { formatDuration } from '@/lib/utils';

interface ControlBarProps {
  onStartCall: () => void;
  onEndCall: () => void;
}

export function ControlBar({ onStartCall, onEndCall }: ControlBarProps) {
  const { callState, callStartTime, avatarStatus, avatarMessage } = useConversationStore();
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  // Track call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (callState === 'active' && callStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
        setDuration(elapsed);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => clearInterval(interval);
  }, [callState, callStartTime]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const isIdle = callState === 'idle';
  const isConnecting = callState === 'connecting';
  const isLoadingAvatar = avatarStatus === 'loading';
  const isActive = callState === 'active';
  const isEnding = callState === 'ending';

  return (
    <div className="bg-card border-t px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Duration */}
        <div className="w-32">
          {(isActive || isEnding) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm">{formatDuration(duration)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {isIdle && (
            <Button size="lg" onClick={onStartCall} className="gap-2">
              <Phone className="w-5 h-5" />
              Start Call
            </Button>
          )}

          {(isConnecting || isLoadingAvatar) && (
            <Button size="lg" disabled className="gap-2 min-w-[180px]">
              <Loader2 className="w-5 h-5 animate-spin" />
              {avatarMessage || 'Connecting...'}
            </Button>
          )}

          {isActive && (
            <>
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="lg"
                onClick={toggleMute}
                className="gap-2"
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Mute
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={onEndCall}
                className="gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </Button>
            </>
          )}

          {isEnding && (
            <Button size="lg" disabled className="gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Ending...
            </Button>
          )}
        </div>

        {/* Spacer */}
        <div className="w-32" />
      </div>
    </div>
  );
}

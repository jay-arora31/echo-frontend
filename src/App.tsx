import { useEffect, useRef } from 'react';
import { Header } from '@/components/Layout/Header';
import { AvatarView } from '@/components/Avatar/AvatarView';
import { ContextCards } from '@/components/Tools/ContextCards';
import { InlineTranscript } from '@/components/Conversation/InlineTranscript';
import { FloatingControlBar } from '@/components/Controls/FloatingControlBar';
import { SummaryModal } from '@/components/Summary/SummaryModal';
import { SummaryLoader } from '@/components/Summary/SummaryLoader';
import { CallingScreen } from '@/components/Calling/CallingScreen';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useConversationStore } from '@/stores/conversationStore';
import { useConnectingSound } from '@/hooks/useConnectingSound';
import { Phone, Sparkles } from 'lucide-react';

export default function App() {
  const { startCall, endCall, startNewCall } = useVoiceAgent();
  const { callState, isSpeaking, isListening, reset, avatarVideoTrack } = useConversationStore();
  const { playConnectedChime } = useConnectingSound();

  const prevCallStateRef = useRef(callState);

  // Play connected chime when transitioning from connecting to active
  useEffect(() => {
    if (prevCallStateRef.current === 'connecting' && callState === 'active') {
      playConnectedChime();
    }
    prevCallStateRef.current = callState;
  }, [callState, playConnectedChime]);

  const isIdle = callState === 'idle';
  const isConnecting = callState === 'connecting';
  const isActive = callState === 'active';
  const isGeneratingSummary = callState === 'generating_summary';
  const showSummary = callState === 'summary';

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-white">
      <Header />

      <main className="flex-1 relative flex flex-col items-center justify-center p-6 hero-gradient">

        {isIdle ? (
          // WELCOME STATE
          <div className="text-center animate-fade-in flex flex-col items-center gap-8">
            <div className="relative group cursor-pointer" onClick={startCall}>
              <div className="absolute inset-0 bg-[#4285F4]/20 blur-3xl rounded-full group-hover:bg-[#4285F4]/30 transition-all duration-500 scale-150" />
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#4285F4] to-[#1A73E8] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <Phone className="w-16 h-16 text-white" />
              </div>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#4285F4]">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Assistant</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Hello, there.
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed">
                I'm Echo, your intelligent appointment assistant.
              </p>
            </div>

            <button
              onClick={startCall}
              className="mt-4 px-10 py-4 rounded-full bg-[#4285F4] text-white font-semibold text-lg hover:bg-[#1A73E8] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
              Start Conversation
            </button>
          </div>
        ) : isActive ? (
          // ACTIVE CALL - Fixed avatar layout
          <>
            {/* Fixed Avatar Area - always at top center */}
            <div className="flex flex-col items-center pt-4">
              <AvatarView
                isConnected={true}
                isSpeaking={isSpeaking}
                isListening={isListening}
                avatarVideoTrack={avatarVideoTrack as any}
              />
            </div>

            {/* Content area below avatar - fixed height scrollable */}
            <div className="flex-1 w-full flex flex-col items-center overflow-y-auto pb-24">
              {/* Inline transcript - appears when avatar starts speaking */}
              <InlineTranscript />

              {/* Tool action cards */}
              <ContextCards />
            </div>

            {/* Minimal control bar */}
            <FloatingControlBar
              onEndCall={endCall}
              isListening={isListening}
            />
          </>
        ) : null}
      </main>

      {/* Calling Animation */}
      <CallingScreen isVisible={isConnecting} onCancel={reset} />

      {/* Summary Loader */}
      <SummaryLoader isVisible={isGeneratingSummary} />

      {/* Summary Modal */}
      <SummaryModal
        open={showSummary}
        onClose={() => reset()}
        onNewCall={startNewCall}
      />
    </div>
  );
}

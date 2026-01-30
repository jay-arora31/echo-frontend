import { Phone, PhoneOff } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationStore';

export function Header() {
  const { callState } = useConversationStore();

  const isConnected = callState === 'active';
  const isConnecting = callState === 'connecting';

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Echo</h1>
            <p className="text-xs text-gray-500">AI Appointment Assistant</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F4EA] text-[#34A853]">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
            </div>
          ) : isConnecting ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F0FE] text-[#4285F4]">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500">
              <PhoneOff className="w-4 h-4" />
              <span className="text-sm font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

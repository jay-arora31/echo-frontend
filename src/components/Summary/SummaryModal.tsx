import { Calendar, Clock, MessageSquare, Lightbulb, RotateCcw, CheckCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConversationStore } from '@/stores/conversationStore';
import { formatDuration } from '@/lib/utils';

interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  onNewCall: () => void;
}

export function SummaryModal({ open, onClose, onNewCall }: SummaryModalProps) {
  const { summary, messages, callStartTime, toolCalls } = useConversationStore();

  // Calculate duration
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    if (open && !endTime) {
      setTimeout(() => setEndTime(Date.now()), 0);
    } else if (!open) {
      setTimeout(() => setEndTime(null), 0);
    }
  }, [open, endTime]);

  const duration = useMemo(() => {
    if (!callStartTime || !endTime) return 0;
    return Math.floor((endTime - callStartTime.getTime()) / 1000);
  }, [callStartTime, endTime]);

  // Get completed tool calls
  const completedTools = toolCalls.filter(tc => tc.status === 'completed');
  const bookedAppointments = completedTools.filter(tc => tc.tool === 'book_appointment');
  const cancelledAppointments = completedTools.filter(tc => tc.tool === 'cancel_appointment');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="p-2 rounded-full bg-[#E8F0FE]">
              <CheckCircle className="w-5 h-5 text-[#4285F4]" />
            </div>
            Call Completed
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Here's a summary of your conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stats - Google style cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                {formatDuration(duration)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium">Messages</span>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                {messages.length}
              </p>
            </div>
          </div>

          {/* Appointments Booked */}
          {bookedAppointments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#34A853]" />
                <h3 className="font-medium text-sm text-gray-700">Appointments Booked</h3>
              </div>
              <div className="space-y-2">
                {bookedAppointments.map((apt, idx) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-[#E6F4EA] border border-[#34A853]/20"
                  >
                    <p className="text-sm font-medium text-[#34A853]">
                      ✓ Appointment #{idx + 1} booked successfully
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Cancelled */}
          {cancelledAppointments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#EA4335]" />
                <h3 className="font-medium text-sm text-gray-700">Appointments Cancelled</h3>
              </div>
              <div className="space-y-2">
                {cancelledAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-red-50 border border-red-100"
                  >
                    <p className="text-sm font-medium text-[#EA4335]">
                      Appointment cancelled
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary Text */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[#4285F4]" />
              <h3 className="font-medium text-sm text-gray-700">Summary</h3>
            </div>
            <div className="p-4 rounded-xl bg-[#E8F0FE] border border-[#4285F4]/10">
              <p className="text-sm text-gray-700 leading-relaxed">
                {summary?.summary || 'Your conversation with Echo has concluded. Thank you for using our service!'}
              </p>
            </div>
          </div>

          {/* Preferences */}
          {summary?.user_preferences && Object.keys(summary.user_preferences).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[#FBBC04]" />
                <h3 className="font-medium text-sm text-gray-700">Preferences Noted</h3>
              </div>
              <div className="space-y-1">
                {Object.entries(summary.user_preferences).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-[#FEF7E0] rounded-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC04]" />
                    <span className="capitalize">{key.replace(/_/g, ' ')}: {String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Close
          </Button>
          <Button
            onClick={onNewCall}
            className="gap-2 bg-[#4285F4] hover:bg-[#1A73E8] text-white"
          >
            <RotateCcw className="w-4 h-4" />
            New Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

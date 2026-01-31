import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track, type RemoteParticipant, type RemoteTrackPublication } from 'livekit-client';
import { useConversationStore } from '@/stores/conversationStore';
import { createRoom, getToken, prewarmRoom } from '@/lib/api';
import type { CallSummary } from '@/types';

// Pre-warm data expires after 80 seconds (backend keeps rooms for 90s)
const PRE_WARM_EXPIRY_MS = 80000;

export function useVoiceAgent() {
  const [room, setRoom] = useState<Room | null>(null);
  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const micEnabledRef = useRef<boolean>(false);
  const preWarmingRef = useRef<boolean>(false);

  const {
    callState,
    setCallState,
    setRoomName,
    startCall,
    addMessage,
    setStreamingText,
    addToolCall,
    updateToolCall,
    setSummary,
    setIsSpeaking,
    setIsListening,
    setAvatarVideoTrack,
    setAvatarStatus,
    reset,
    softReset,
    preWarmData,
    setPreWarmData,
    isPreWarming,
    setIsPreWarming,
  } = useConversationStore();

  // Handle incoming data messages from agent
  const handleDataReceived = useCallback(
    (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));

        switch (data.type) {
          case 'avatar_status':
            // Avatar loading status from backend
            setAvatarStatus(data.status, data.message);

            // Enable microphone only when avatar is ready (or failed gracefully)
            if ((data.status === 'ready' || data.status === 'failed') && roomRef.current && !micEnabledRef.current) {
              micEnabledRef.current = true;
              roomRef.current.localParticipant.setMicrophoneEnabled(true)
                .then(() => {
                  setCallState('active');
                })
                .catch(() => { });
            }
            break;
          case 'streaming_text':
            // Real-time text streaming from LLM (typing effect)
            if (data.is_final) {
              // Final chunk - clear streaming text (full message will come via transcript)
              setStreamingText(null);
            } else {
              // Interim chunk - show streaming text
              setStreamingText(data.content);
              setIsSpeaking(true);
            }
            break;
          case 'transcript':
            // Clear streaming text when final transcript arrives
            setStreamingText(null);
            // Pass response_time for assistant messages
            addMessage(data.role, data.content, data.response_time);
            // Update speaking state
            if (data.role === 'assistant') {
              setIsSpeaking(true);
              // Reset speaking after a delay (TTS duration estimate)
              setTimeout(() => setIsSpeaking(false), 3000);
            }
            break;
          case 'tool_start':
            addToolCall(data.tool);
            break;
          case 'tool_end':
          case 'tool_executed':
            updateToolCall(data.tool, 'completed', data.result);
            break;
          case 'summary':
            // Pass the full summary object (contains summary, user_name, user_phone, appointments_booked)
            setSummary(data as CallSummary);
            break;
          default:
            break;
        }
      } catch {
        // Silently ignore parse errors
      }
    },
    [addMessage, setStreamingText, addToolCall, updateToolCall, setSummary, setIsSpeaking, setAvatarStatus, setCallState]
  );

  // Handle remote audio track subscription - PLAY THE AGENT'S VOICE
  const handleTrackSubscribed = useCallback(
    (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {

      if (track.kind === Track.Kind.Audio) {
        // Create audio element to play the agent's voice
        const audioElement = track.attach();
        audioElement.id = `audio-${participant.identity}-${publication.trackSid}`;
        document.body.appendChild(audioElement);
        audioElementsRef.current.set(publication.trackSid, audioElement);
      }

      // Handle video track from avatar (Beyond Presence)
      if (track.kind === Track.Kind.Video) {
        // Store the full TrackReference for AvatarView
        // VideoTrack component requires: { participant, publication, source }
        setAvatarVideoTrack({
          participant,
          publication,
          source: track.source,
        });
      }
    },
    [setAvatarVideoTrack]
  );

  // Handle track unsubscription - cleanup audio elements
  const handleTrackUnsubscribed = useCallback(
    (track: Track, publication: RemoteTrackPublication) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = audioElementsRef.current.get(publication.trackSid);
        if (audioElement) {
          track.detach(audioElement);
          audioElement.remove();
          audioElementsRef.current.delete(publication.trackSid);
        }
      }

      // Clear avatar video track when unsubscribed
      if (track.kind === Track.Kind.Video) {
        setAvatarVideoTrack(null);
      }
    },
    [setAvatarVideoTrack]
  );

  // Pre-warm the connection (called on page load and hover)
  // This triggers the backend to create a room AND start the agent + avatar
  const preWarm = useCallback(async () => {
    // Don't pre-warm if already pre-warming, in a call, or have valid pre-warm data
    if (preWarmingRef.current || isPreWarming || callState !== 'idle') {
      return;
    }

    // Check if existing pre-warm data is still valid
    if (preWarmData && Date.now() - preWarmData.timestamp < PRE_WARM_EXPIRY_MS) {
      return;
    }

    preWarmingRef.current = true;
    setIsPreWarming(true);

    try {
      // Call the prewarm endpoint - this creates the room AND triggers the agent + avatar
      // The avatar starts loading in the background while user reads the page
      const prewarmInfo = await prewarmRoom();

      setPreWarmData({
        roomName: prewarmInfo.room_name,
        token: prewarmInfo.token,
        livekitUrl: prewarmInfo.livekit_url,
        timestamp: Date.now(),
      });

      console.log('🔥 Pre-warming room (agent + avatar starting):', prewarmInfo.room_name, 'status:', prewarmInfo.status);
    } catch (error) {
      console.warn('Pre-warm failed:', error);
      setPreWarmData(null);
    } finally {
      preWarmingRef.current = false;
      setIsPreWarming(false);
    }
  }, [callState, isPreWarming, preWarmData, setIsPreWarming, setPreWarmData]);

  // Start a call
  const startVoiceCall = useCallback(async () => {
    try {
      startCall();

      let roomName: string;
      let token: string;
      let livekitUrl: string;

      // Use pre-warmed data if valid, otherwise create new room
      if (preWarmData && Date.now() - preWarmData.timestamp < PRE_WARM_EXPIRY_MS) {
        console.log('⚡ Using pre-warmed connection');
        roomName = preWarmData.roomName;
        token = preWarmData.token;
        livekitUrl = preWarmData.livekitUrl;
        // Clear pre-warm data since we're using it
        setPreWarmData(null);
      } else {
        console.log('🔄 Creating new room (no pre-warm)');
        const roomInfo = await createRoom();
        roomName = roomInfo.room_name;
        const tokenInfo = await getToken(roomName, 'user');
        token = tokenInfo.token;
        livekitUrl = tokenInfo.livekit_url;
      }

      setRoomName(roomName);

      // Create and connect to room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        // Audio settings
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      roomRef.current = newRoom;
      setRoom(newRoom);

      // Set up event handlers
      newRoom.on(RoomEvent.DataReceived, handleDataReceived);

      // IMPORTANT: Handle audio from the agent
      newRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      newRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

      newRoom.on(RoomEvent.Connected, () => {
        // Don't set active yet - wait for avatar_status 'ready'
        // setCallState('active') will be called when avatar is ready
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        // Cleanup all audio elements
        audioElementsRef.current.forEach((element) => {
          element.remove();
        });
        audioElementsRef.current.clear();

        // Reset avatar states
        setIsSpeaking(false);
        setIsListening(false);

        // Only reset to idle if not in summary flow
        // Read current state from store to avoid stale closure
        const currentState = useConversationStore.getState().callState;
        if (currentState !== 'summary' && currentState !== 'generating_summary') {
          setCallState('idle');
        }
      });

      newRoom.on(RoomEvent.ParticipantConnected, () => { });

      newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {

        // Check if agent is speaking (identity !== 'user')
        const agentSpeaking = speakers.some(s => s.identity !== 'user' && s.identity !== newRoom.localParticipant.identity);
        // Check if user is speaking
        const userSpeaking = speakers.some(s => s.identity === newRoom.localParticipant.identity);

        setIsSpeaking(agentSpeaking);
        setIsListening(userSpeaking);
      });

      // Connect to room with audio enabled
      await newRoom.connect(livekitUrl, token);

      // Reset mic tracking for this call
      micEnabledRef.current = false;

      // DON'T enable microphone here - wait for avatar_status 'ready' event
      // This prevents user from speaking before the avatar is loaded
    } catch {
      setCallState('idle');
    }
  }, [startCall, setRoomName, setCallState, handleDataReceived, handleTrackSubscribed, handleTrackUnsubscribed, callState, setIsSpeaking, setIsListening, preWarmData, setPreWarmData]);

  // End the call
  const endVoiceCall = useCallback(async () => {
    // Capture data BEFORE disconnect
    const currentRoomName = roomRef.current?.name || useConversationStore.getState().roomName;
    const currentStore = useConversationStore.getState();

    // Show the generating summary loader
    setCallState('generating_summary');
    const loaderStartTime = Date.now();

    // Disconnect from room
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
    }

    // Cleanup audio elements
    audioElementsRef.current.forEach((element) => {
      element.remove();
    });
    audioElementsRef.current.clear();

    // Calculate call duration
    const callDuration = currentStore.callStartTime
      ? Math.floor((Date.now() - currentStore.callStartTime.getTime()) / 1000)
      : 0;

    // Get completed tool calls
    const completedTools = currentStore.toolCalls.filter(tc => tc.status === 'completed');
    const toolCallNames = completedTools.map(tc => tc.tool);

    // Format appointments for API (extract booking info from tool results if available)
    const bookingTools = completedTools.filter(tc => tc.tool === 'book_appointment');
    const appointmentsBooked = bookingTools.map((tc, idx) => ({
      id: `apt-${idx}`,
      appointment_date: tc.result?.toString() || '',
      appointment_time: '',
    }));

    // Call API to generate summary
    try {
      const { generateSummary } = await import('@/lib/api');

      const summaryResponse = await generateSummary({
        room_name: currentRoomName || 'unknown',
        messages: currentStore.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        tool_calls: toolCallNames,
        appointments_booked: appointmentsBooked,
        user_name: undefined, // Could extract from messages if needed
        duration_seconds: callDuration,
      });

      setSummary({
        summary: summaryResponse.summary,
        appointments_booked: summaryResponse.appointments_booked as { id: string; appointment_date: string; appointment_time: string }[],
        cost: summaryResponse.cost,
      } as CallSummary);

      console.log('✅ AI summary generated:', summaryResponse.summary.substring(0, 50) + '...');
      if (summaryResponse.cost) {
        console.log('💰 Estimated cost:', `$${summaryResponse.cost.total.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);

      // Fallback to local summary
      const messages = currentStore.messages;
      const minutes = Math.floor(callDuration / 60);
      const seconds = callDuration % 60;

      let summaryText = '';
      const bookings = completedTools.filter(tc => tc.tool === 'book_appointment');
      const cancellations = completedTools.filter(tc => tc.tool === 'cancel_appointment');

      if (bookings.length > 0) {
        summaryText += `${bookings.length} appointment(s) booked. `;
      }
      if (cancellations.length > 0) {
        summaryText += `${cancellations.length} appointment(s) cancelled. `;
      }
      if (!summaryText) {
        summaryText = 'Call completed. ';
      }
      summaryText += `Duration: ${minutes}m ${seconds}s, ${messages.length} messages.`;

      setSummary({ summary: summaryText } as CallSummary);
      console.log('⚠️ Using fallback summary');
    }

    // Ensure loader is visible for at least 1.5 seconds
    const elapsedTime = Date.now() - loaderStartTime;
    const minLoaderTime = 1500; // 1.5 seconds
    if (elapsedTime < minLoaderTime) {
      await new Promise(resolve => setTimeout(resolve, minLoaderTime - elapsedTime));
    }

    // Show summary modal
    setCallState('summary');
  }, [setCallState, setSummary]);

  // Reset and start new call (use soft reset to keep pre-warm benefits)
  const startNewCall = useCallback(() => {
    softReset();
    // Pre-warm a new room for the next call
    preWarm();
    startVoiceCall();
  }, [softReset, preWarm, startVoiceCall]);

  // Cleanup on unmount
  useEffect(() => {
    const audioElements = audioElementsRef.current;
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      // Cleanup audio elements
      audioElements.forEach((element) => {
        element.remove();
      });
      audioElements.clear();
    };
  }, []);

  // Auto pre-warm on page load - start immediately!
  // The avatar takes ~20 seconds to warm up, so start ASAP
  useEffect(() => {
    // Small delay to let the page render first, then start pre-warming
    const timer = setTimeout(() => {
      if (callState === 'idle' && !preWarmData) {
        console.log('🚀 Auto pre-warming on page load...');
        preWarm();
      }
    }, 500); // Start pre-warming 0.5 seconds after page loads

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  return {
    room,
    startCall: startVoiceCall,
    endCall: endVoiceCall,
    startNewCall,
    preWarm, // Expose for hover pre-warming
    callState,
  };
}

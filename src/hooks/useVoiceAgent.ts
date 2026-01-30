import { useCallback, useEffect, useRef } from 'react';
import { Room, RoomEvent, Track, type RemoteParticipant, type RemoteTrackPublication } from 'livekit-client';
import { useConversationStore } from '@/stores/conversationStore';
import { createRoom, getToken } from '@/lib/api';

export function useVoiceAgent() {
  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const micEnabledRef = useRef<boolean>(false);

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
  } = useConversationStore();

  // Handle incoming data messages from agent
  const handleDataReceived = useCallback(
    (payload: Uint8Array, _participant?: RemoteParticipant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        console.log('📥 Received data from agent:', data);

        switch (data.type) {
          case 'avatar_status':
            // Avatar loading status from backend
            console.log('🎭 Avatar status:', data.status, data.message);
            setAvatarStatus(data.status, data.message);

            // Enable microphone only when avatar is ready (or failed gracefully)
            if ((data.status === 'ready' || data.status === 'failed') && roomRef.current && !micEnabledRef.current) {
              micEnabledRef.current = true;
              roomRef.current.localParticipant.setMicrophoneEnabled(true)
                .then(() => {
                  console.log('🎤 Microphone enabled after avatar ready');
                  setCallState('active');
                })
                .catch((err) => console.error('❌ Microphone error:', err));
            }
            break;
          case 'streaming_text':
            // Real-time text streaming from LLM (typing effect)
            console.log('📝 Streaming text received:', data.content?.substring(0, 50) + '...', 'is_final:', data.is_final);
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
            console.log('🔧 Tool starting:', data.tool);
            addToolCall(data.tool);
            break;
          case 'tool_end':
          case 'tool_executed':
            console.log('✅ Tool completed:', data.tool, data.result);
            updateToolCall(data.tool, 'completed', data.result);
            break;
          case 'summary':
            setSummary(data.summary);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (e) {
        console.error('Failed to parse data message:', e);
      }
    },
    [addMessage, setStreamingText, addToolCall, updateToolCall, setSummary, setIsSpeaking, setAvatarStatus, setCallState]
  );

  // Handle remote audio track subscription - PLAY THE AGENT'S VOICE
  const handleTrackSubscribed = useCallback(
    (track: Track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);

      if (track.kind === Track.Kind.Audio) {
        // Create audio element to play the agent's voice
        const audioElement = track.attach();
        audioElement.id = `audio-${participant.identity}-${publication.trackSid}`;
        document.body.appendChild(audioElement);
        audioElementsRef.current.set(publication.trackSid, audioElement);

        console.log('🔊 Audio track attached and playing from:', participant.identity);
      }

      // Handle video track from avatar (Beyond Presence)
      if (track.kind === Track.Kind.Video) {
        console.log('📹 Video track received from:', participant.identity);
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
    (track: Track, publication: RemoteTrackPublication, _participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = audioElementsRef.current.get(publication.trackSid);
        if (audioElement) {
          track.detach(audioElement);
          audioElement.remove();
          audioElementsRef.current.delete(publication.trackSid);
          console.log('Audio track detached');
        }
      }

      // Clear avatar video track when unsubscribed
      if (track.kind === Track.Kind.Video) {
        console.log('📹 Video track unsubscribed');
        setAvatarVideoTrack(null);
      }
    },
    [setAvatarVideoTrack]
  );

  // Start a call
  const startVoiceCall = useCallback(async () => {
    try {
      startCall();

      // Create room
      const roomInfo = await createRoom();
      setRoomName(roomInfo.room_name);

      // Get token
      const tokenInfo = await getToken(roomInfo.room_name, 'user');

      // Create and connect to room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        // Audio settings
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      roomRef.current = room;

      // Set up event handlers
      room.on(RoomEvent.DataReceived, handleDataReceived);

      // IMPORTANT: Handle audio from the agent
      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

      room.on(RoomEvent.Connected, () => {
        console.log('✅ Connected to room');
        // Don't set active yet - wait for avatar_status 'ready'
        // setCallState('active') will be called when avatar is ready
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        // Cleanup all audio elements
        audioElementsRef.current.forEach((element) => {
          element.remove();
        });
        audioElementsRef.current.clear();

        // Reset avatar states
        setIsSpeaking(false);
        setIsListening(false);

        if (callState !== 'summary') {
          setCallState('idle');
        }
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('Participant connected:', participant.identity);
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const speakerIds = speakers.map(s => s.identity);
        console.log('Active speakers:', speakerIds);

        // Check if agent is speaking (identity !== 'user')
        const agentSpeaking = speakers.some(s => s.identity !== 'user' && s.identity !== room.localParticipant.identity);
        // Check if user is speaking
        const userSpeaking = speakers.some(s => s.identity === room.localParticipant.identity);

        setIsSpeaking(agentSpeaking);
        setIsListening(userSpeaking);
      });

      // Connect to room with audio enabled
      await room.connect(tokenInfo.livekit_url, tokenInfo.token);
      console.log('Room state:', room.state);

      // Reset mic tracking for this call
      micEnabledRef.current = false;

      // DON'T enable microphone here - wait for avatar_status 'ready' event
      // This prevents user from speaking before the avatar is loaded
      console.log('🎤 Microphone will be enabled when avatar is ready...');

    } catch (error) {
      console.error('Failed to start call:', error);
      setCallState('idle');
    }
  }, [startCall, setRoomName, setCallState, handleDataReceived, handleTrackSubscribed, handleTrackUnsubscribed, callState, setIsSpeaking, setIsListening]);

  // End the call
  const endVoiceCall = useCallback(async () => {
    // Show the generating summary loader
    setCallState('generating_summary');

    // Disconnect from room - this will trigger backend to generate AI summary
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    // Cleanup audio elements
    audioElementsRef.current.forEach((element) => {
      element.remove();
    });
    audioElementsRef.current.clear();

    // Wait for AI-generated summary from backend (sent via data channel)
    // The backend sends a 'summary' message which is handled by handleDataReceived
    // Give it up to 10 seconds to generate, then fall back to a simple summary
    const waitForSummary = new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        const currentStore = useConversationStore.getState();
        if (currentStore.summary) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 500);

      // Timeout after 10 seconds - use fallback summary
      setTimeout(() => {
        clearInterval(checkInterval);
        const currentStore = useConversationStore.getState();
        if (!currentStore.summary) {
          // Create a fallback summary
          const messages = currentStore.messages;
          const completedTools = currentStore.toolCalls.filter(tc => tc.status === 'completed');
          const callDuration = currentStore.callStartTime
            ? Math.floor((Date.now() - currentStore.callStartTime.getTime()) / 1000)
            : 0;
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

          setSummary({ summary: summaryText } as any);
        }
        resolve();
      }, 10000);
    });

    await waitForSummary;

    // Show summary modal
    setCallState('summary');
  }, [setCallState, setSummary]);

  // Reset and start new call
  const startNewCall = useCallback(() => {
    reset();
    startVoiceCall();
  }, [reset, startVoiceCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      // Cleanup audio elements
      audioElementsRef.current.forEach((element) => {
        element.remove();
      });
      audioElementsRef.current.clear();
    };
  }, []);

  return {
    room: roomRef.current,
    startCall: startVoiceCall,
    endCall: endVoiceCall,
    startNewCall,
    callState,
  };
}

import { useRef, useCallback, useEffect } from 'react';

/**
 * Continuous caller tune using Web Audio API synthesis
 * Creates a pleasant phone-style ringtone that plays infinitely without gaps
 */
export function useConnectingSound() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);
    const gainNodesRef = useRef<GainNode[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPlayingRef = useRef(false);

    const startRingtone = useCallback(() => {
        // If already playing, don't restart
        if (isPlayingRef.current) {
            return;
        }

        try {
            // Create AudioContext
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;

            // Resume if suspended
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            isPlayingRef.current = true;

            // Create a pleasant dual-tone ringtone pattern
            // Similar to traditional phone ringback tone
            const playRingTone = () => {
                if (!isPlayingRef.current || !audioContextRef.current) return;

                const now = ctx.currentTime;

                // Dual-tone frequencies (similar to ringback tone)
                const frequencies = [440, 480]; // A4 and slightly sharp A4 for warble effect

                frequencies.forEach((freq) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.value = freq;

                    // Ring pattern: 1 second on
                    const ringDuration = 1.0;

                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Fade in
                    gain.gain.setValueAtTime(0.08, now + ringDuration - 0.1);
                    gain.gain.linearRampToValueAtTime(0, now + ringDuration); // Fade out

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(now);
                    osc.stop(now + ringDuration);

                    oscillatorsRef.current.push(osc);
                    gainNodesRef.current.push(gain);
                });
            };

            // Play immediately and then repeat
            playRingTone();

            // Repeat every 1.5 seconds (1 sec ring + 0.5 sec gap - short gap for connecting feel)
            intervalRef.current = setInterval(() => {
                if (isPlayingRef.current) {
                    playRingTone();
                }
            }, 1500);

        } catch (error) {
            console.warn('Could not play connecting sound:', error);
            isPlayingRef.current = false;
        }
    }, []);

    const stopRingtone = useCallback(() => {
        isPlayingRef.current = false;

        // Clear the interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Stop all oscillators
        oscillatorsRef.current.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch { }
        });
        oscillatorsRef.current = [];

        // Disconnect gain nodes
        gainNodesRef.current.forEach(gain => {
            try {
                gain.disconnect();
            } catch { }
        });
        gainNodesRef.current = [];

        // Close audio context
        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch { }
            audioContextRef.current = null;
        }
    }, []);

    /**
     * Connected chime: Quick ascending "connected" sound
     */
    const playConnectedChime = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = ctx.currentTime;

            // Quick duo-tone (like FaceTime connect)
            [
                { freq: 784, delay: 0, vol: 0.15 },      // G5
                { freq: 1047, delay: 0.08, vol: 0.18 },  // C6
            ].forEach(({ freq, delay, vol }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;

                const t = now + delay;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(vol, t + 0.01);
                gain.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.4);

                // Add sine layer
                const sine = ctx.createOscillator();
                const sineGain = ctx.createGain();
                sine.type = 'sine';
                sine.frequency.value = freq;
                sineGain.gain.setValueAtTime(0, t);
                sineGain.gain.linearRampToValueAtTime(vol * 0.5, t + 0.01);
                sineGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                sine.connect(sineGain);
                sineGain.connect(ctx.destination);
                sine.start(t);
                sine.stop(t + 0.3);
            });

            setTimeout(() => ctx.close(), 500);
        } catch (error) {
            console.warn('Could not play connected chime:', error);
        }
    }, []);

    useEffect(() => {
        return () => {
            stopRingtone();
        };
    }, [stopRingtone]);

    return { startRingtone, stopRingtone, playConnectedChime };
}

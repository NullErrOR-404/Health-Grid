import React, { useRef, useEffect } from 'react';

interface AudioVisualizerCanvasProps {
  isActive: boolean;
  isAiSpeaking?: boolean;
  mode?: 'bars' | 'wave';
  height?: number;
  barColor?: string;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  isActive,
  isAiSpeaking = false,
  mode = 'wave',
  height = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let phase = 0;

    const setupLiveAudio = async () => {
      try {
        if (isActive && !isAiSpeaking && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;
          }
        }
      } catch (err) {
        // Fallback to organic procedural sine wave simulation
      }
    };

    if (isActive && !isAiSpeaking) {
      setupLiveAudio();
    }

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (isActive || isAiSpeaking) {
        phase += isAiSpeaking ? 0.08 : 0.05;

        let frequencyData: Uint8Array | null = null;
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          frequencyData = new Uint8Array(bufferLength);
          (analyserRef.current as any).getByteFrequencyData(frequencyData);
        }

        if (mode === 'wave') {
          // Smooth sinusoidal wave
          ctx.beginPath();
          ctx.lineWidth = 2.5;

          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, '#0D9488'); // Teal
          gradient.addColorStop(0.5, '#06B6D4'); // Cyan
          gradient.addColorStop(1, '#10B981'); // Emerald
          ctx.strokeStyle = gradient;

          const points = 48;
          const sliceWidth = width / points;

          for (let i = 0; i <= points; i++) {
            const x = i * sliceWidth;
            let amplitude = 14;

            if (frequencyData && frequencyData.length > 0) {
              const freqIdx = Math.floor((i / points) * frequencyData.length);
              amplitude = 6 + (frequencyData[freqIdx] / 255) * (h / 2.2);
            } else if (isAiSpeaking) {
              amplitude = 12 + Math.sin(phase * 1.5 + i * 0.4) * 8;
            } else {
              amplitude = 8 + Math.sin(phase + i * 0.3) * 6;
            }

            const y = h / 2 + Math.sin(i * 0.35 + phase) * amplitude;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();

          // Second softer harmonic line
          ctx.beginPath();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = 'rgba(13, 148, 136, 0.35)';
          for (let i = 0; i <= points; i++) {
            const x = i * sliceWidth;
            const y = h / 2 + Math.cos(i * 0.4 - phase * 0.8) * 8;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else {
          // Dynamic Equalizer Bars
          const barCount = 24;
          const barWidth = Math.floor((width - barCount * 3) / barCount);

          for (let i = 0; i < barCount; i++) {
            let barHeight = 6;
            if (frequencyData && frequencyData.length > 0) {
              const freqIdx = Math.floor((i / barCount) * frequencyData.length);
              barHeight = Math.max(4, (frequencyData[freqIdx] / 255) * (h * 0.85));
            } else if (isAiSpeaking) {
              barHeight = 8 + Math.abs(Math.sin(phase * 2 + i * 0.4)) * (h * 0.7);
            } else {
              barHeight = 6 + Math.abs(Math.sin(phase + i * 0.3)) * (h * 0.6);
            }

            const x = i * (barWidth + 3);
            const y = (h - barHeight) / 2;

            const barGrad = ctx.createLinearGradient(0, y, 0, y + barHeight);
            barGrad.addColorStop(0, '#06B6D4');
            barGrad.addColorStop(1, '#0D9488');

            ctx.fillStyle = barGrad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 4);
            ctx.fill();
          }
        }
      } else {
        // Flat dormant line
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#E2E8F0';
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isActive, isAiSpeaking, mode]);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-auto max-w-[340px]"
      />
    </div>
  );
};

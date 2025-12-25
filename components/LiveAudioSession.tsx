import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';

// Manual encoding/decoding as per requirements
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface LiveAudioSessionProps {
  onTranscript?: (text: string, role: 'user' | 'model') => void;
  isActive: boolean;
  onClose: () => void;
}

const LiveAudioSession: React.FC<LiveAudioSessionProps> = ({ onTranscript, isActive, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const transcriptionRef = useRef<{ user: string; model: string }>({ user: '', model: '' });

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    Object.values(audioContextsRef.current).forEach(ctx => {
      if (ctx) ctx.close();
    });
    audioContextsRef.current = {};
    setIsStreaming(false);
    setIsConnecting(false);
    onClose();
  };

  const startSession = async () => {
    setIsConnecting(true);
    // Fix: Updated GoogleGenAI initialization to use process.env.API_KEY directly as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextsRef.current = { input: inputAudioContext, output: outputAudioContext };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsStreaming(true);
            setIsConnecting(false);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              if (onTranscript) {
                if (transcriptionRef.current.user) onTranscript(transcriptionRef.current.user, 'user');
                if (transcriptionRef.current.model) onTranscript(transcriptionRef.current.model, 'model');
              }
              transcriptionRef.current = { user: '', model: '' };
            }

            // Handle audio output
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextsRef.current.output!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live session error", e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION + "\nYou are in VOICE MODE. Be extremely concise and responsive. Speak naturally.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start audio session", err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (isActive && !isStreaming && !isConnecting) {
      startSession();
    }
    return () => {
      if (isStreaming) stopSession();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="relative w-80 h-80 flex flex-col items-center justify-center bg-slate-900 border border-emerald-500/30 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <div className={`absolute inset-4 border-2 border-emerald-500/20 rounded-full ${isStreaming ? 'animate-ping' : ''}`} />
        <div className={`absolute inset-8 border-4 border-emerald-500/40 rounded-full ${isStreaming ? 'animate-pulse' : ''}`} />
        
        <div className="z-10 flex flex-col items-center">
          <div className="text-emerald-400 text-5xl mb-4 font-orbitron">
            {isConnecting ? '...' : '◈'}
          </div>
          <p className="text-emerald-500 font-orbitron tracking-widest text-sm animate-pulse">
            {isConnecting ? 'ESTABLISHING LINK' : 'NEURAL VOICE ACTIVE'}
          </p>
          <p className="text-slate-500 text-[10px] mt-2 text-center px-8 uppercase tracking-tighter">
            Speak naturally. Protocol is monitoring real-time bio-sync.
          </p>
          
          <button 
            onClick={stopSession}
            className="mt-8 px-6 py-2 bg-rose-600/20 border border-rose-500/50 text-rose-500 rounded-full text-xs font-bold hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest"
          >
            Terminate Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveAudioSession;
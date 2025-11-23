import React, { useState, useRef, useEffect } from 'react';
import { InterviewQuestion, ConversationTurn } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, PhoneOff, Activity, Loader2, Play, User, MessageSquare } from 'lucide-react';

interface InterviewSessionProps {
  questions: InterviewQuestion[];
  resumeText: string;
  jdText: string;
  onComplete: (transcript: ConversationTurn[]) => void;
}

const VOICES = [
  { id: 'Kore', name: 'Voice A (Female)', gender: 'Female' },
  { id: 'Puck', name: 'Voice B (Male)', gender: 'Male' },
  { id: 'Fenrir', name: 'Voice C (Deep Male)', gender: 'Male' },
  { id: 'Zephyr', name: 'Voice D (Soft Female)', gender: 'Female' },
];

const InterviewSession: React.FC<InterviewSessionProps> = ({ questions, resumeText, jdText, onComplete }) => {
  // Configuration State
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');

  // Session State
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volume, setVolume] = useState(0); // For visualizer
  const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
  const [status, setStatus] = useState<string>('Initializing...');
  const [aiCaption, setAiCaption] = useState(''); // Live caption
  
  // Refs
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptRef = useRef<ConversationTurn[]>([]);
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  const activeSessionRef = useRef<any>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    return () => {
      endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    setHasStarted(true);
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Explicitly resume contexts to ensure audio flows
      await inputContext.resume();
      await outputContext.resume();

      inputContextRef.current = inputContext;
      audioContextRef.current = outputContext;

      const questionScript = questions.map((q, i) => `Question ${i + 1}: ${q.question}`).join('\n');
      
      const systemInstruction = `
        You are a professional, polite, and encouraging technical interviewer.
        Your task is to interview a candidate for a job.
        
        JOB DESCRIPTION:
        ${jdText.slice(0, 1000)}...
        
        CANDIDATE RESUME:
        ${resumeText.slice(0, 1000)}...

        INTERVIEW SCRIPT:
        You must ask exactly these ${questions.length} questions, one by one.
        ${questionScript}

        RULES:
        1. Start immediately by introducing yourself and asking Question 1. Do NOT wait for the user to speak.
        2. Wait for the candidate to answer.
        3. Acknowledge their answer briefly, then ask the next question.
        4. Do not deviate from the question list.
        5. After the final question, say "Thank you, that concludes our interview."
      `;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction: systemInstruction,
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Session Opened");
            setIsConnected(true);
            setStatus('Interview in Progress');
            
            // Force the AI to speak first by sending a hidden text prompt
            sessionPromise.then(session => {
                session.send({ parts: [{ text: "Hello. Please start the interview." }] }, true);
            });

            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMicOn) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1)); 

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
            
            sourceRef.current = source;
            scriptProcessorRef.current = scriptProcessor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              await playAudio(audioData, outputContext);
            }

            if (msg.serverContent?.outputTranscription) {
               const text = msg.serverContent.outputTranscription.text;
               currentOutputTransRef.current += text;
               setAiCaption(currentOutputTransRef.current);
            }

            if (msg.serverContent?.inputTranscription) {
               currentInputTransRef.current += msg.serverContent.inputTranscription.text;
            }

            if (msg.serverContent?.turnComplete) {
               const now = Date.now();
               
               if (currentInputTransRef.current.trim()) {
                  const item: ConversationTurn = { role: 'user', text: currentInputTransRef.current, timestamp: now };
                  transcriptRef.current.push(item);
                  setTranscript([...transcriptRef.current]);
                  currentInputTransRef.current = '';
               }
               
               if (currentOutputTransRef.current.trim()) {
                  const item: ConversationTurn = { role: 'model', text: currentOutputTransRef.current, timestamp: now };
                  transcriptRef.current.push(item);
                  setTranscript([...transcriptRef.current]);
                  currentOutputTransRef.current = '';

                  if (item.text.toLowerCase().includes('concludes our interview')) {
                    setTimeout(() => handleEndCall(), 3000);
                  }
               }
            }
          },
          onclose: () => {
             console.log("Session Closed");
             setIsConnected(false);
          },
          onerror: (err) => {
             console.error("Session Error", err);
             setStatus("Error: Connection lost.");
          }
        }
      });
      
      sessionPromise.then(s => activeSessionRef.current = s);

    } catch (e) {
      console.error(e);
      setStatus("Failed to access microphone or connect.");
    }
  };

  const playAudio = async (base64String: string, ctx: AudioContext) => {
    if (ctx.state === 'closed') return;

    try {
        const audioBuffer = await decodeAudioData(
            decode(base64String),
            ctx,
            24000,
            1
        );
        
        setVolume(0.8);
        setTimeout(() => setVolume(0), audioBuffer.duration * 1000);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        const now = ctx.currentTime;
        const start = Math.max(now, nextStartTimeRef.current);
        source.start(start);
        
        nextStartTimeRef.current = start + audioBuffer.duration;
        
        sourcesRef.current.add(source);
        source.addEventListener('ended', () => {
            sourcesRef.current.delete(source);
        });
    } catch (e) {
        console.error("Audio Playback Error", e);
    }
  };

  const endSession = () => {
    scriptProcessorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') inputContextRef.current.close();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();

    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    
    if (activeSessionRef.current) {
        try { activeSessionRef.current.close(); } catch(e){}
    }
    
    setIsConnected(false);
  };

  const handleEndCall = () => {
    endSession();
    onComplete(transcriptRef.current);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  // --- Configuration Screen ---
  if (!hasStarted) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Setup Interview</h2>
          <p className="text-lg text-slate-500">Select your voice preference.</p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <User size={16} /> Select AI Voice
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedVoice === v.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-slate-100 hover:border-blue-200 text-slate-600'
                  }`}
                >
                  <span className="font-semibold">{v.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button 
              onClick={startSession}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Play size={22} fill="currentColor" />
              Start Session
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">Microphone access required</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Active Session Screen ---
  return (
    <div className="max-w-5xl mx-auto min-h-[80vh] flex flex-col items-center justify-between py-6 animate-in fade-in zoom-in-95 duration-500 space-y-8">
      
      {/* Header Status */}
      <div className="flex flex-col items-center space-y-2">
         <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-600 font-semibold text-sm">{status}</span>
         </div>
      </div>

      {/* Prominent Question Display */}
      <div className="w-full max-w-4xl flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 md:p-14 text-center relative overflow-hidden transition-all duration-300">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-gradient"></div>
           
           <div className="flex items-center justify-center gap-2 mb-8 text-blue-600">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Interviewer</span>
           </div>
           
           <div className="min-h-[140px] flex items-center justify-center">
             <p className={`text-3xl md:text-4xl font-medium leading-tight transition-all duration-300 ${aiCaption ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                {aiCaption || "Waiting for question..."}
             </p>
           </div>
           
           {/* Hint */}
           <div className="mt-10 pt-6 border-t border-slate-50 text-slate-400 text-sm flex items-center justify-center gap-2 font-medium">
             {aiCaption ? 
                <span>AI is speaking...</span> : 
                <span className="flex items-center gap-2 text-blue-600">
                    Listening to you 
                    <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-0"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-300"></span>
                    </span>
                </span>
             }
           </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
         <div 
            className="absolute inset-0 bg-cyan-400/20 rounded-full transition-all duration-75 ease-out blur-xl" 
            style={{ transform: `scale(${1 + volume * 1.5})` }}
         />
         <div 
            className="absolute inset-4 bg-blue-500/30 rounded-full transition-all duration-75 ease-out delay-75"
            style={{ transform: `scale(${1 + volume * 1.0})` }}
         />
         <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-cyan-500/40 flex items-center justify-center z-10">
            {isConnected ? (
               <Activity className="text-white" size={36} />
            ) : (
               <Loader2 className="text-white animate-spin" size={32} />
            )}
         </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xl">
          <div className="flex items-center justify-center gap-6">
             <button 
                onClick={toggleMic}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-md ${
                   isMicOn 
                   ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200' 
                   : 'bg-red-50 text-red-600 border border-red-200 shadow-red-100'
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
             >
                {isMicOn ? <Mic size={28} /> : <MicOff size={28} />}
             </button>

             <button 
                onClick={handleEndCall}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl shadow-red-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-red-100"
                title="End Interview"
             >
                <PhoneOff size={32} />
             </button>
          </div>
      </div>

    </div>
  );
};

// --- Audio Helpers ---
function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
  }
  const uint8 = new Uint8Array(int16.buffer);
  
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const base64 = btoa(binary);
  return { data: base64, mimeType: 'audio/pcm;rate=16000' };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

export default InterviewSession;
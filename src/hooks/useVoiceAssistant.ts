
import { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type VoiceTone = 'friendly' | 'professional' | 'clear';

export function useVoiceAssistant(language: string = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActuallyRunningRef = useRef(false);
  const retryCountRef = useRef(0);

  const getFullLocale = (code: string) => {
    const map: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      ur: 'ur-IN'
    };
    return map[code] || code;
  };

  const fullLocale = getFullLocale(language);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isActuallyRunningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
      setIsListening(false);
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      if (!visible) {
        cancelSpeech();
        stopListening();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cancelSpeech, stopListening]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoicesLoaded(true);
    };

    if (window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true);
      }
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const getBestVoice = useCallback((lang: string) => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    const langVoices = voices.filter(v => v.lang.toLowerCase().includes(lang.toLowerCase().split('-')[0]));
    
    if (langVoices.length === 0) return null;

    const sorted = [...langVoices].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      const score = (name: string) => {
        if (name.includes('natural')) return 10;
        if (name.includes('google')) return 8;
        if (name.includes('premium')) return 6;
        if (name.includes('enhanced')) return 5;
        return 0;
      };

      return score(bName) - score(aName);
    });

    return sorted[0];
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = fullLocale;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setError(null);
        retryCountRef.current = 0;
      };

      recognition.onerror = (event: any) => {
        isActuallyRunningRef.current = false;
        setIsListening(false);

        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
          setError(event.error);
        }
        
        if (event.error === 'network' && retryCountRef.current < 2 && document.visibilityState === 'visible') {
          retryCountRef.current++;
          setTimeout(() => {
            if (recognitionRef.current && !isActuallyRunningRef.current && document.visibilityState === 'visible') {
              startListening();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        isActuallyRunningRef.current = false;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, fullLocale]);

  const startListening = useCallback(() => {
    if (document.visibilityState === 'hidden') return;
    
    if (recognitionRef.current && !isActuallyRunningRef.current) {
      setTranscript('');
      setError(null);
      isActuallyRunningRef.current = true; // Set early to prevent multiple starts
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
        } else {
          console.error('Failed to start recognition:', e);
          isActuallyRunningRef.current = false;
          setIsListening(false);
        }
      }
    }
  }, []);

  const speak = useCallback((text: string, tone: VoiceTone = 'professional', lang: string = fullLocale) => {
    if (!window.speechSynthesis || document.visibilityState === 'hidden') return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    const bestVoice = getBestVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    const tones: Record<VoiceTone, { rate: number, pitch: number }> = {
      friendly: { rate: 1.0, pitch: 1.15 },
      professional: { rate: 0.95, pitch: 1.05 },
      clear: { rate: 0.85, pitch: 1.0 }
    };

    const config = tones[tone] || tones.professional;

    utterance.rate = config.rate; 
    utterance.pitch = config.pitch;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [fullLocale, getBestVoice]);

  const speakCloud = useCallback(async (text: string, tone: VoiceTone = 'professional', lang: string = fullLocale) => {
    if (document.visibilityState === 'hidden') return;
    
    // Stop any existing speech
    cancelSpeech();
    
    try {
      setIsSpeaking(true);
      const base64Audio = await generateSpeech(text, tone, lang);
      
      if (base64Audio) {
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          if (audioRef.current === audio) {
            setIsSpeaking(false);
            audioRef.current = null;
          }
        };
        
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          if (audioRef.current === audio) {
            setIsSpeaking(false);
            audioRef.current = null;
          }
          speak(text, tone, lang);
        };
        
        audio.play().catch(e => {
          console.error('Audio play blocked or failed:', e);
          if (audioRef.current === audio) {
            setIsSpeaking(false);
            audioRef.current = null;
          }
          speak(text, tone, lang);
        });
      } else {
        speak(text, tone, lang);
      }
    } catch (err) {
      console.error('Gemini TTS failed, falling back to browser:', err);
      speak(text, tone, lang);
    }
  }, [fullLocale, speak, cancelSpeech]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak: speakCloud, // Use Cloud TTS as primary
    cancelSpeech,
    isSpeaking,
    error,
    isVisible,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}

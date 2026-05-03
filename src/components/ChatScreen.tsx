
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Mic, Loader2, ArrowLeft, Volume2, Copy, Check } from 'lucide-react';
import { Message, Language } from '../types';
import { chatWithAI, chatWithAIStream } from '../services/geminiService';
import { persistenceService } from '../services/persistenceService';
import { useVoiceAssistant, VoiceTone } from '../hooks/useVoiceAssistant';
import { t } from '../lib/translations';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface ChatScreenProps {
  onBack: () => void;
  selectedLanguage: Language;
  initialInput?: string;
}

export function ChatScreen({ onBack, selectedLanguage, initialInput }: ChatScreenProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<VoiceTone>('professional');
  const [isAutoVoiceEnabled, setIsAutoVoiceEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isListening, transcript, startListening, stopListening, speak, cancelSpeech, isSpeaking, isSupported, isVisible, error: voiceError } = useVoiceAssistant(selectedLanguage.code);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
      // Give it a tiny delay to ensure state is settled
      const t = setTimeout(() => {
        handleSend(initialInput);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [initialInput]);

  useEffect(() => {
    // If no messages yet, add the translated welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t('welcome_message', selectedLanguage.code),
          timestamp: Date.now(),
        },
      ]);
    }
  }, [selectedLanguage.code]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (chatId) {
      const unsub = persistenceService.subscribeToMessages(chatId, (newMessages) => {
        // Filter out locally added messages if they are now in the DB
        setMessages(newMessages as Message[]);
      });
      return () => unsub();
    }
  }, [chatId]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    // Stop listening if user manually sends
    if (isListening) stopListening();

    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = await persistenceService.createChat(selectedLanguage.name);
      if (currentChatId) setChatId(currentChatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsProcessing(true);

    try {
      if (currentChatId) {
        await persistenceService.saveMessage(currentChatId, userMessage);
      }

      const history: { role: 'user' | 'model', parts: [{ text: string }] }[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
          parts: [{ text: m.content }]
        }));

      // Create initial empty bot message for streaming
      const botMessageId = (Date.now() + 1).toString();
      let fullResponse = "";
      
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);
      
      setIsLoading(false); // Stop loading spinner as we are now streaming

      const responseStream = chatWithAIStream(textToSend, history, selectedLanguage.name);
      
      for await (const chunk of responseStream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, content: fullResponse } : m
        ));
      }

      const finalBotMessage: Message = {
        id: botMessageId,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      if (currentChatId) {
        await persistenceService.saveMessage(currentChatId, finalBotMessage);
      }
      
      setIsProcessing(false);
      
      // Auto speak response (optional, let's enable it as "assist" functionality)
      if (isAutoVoiceEnabled) {
        speak(fullResponse.replace(/[#*`]/g, ''), selectedTone);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">
      <header className="bg-white border-b border-gray-100 p-4 pt-10 flex items-center gap-4 z-10 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-inner">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">VoteSaathi AI</h2>
              <div 
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => isSpeaking && cancelSpeech()}
              >
                {isSpeaking ? (
                  <div className="flex gap-0.5 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-primary rounded-full"
                      />
                    ))}
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest ml-1">{t('speaking', selectedLanguage.code)}</span>
                  </div>
                ) : voiceError ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">{t('connection_busy', selectedLanguage.code)}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                      {t('saathi_active', selectedLanguage.code)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                m.role === 'user' ? "bg-primary text-white border-primary" : "bg-white text-primary border-slate-200"
              )}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-4 text-sm leading-relaxed shadow-sm relative group/msg",
                m.role === 'user' 
                  ? "bg-primary text-white chat-bubble-user" 
                  : "bg-white text-slate-700 border border-slate-200 chat-bubble-ai",
                (m.role === 'assistant' && isSpeaking && messages[messages.length - 1]?.id === m.id) ? "ring-2 ring-primary/20" : ""
              )}>
                {m.role === 'assistant' && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(m.content);
                    }}
                    className="absolute -top-2 -right-2 bg-white text-slate-400 p-1.5 rounded-full border border-slate-100 shadow-sm opacity-0 group-hover/msg:opacity-100 transition-opacity hover:text-primary active:scale-90"
                  >
                    <Copy size={12} />
                  </button>
                )}
                {m.role === 'assistant' && isSpeaking && messages[messages.length - 1]?.id === m.id && (
                  <div className="absolute -top-2 -right-8 bg-primary text-white p-1 rounded-full shadow-sm animate-bounce">
                    <Volume2 size={10} />
                  </div>
                )}
                <div className="markdown-body">
                  <ReactMarkdown>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center border border-gray-100">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={16} />
                <span className="text-sm text-gray-500 font-medium italic">{t('thinking', selectedLanguage.code)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0 mb-20 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest mr-1">{t('tone', selectedLanguage.code)}:</span>
            {(['friendly', 'professional', 'clear'] as VoiceTone[]).map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border",
                  selectedTone === tone 
                    ? "bg-primary text-white border-primary shadow-sm" 
                    : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                )}
              >
                {tone}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

          <button 
            onClick={() => setIsAutoVoiceEnabled(!isAutoVoiceEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border",
              isAutoVoiceEnabled 
                ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                : "bg-slate-50 text-slate-400 border-slate-100"
            )}
          >
            <Volume2 size={12} className={isAutoVoiceEnabled ? "text-indigo-500" : "text-slate-400"} />
            {t('voice_out', selectedLanguage.code)}
          </button>
        </div>

        <div className="bg-gray-50 rounded-[2rem] p-2 flex items-center gap-2 border-2 border-transparent focus-within:border-primary/20 transition-all">
          <button 
            onClick={isListening ? stopListening : startListening}
            className={cn(
              "p-3 rounded-full transition-all",
              isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-400 hover:text-primary"
            )}
            disabled={!isSupported}
          >
            <Mic size={22} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('type_question', selectedLanguage.code)}
            className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-sm placeholder:text-gray-400"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-full transition-all",
              input.trim() ? "bg-primary text-white scale-100" : "bg-gray-200 text-gray-400 scale-90"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

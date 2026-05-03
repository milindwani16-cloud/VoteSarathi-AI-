import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { ElectionScreen } from './components/ElectionScreen';
import { NewsVerifyScreen } from './components/NewsVerifyScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { SUPPORTED_LANGUAGES } from './constants';
import { Language } from './types';
import { Globe } from 'lucide-react';
import { t } from './lib/translations';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [initialChatInput, setInitialChatInput] = useState('');
  const [language, setLanguage] = useState<Language | null>(() => {
    const saved = localStorage.getItem('votesaathi_lang');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (language) {
      localStorage.setItem('votesaathi_lang', JSON.stringify(language));
    }
  }, [language]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  if (showSplash) {
    const splashLang = language?.code || 'en';
    return (
      <div className="mobile-container flex items-center justify-center navy-brand">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 saffron-accent rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
            <Globe className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{t('app_name', splashLang)}</h1>
          <p className="text-white/70 text-xs uppercase tracking-[0.3em] font-bold">{t('tagline', splashLang)}</p>
          <div className="flex gap-1 justify-center pt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-white rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="mobile-container bg-surface flex flex-col p-8 space-y-12">
        <header className="space-y-6 pt-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 saffron-accent rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Onboarding</h2>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                {t('onboarding_title', 'en')}
              </h1>
            </div>
          </div>
          <p className="text-slate-500 font-medium">{t('onboarding_subtitle', 'en')}</p>
        </header>

        <div className="grid grid-cols-2 gap-4 flex-1">
          {SUPPORTED_LANGUAGES.map((lang, idx) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setLanguage(lang)}
              className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-primary/40 hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-2 group"
            >
              <span className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{lang.nativeName}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{lang.name}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-widest pb-8">
          {t('change_later', 'en')}
        </p>
      </div>
    );
  }

  const navigateToChat = (input?: string) => {
    if (input) setInitialChatInput(input);
    else setInitialChatInput('');
    setActiveTab('chat');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen selectedLanguage={language} onNavigate={navigateToChat} />;
      case 'chat': return (
        <ChatScreen 
          selectedLanguage={language} 
          initialInput={initialChatInput} 
          onBack={() => {
            setInitialChatInput('');
            setActiveTab('home');
          }} 
        />
      );
      case 'info': return <ElectionScreen selectedLanguage={language} />;
      case 'news': return <NewsVerifyScreen selectedLanguage={language} />;
      case 'settings': return <SettingsScreen selectedLanguage={language} onLanguageChange={setLanguage} />;
      default: return <HomeScreen selectedLanguage={language} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="mobile-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col h-full bg-surface"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} selectedLanguageCode={language.code} />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Languages, HelpCircle, FileText, LogOut, ChevronRight, Globe, LogIn } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';
import { cn } from '../lib/utils';
import { t } from '../lib/translations';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface SettingsScreenProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function SettingsScreen({ selectedLanguage, onLanguageChange }: SettingsScreenProps) {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const lang = selectedLanguage.code;

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => auth.signOut();

  return (
    <div className="flex-1 overflow-y-auto pb-24 space-y-8 bg-slate-50">
      <header className="navy-brand text-white px-8 py-10 flex items-center gap-6 shadow-lg rounded-b-[2.5rem]">
        <div className="relative">
          <div className="w-20 h-20 saffron-accent rounded-3xl flex items-center justify-center text-white shadow-xl overflow-hidden border-2 border-white rotate-3">
            {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover -rotate-3" /> : <User size={40} className="-rotate-3" />}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.displayName || 'Namaste!'}
          </h1>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
            {user ? user.email : t('profile', lang)}
          </p>
        </div>
      </header>

      <div className="px-5 space-y-6">
        {!user && (
          <button 
            onClick={handleLogin}
            className="w-full p-6 navy-brand text-white rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg active:scale-95 transition-all border border-white/10"
          >
            <LogIn size={20} className="text-accent" />
            {t('login_google', lang)}
          </button>
        )}

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 leading-none">{t('preferences', lang)}</h3>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                  <Globe size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{t('language', lang)}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{selectedLanguage.name}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang)}
                    className={cn(
                      "p-3 rounded-xl text-xs font-bold transition-all border",
                      selectedLanguage.code === lang.code
                        ? "navy-brand text-white border-navy shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-navy"
                    )}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">{t('support_legal', lang)}</h3>
          <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
            {[
              { id: 'help', label: t('help_center', lang), icon: HelpCircle, color: 'text-orange-500' },
              { id: 'privacy', label: t('privacy_policy', lang), icon: FileText, color: 'text-gray-500' },
              { id: 'logout', label: t('logout', lang), icon: LogOut, color: 'text-red-500' },
            ].map((item, i, arr) => (
              <button 
                key={item.id}
                onClick={item.id === 'logout' ? handleLogout : undefined}
                className={cn(
                  "w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors",
                  i !== arr.length - 1 && "border-b border-gray-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gray-50 ${item.color} rounded-2xl`}>
                    <item.icon size={20} />
                  </div>
                  <span className="font-bold text-gray-800">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="text-center space-y-2 opacity-40 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest">VoteSaathi AI v1.0.0</p>
        <p className="text-[10px]">&copy; 2026 Developed for Citizen Empowerment</p>
      </div>
    </div>
  );
}

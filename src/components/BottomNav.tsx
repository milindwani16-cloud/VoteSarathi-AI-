
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, MessageSquare, Info, ShieldCheck, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

import { t } from '../lib/translations';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLanguageCode: string;
}

export function BottomNav({ activeTab, setActiveTab, selectedLanguageCode }: BottomNavProps) {
  const ITEMS = [
    { id: 'home', icon: Home, label: t('home', selectedLanguageCode) },
    { id: 'chat', icon: MessageSquare, label: t('chat', selectedLanguageCode) },
    { id: 'info', icon: Info, label: t('elections', selectedLanguageCode) },
    { id: 'news', icon: ShieldCheck, label: t('verify', selectedLanguageCode) },
    { id: 'settings', icon: Settings, label: t('profile', selectedLanguageCode) },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 pb-6 pt-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center">
        {ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              id={`nav-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative px-2 py-1",
                isActive ? "text-primary scale-105" : "text-slate-400"
              )}
            >
              <div className="relative">
                <Icon size={20} className={cn("transition-all", isActive && "stroke-[2.5px]")} />
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.1em] transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

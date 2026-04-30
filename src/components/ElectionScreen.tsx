
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELECTION_TYPES } from '../constants';
import { Info, Calendar, Trophy, ArrowRight, BookOpen, BarChart2, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { FirstTimeVoterGuide } from './FirstTimeVoterGuide';
import { ElectionCharts } from './ElectionCharts';
import { IndiaMap } from './IndiaMap';
import { t } from '../lib/translations';
import { Language } from '../types';

interface ElectionScreenProps {
  selectedLanguage: Language;
}

export function ElectionScreen({ selectedLanguage }: ElectionScreenProps) {
  const lang = selectedLanguage.code;
  const [activeView, setActiveView] = useState<'list' | 'insights' | 'map'>('list');
  const [showGuide, setShowGuide] = useState(false);

  if (showGuide) {
    return <FirstTimeVoterGuide onBack={() => setShowGuide(false)} />;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 h-full flex flex-col">
      {/* Header */}
      <header className="navy-brand text-white px-8 py-10 rounded-b-[2.5rem] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 saffron-accent opacity-20 -mr-16 -mt-16 rounded-full blur-3xl"></div>
        <div className="relative z-10 pt-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 mb-2">Information Hub</h2>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">Election Guide</h1>
          <p className="text-white/60 text-xs mt-3 font-bold uppercase tracking-widest max-w-[80%] leading-relaxed">
            Every vote counts for a better India
          </p>
        </div>

        {/* View Toggle */}
        <div className="mt-8 flex bg-white/10 p-1 rounded-2xl backdrop-blur-sm border border-white/5 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveView('list')}
            className={cn(
              "shrink-0 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeView === 'list' ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            <Calendar size={14} />
            {t('elections', lang)}
          </button>
          <button 
            onClick={() => setActiveView('insights')}
            className={cn(
              "shrink-0 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeView === 'insights' ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            <BarChart2 size={14} />
            {t('insights', lang)}
          </button>
          <button 
            onClick={() => setActiveView('map')}
            className={cn(
              "shrink-0 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeView === 'map' ? "bg-white text-primary shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            <MapIcon size={14} />
            {t('map', lang)}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-8">
        {activeView === 'map' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <IndiaMap />
          </motion.div>
        ) : activeView === 'insights' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ElectionCharts />
          </motion.div>
        ) : (
          <div className="px-5 space-y-6">

            {ELECTION_TYPES.map((election, idx) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-3 rounded-2xl shadow-sm border",
                      election.type === 'Lok Sabha' ? "bg-slate-50 text-primary border-slate-100" : "bg-slate-50 text-success border-slate-100"
                    )}>
                      {election.type === 'Lok Sabha' ? <Trophy size={24} /> : <Calendar size={24} />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl border border-slate-100">
                      {election.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{election.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                    {election.description}
                  </p>
                  
                  <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Next Date</span>
                      <p className="text-xs font-bold text-slate-800">{election.date}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status</span>
                      <p className="text-xs font-bold text-primary">Active Planning</p>
                    </div>
                  </div>

                  <div className="mt-5 p-4 bg-slate-50 rounded-2xl flex items-start gap-3 border border-slate-100 shadow-inner">
                    <Info size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider leading-relaxed">
                      {election.importance}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Guide Section */}
            <section className="bg-gradient-to-br from-primary to-blue-800 p-8 rounded-3xl text-white text-center relative overflow-hidden shadow-xl border border-white/10 mb-8">
              <div className="relative z-10">
                <div className="w-16 h-16 saffron-accent mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg border-2 border-white/20 -rotate-3 group-hover:rotate-0 transition-transform">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Step-by-Step Guide</h2>
                <p className="text-white/70 text-xs font-medium mt-3 mb-8 px-4 leading-relaxed uppercase tracking-widest">Master the process of your first vote</p>
                <button 
                  onClick={() => setShowGuide(true)}
                  className="w-full bg-white text-primary font-bold py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="absolute top-0 left-0 w-32 h-32 saffron-accent opacity-10 rounded-full -ml-16 -mt-16 blur-3xl"></div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

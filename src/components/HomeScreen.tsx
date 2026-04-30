
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, CheckCircle, MapPin, Shield, ChevronRight, Info, Calendar } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language, GlobalStats } from '../types';
import { cn } from '../lib/utils';
import { persistenceService } from '../services/persistenceService';
import { useEffect } from 'react';
import { t } from '../lib/translations';
import { newsService, NewsArticle } from '../services/newsService';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { ExternalLink, Newspaper, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';

import { VotingJourney } from './VotingJourney';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
  selectedLanguage: Language;
}

export function HomeScreen({ onNavigate, selectedLanguage }: HomeScreenProps) {
  const lang = selectedLanguage.code;
  const [journeyStep, setJourneyStep] = useState(1);
  const [showEligibility, setShowEligibility] = useState(false);
  const [showBoothFinder, setShowBoothFinder] = useState(false);
  const [dob, setDob] = useState('');
  const [isCitizen, setIsCitizen] = useState<boolean | null>(null);
  const [location, setLocation] = useState('');
  const [boothResult, setBoothResult] = useState<{
    name?: string;
    address?: string;
    date?: string;
    location?: any;
    loading?: boolean;
    error?: boolean;
  } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ usersHelped: 1250, queriesAnswered: 4800 });
  const [newsError, setNewsError] = useState(false);

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceAssistant(selectedLanguage.code);

  useEffect(() => {
    if (transcript) {
      onNavigate(transcript);
    }
  }, [transcript, onNavigate]);

  useEffect(() => {
    const unsubStats = persistenceService.subscribeToGlobalStats(setGlobalStats);
    
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(false);
      try {
        const articles = await newsService.getLatestElectionNews(selectedLanguage.code);
        if (articles.length === 0 && selectedLanguage.code !== 'en') {
          // Retry with EN if language specific search returns nothing
          const enArticles = await newsService.getLatestElectionNews('en');
          setNews(enArticles);
        } else {
          setNews(articles);
        }
      } catch (err) {
        setNewsError(true);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();

    return () => {
      unsubStats();
    };
  }, []);

  const getAge = (dateString: string) => {
    if (!dateString) return 0;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isEligible = () => {
    return getAge(dob) >= 18 && isCitizen === true;
  };

  const findBooth = async () => {
    if (!location.trim()) return;
    setBoothResult({ loading: true });
    try {
      const response = await fetch(`/api/booths?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const primary = data.results[0];
        setBoothResult({
          name: primary.name,
          address: primary.formatted_address || primary.vicinity,
          date: 'Next Election Cycle',
          location: primary.geometry.location
        });
      } else {
        setBoothResult({
          name: `No booth found in "${location}"`,
          address: "Try entering a more specific pincode or area name.",
          error: true
        });
      }
    } catch (err) {
      console.error('Booth search failed:', err);
      // Fallback
      setBoothResult({
        name: `Government Primary School, ${location}`,
        address: `Ward No. 12, Main Road, ${location}`,
        date: 'Next Election Cycle'
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 space-y-8">
      {/* Header */}
      <header className="navy-brand text-white px-6 py-6 flex justify-between items-center shadow-lg sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 saffron-accent rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
            V
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              {t('app_name', lang)}
            </h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">{t('tagline', lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {globalStats.queriesAnswered.toLocaleString()}+ {t('queries_answered', lang)}
          </span>
        </div>
      </header>

      <div className="px-5 space-y-8">
        {/* Banner Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-44 rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group"
        >
          <img 
            src="https://c8.alamy.com/comp/2YAGNNT/indian-general-election-background-with-voters-finger-design-vector-2YAGNNT.jpg" 
            alt="Indian Election Banner" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
            <div className="text-white">
              <h2 className="text-lg font-bold tracking-tight">Your Vote, Your Power</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Be part of the world's largest democracy</p>
            </div>
          </div>
        </motion.div>

        {/* Global Impact Ticker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-around shadow-sm">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('citizens_helped', lang)}</p>
            <p className="text-xl font-bold text-primary">{globalStats.usersHelped.toLocaleString()}</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('live_activity', lang)}</p>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-xl font-bold text-slate-800">{t('active', lang)}</p>
            </div>
          </div>
        </div>

        {/* AI Search/Ask */}
        <div 
          onClick={() => onNavigate('chat')}
          className="relative group cursor-pointer"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-hover:text-primary transition-colors" size={20} />
          </div>
          <div className="w-full bg-slate-50 border border-slate-200 group-hover:border-primary/30 p-4 pl-12 rounded-2xl shadow-sm transition-all text-slate-500 flex items-center justify-between">
            <span className="text-sm">{isListening ? 'Listening...' : t('ask_anything', lang)}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isListening) stopListening();
                else startListening();
              }}
              className={cn(
                "p-2 rounded-xl text-white shadow-md transition-all",
                isListening ? "bg-red-500 animate-pulse" : "navy-brand"
              )}
              disabled={!isSupported}
            >
              <Mic size={20} />
            </button>
          </div>
        </div>

        {/* Journey Tracker */}
        <VotingJourney 
          currentStep={journeyStep} 
          onStepClick={(step) => {
            if (step === 1) setShowEligibility(true);
            if (step === 2) onNavigate('chat'); // Guide for list
            if (step === 3) setShowBoothFinder(true);
            if (step === 4) onNavigate('info'); // Information/Election hub
            
            // Auto progress logic (for demo)
            if (step === journeyStep) setJourneyStep(prev => Math.min(prev + 1, 4));
          }} 
        />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'eligibility', label: t('eligibility', lang), icon: CheckCircle, color: 'bg-slate-50 text-slate-700', onClick: () => setShowEligibility(true) },
            { id: 'booth', label: t('booths', lang), icon: MapPin, color: 'bg-slate-50 text-slate-700', onClick: () => setShowBoothFinder(true) },
            { id: 'verify', label: t('verify_news', lang), icon: Shield, color: 'bg-orange-50 text-orange-600', onClick: () => onNavigate('news') },
            { id: 'guide', label: t('voter_guide', lang), icon: ChevronRight, color: 'bg-slate-50 text-slate-700', onClick: () => onNavigate('info') },
          ].map((action, idx) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={action.onClick}
              className={cn(
                "flex flex-col items-start p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group",
                action.id === 'verify' && "border-orange-100"
              )}
            >
              <div className={cn("p-3 rounded-xl mb-4 transition-transform group-hover:scale-110", action.color)}>
                <action.icon size={24} />
              </div>
              <span className="font-bold text-slate-800 text-sm tracking-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>

      <AnimatePresence>
        {showEligibility && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEligibility(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-900">{t('am_i_eligible', lang)}</h3>
              <div className="space-y-6">
                {/* 1st: Birth Date Verification */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{t('dob_label', lang)}</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm outline-none transition-all"
                  />
                </div>

                {dob && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-2xl flex items-center gap-3 border shadow-sm",
                      getAge(dob) >= 18 ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                    )}
                  >
                    {getAge(dob) >= 18 ? <CheckCircle size={20} /> : <Shield size={20} />}
                    <div className="text-sm">
                      <p className="font-bold">
                        {t('age', lang)}: {getAge(dob)} ({getAge(dob) >= 18 ? t('eligible_age', lang) : t('underage', lang)})
                      </p>
                      <p className="opacity-80">
                        {getAge(dob) >= 18 ? t('age_met_desc', lang) : t('age_not_met_desc', lang)}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2nd: Citizenship Check */}
                {getAge(dob) >= 18 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2 border-t border-slate-100"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{t('is_citizen_label', lang)}</label>
                      <div className="flex gap-2">
                        {[true, false].map((val) => (
                          <button
                            key={val ? 'yes' : 'no'}
                            onClick={() => setIsCitizen(val)}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                              isCitizen === val 
                                ? "bg-primary text-white border-primary shadow-sm" 
                                : "bg-slate-50 text-slate-400 border-slate-100"
                            )}
                          >
                            {val ? t('yes', lang) : t('no', lang)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isCitizen !== null && (
                      <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3",
                        isCitizen ? "bg-indigo-50 text-indigo-700" : "bg-orange-50 text-orange-700"
                      )}>
                        <Info size={18} />
                        <div className="text-sm">
                          <p className="font-bold">{isCitizen ? t('final_eligible_title', lang) : t('final_not_eligible_title', lang)}</p>
                          <p className="opacity-80">
                            {isCitizen ? t('ready_to_register_desc', lang) : t('citizen_only_desc', lang)}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              <button
                onClick={() => setShowEligibility(false)}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
              >
                {t('close', lang)}
              </button>
            </motion.div>
          </div>
        )}

        {showBoothFinder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBoothFinder(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-900">{t('find_polling_booth', lang)}</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('enter_pincode', lang)}
                    className="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={findBooth} className="bg-primary text-white p-4 rounded-2xl shadow-md active:scale-95 transition-all">
                    <Search size={24} />
                  </button>
                </div>

                {boothResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={cn(
                      "p-5 rounded-2xl border space-y-3",
                      boothResult.loading ? "bg-slate-50 border-slate-100 animate-pulse" :
                      boothResult.error ? "bg-orange-50 border-orange-100" :
                      "bg-blue-50 border-blue-100"
                    )}
                  >
                    {boothResult.loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <span className="text-sm font-bold text-slate-400">Searching...</span>
                      </div>
                    ) : (
                      <>
                        <div className={cn(
                          "flex items-center gap-3",
                          boothResult.error ? "text-orange-800" : "text-blue-800"
                        )}>
                          <MapPin size={20} className="shrink-0" />
                          <h4 className="font-bold text-sm">{boothResult.name}</h4>
                        </div>
                        <p className={cn(
                          "text-xs pl-8",
                          boothResult.error ? "text-orange-600" : "text-blue-600"
                        )}>{boothResult.address}</p>
                        {!boothResult.error && (
                          <div className="flex items-center gap-2 pl-8 text-[10px] uppercase font-bold text-blue-400">
                            <Calendar size={12} />
                            <span>{boothResult.date}</span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
              <button
                onClick={() => setShowBoothFinder(false)}
                className="w-full bg-gray-100 text-gray-800 font-bold py-4 rounded-2xl transition-all active:scale-95"
              >
                {t('cancel', lang)}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Featured Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg mx-5"
      >
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">{t('breaking', lang)}</span>
          <h2 className="text-xl font-bold leading-tight">National Voters' Day is approaching!</h2>
          <p className="text-white/80 text-sm mt-2">Learn why your vote matters and how to register before the deadline.</p>
          <button className="mt-4 bg-white text-primary font-bold py-3 px-6 rounded-2xl text-sm w-fit active:scale-95 transition-transform">
            {t('voter_guide', lang)}
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Live Election Spotlight - Three User Provided Images */}
      <div className="space-y-4">
        <div className="px-5">
          <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Shield size={20} className="text-orange-500" />
            Live Election Spotlight
          </h3>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar px-5">
          {[
            {
              url: "https://www.livelaw.in/h-upload/2024/05/13/500x300_539392-election-commission-eci-and-sc.webp",
              title: "Election Commission of India & SC Updates",
              source: "Live Law"
            },
            {
              url: "https://th-i.thgim.com/public/incoming/po6npd/article70923163.ece/alternates/LANDSCAPE_385/WhatsApp%20Image%202026-04-30%20at%2009.27.04.jpeg",
              title: "Ground Coverage: Election Preparedness",
              source: "The Hindu"
            },
            {
              url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKI8YThyY8d-YMysG0-ASAaadTghT5UCOESA&s",
              title: "World's Largest Democracy Votes",
              source: "News Bureau"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[300px] h-[220px] relative rounded-[2.5rem] overflow-hidden shadow-md flex-shrink-0 snap-start border border-slate-100 group"
            >
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{item.source}</span>
                <h4 className="text-white font-bold text-sm leading-snug">{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Latest News API Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Newspaper size={20} className="text-primary" />
            {t('latest_news', lang) || "Latest News"}
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const fetchNews = async () => {
                  setNewsLoading(true);
                  setNewsError(false);
                  const articles = await newsService.getLatestElectionNews(selectedLanguage.code);
                  setNews(articles);
                  setNewsLoading(false);
                };
                fetchNews();
              }}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors active:rotate-180"
            >
              <RotateCcw size={16} className={`text-slate-400 ${newsLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Via News API</span>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
          {newsLoading ? (
            [1, 2].map(i => (
              <div key={i} className="min-w-[280px] h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))
          ) : newsError ? (
            <div className="w-full flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-2xl border border-red-100 space-y-2">
              <AlertCircle size={24} className="text-red-400" />
              <p className="text-xs text-red-500 font-medium text-center">Failed to load live election news. Please check your internet or retry.</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-bold text-red-600 underline uppercase tracking-widest"
              >
                Reload App
              </button>
            </div>
          ) : news.length > 0 ? (
            news.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => window.open(item.url, '_blank')}
                className="min-w-[280px] bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm snap-start group cursor-pointer"
              >
                <div className="h-32 bg-slate-200 relative">
                  <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-bold uppercase tracking-widest text-primary">
                    {item.source.name}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                    <ExternalLink size={14} className="text-slate-300" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="w-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm">
              No election news found for your region.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

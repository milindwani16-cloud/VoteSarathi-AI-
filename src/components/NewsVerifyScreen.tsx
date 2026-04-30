
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ShieldCheck, Clipboard, ExternalLink, Loader2, Info, Search, Image as ImageIcon, X } from 'lucide-react';
import { verifyNews } from '../services/geminiService';
import { persistenceService } from '../services/persistenceService';
import { NewsAnalysis, Language } from '../types';
import { cn } from '../lib/utils';
import { t } from '../lib/translations';

interface NewsVerifyScreenProps {
  selectedLanguage: Language;
}

export function NewsVerifyScreen({ selectedLanguage }: NewsVerifyScreenProps) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<NewsAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const lang = selectedLanguage.code;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if ((!input.trim() && !image) || isLoading) return;
    setIsLoading(true);
    const analysis = await verifyNews(input, selectedLanguage.name, image || undefined);
    setResult(analysis);
    setIsLoading(false);

    // Save result to Firestore
    persistenceService.saveVerification(input || "Image Verification", analysis);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 space-y-8 bg-slate-50">
      {/* Header */}
      <header className="navy-brand text-white px-8 py-10 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 saffron-accent opacity-20 -mr-16 -mt-16 rounded-full blur-3xl"></div>
        <div className="relative z-10 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-accent text-[10px] font-bold rounded uppercase tracking-widest text-navy">{t('ai_security', lang)}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('active_protection', lang)}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{t('misinformation_shield', lang)}</h1>
          <p className="text-white/60 text-[10px] mt-3 font-bold uppercase tracking-widest max-w-[80%] leading-relaxed">
            {t('verify_tagline', lang)}
          </p>
        </div>
      </header>

      <div className="px-5 space-y-6">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('paste_here', lang)}
            className="w-full bg-white border border-slate-200 focus:border-primary/20 rounded-3xl p-6 text-sm min-h-[160px] resize-none outline-none shadow-sm transition-all text-slate-700 font-medium"
          />
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button 
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setInput(text);
                } catch (err) {
                  console.warn('Clipboard read failed:', err);
                  // Optionally show a non-intrusive toast or message here if needed
                }
              }}
              className="p-3 bg-slate-50 text-slate-400 hover:text-primary transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-slate-100 rounded-xl"
            >
              <Clipboard size={16} />
              <span>{t('paste', lang)}</span>
            </button>
            <label className="p-3 bg-slate-50 text-slate-400 hover:text-primary transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-slate-100 rounded-xl cursor-pointer">
              <ImageIcon size={16} />
              <span>Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        {image && (
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/20 group">
            <img src={image} alt="Upload" className="w-full h-full object-cover" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={(!input.trim() && !image) || isLoading}
          className={cn(
            "w-full py-5 rounded-2xl font-bold text-sm shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3",
            input.trim() && !isLoading ? "navy-brand text-white" : "bg-slate-200 text-slate-400"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span className="uppercase tracking-widest">{t('analyzing', lang)}</span>
            </>
          ) : (
            <>
              <Search size={20} className="text-accent" />
              <span className="uppercase tracking-widest">{t('verify_now', lang)}</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={cn(
              "p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden",
              result.verdict === 'True' ? "bg-green-50 border-green-100" :
              result.verdict === 'Fake' ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"
            )}>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">{t('verdict', lang)}</span>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2",
                    result.verdict === 'True' ? "bg-green-600 text-white" :
                    result.verdict === 'Fake' ? "bg-red-600 text-white" : "bg-orange-600 text-white"
                  )}>
                    {result.verdict === 'True' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {result.verdict}
                  </div>
                </div>

                <h3 className={cn(
                  "text-2xl font-bold",
                  result.verdict === 'True' ? "text-green-900" :
                  result.verdict === 'Fake' ? "text-red-900" : "text-orange-900"
                )}>
                  {result.verdict === 'True' ? t('safe_to_trust', lang) : 
                   result.verdict === 'Fake' ? t('caution', lang) : t('mixed', lang)}
                </h3>

                <p className="text-sm leading-relaxed text-gray-700">
                  {result.explanation}
                </p>

                <div className="pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">{t('ai_confidence', lang)}</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          result.verdict === 'True' ? "bg-green-500" : "bg-orange-500"
                        )}
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold opacity-60">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg flex items-center gap-2 pl-2">
                <Info size={20} className="text-primary" />
                {t('credible_sources', lang)}
              </h4>
              <div className="grid gap-3">
                {result.sources?.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.startsWith('http') ? source : `https://www.google.com/search?q=${encodeURIComponent(source)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all"
                  >
                    <span className="text-sm font-medium text-gray-700 truncate mr-4">{source}</span>
                    <ExternalLink size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
          <Info size={24} className="text-primary shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-blue-900">{t('how_it_works', lang)}</h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              {t('how_it_works_desc', lang)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

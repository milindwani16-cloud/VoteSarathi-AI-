
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { t } from '../lib/translations';

interface GuideProps {
  onBack: () => void;
  lang: string;
}

export function FirstTimeVoterGuide({ onBack, lang }: GuideProps) {
  const steps = [
    {
      title: t('guide_step1_title' as any, lang),
      description: t('guide_step1_desc' as any, lang),
      icon: CheckCircle2,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      title: t('guide_step2_title' as any, lang),
      description: t('guide_step2_desc' as any, lang),
      icon: Info,
      color: 'text-orange-500 bg-orange-50'
    },
    {
      title: t('guide_step3_title' as any, lang),
      description: t('guide_step3_desc' as any, lang),
      icon: AlertCircle,
      color: 'text-green-500 bg-green-50'
    },
    {
      title: t('guide_step4_title' as any, lang),
      description: t('guide_step4_desc' as any, lang),
      icon: HelpCircle,
      color: 'text-purple-500 bg-purple-50'
    },
    {
      title: t('guide_step5_title' as any, lang),
      description: t('guide_step5_desc' as any, lang),
      icon: CheckCircle2,
      color: 'text-red-500 bg-red-50'
    }
  ];

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <header className="p-6 pt-12 flex items-center gap-4 bg-surface border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{t('first_time_guide', lang)}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
          <h2 className="text-primary font-bold text-lg mb-2">{t('welcome_democracy', lang)}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t('guide_intro', lang)}
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-6 relative"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm z-10", step.color)}>
                <step.icon size={24} />
              </div>
              <div className="space-y-1 pt-1">
                <h3 className="font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 space-y-4">
          <h4 className="font-bold text-orange-900 flex items-center gap-2">
            <AlertCircle size={20} />
            {t('important_tip', lang)}
          </h4>
          <p className="text-xs text-orange-800 leading-relaxed">
            {t('mobile_warning', lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

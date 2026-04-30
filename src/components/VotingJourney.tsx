
import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, ArrowRight, UserPlus, Search, Info, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  action: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Eligibility & Identity',
    description: 'Ensure you are 18+ and an Indian citizen with a valid ID proof.',
    icon: UserPlus,
    action: 'Check Eligibility'
  },
  {
    id: 2,
    title: 'Registration',
    description: 'Find your name in the Voter List or fill Form 6 to register as a new voter.',
    icon: Search,
    action: 'Search Voter List'
  },
  {
    id: 3,
    title: 'Booth Awareness',
    description: 'Locate your polling station and research the candidates in your area.',
    icon: Info,
    action: 'Find My Booth'
  },
  {
    id: 4,
    title: 'Cast Your Vote',
    description: 'Visit the polling station on election day with your EPIC (Voter ID) or valid ID.',
    icon: Smartphone,
    action: 'View Election Dates'
  }
];

interface VotingJourneyProps {
  currentStep?: number;
  onStepClick?: (stepId: number) => void;
}

export function VotingJourney({ currentStep = 1, onStepClick }: VotingJourneyProps) {
  return (
    <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mx-5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Your Voting Journey</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">4-Step Action Plan for Citizens</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {Math.round(((currentStep - 1) / 4) * 100)}% Complete
        </div>
      </div>

      <div className="relative space-y-8">
        {/* Progress Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-100 rounded-full">
           <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${((currentStep - 1) / 3) * 100}%` }}
            className="w-full bg-primary rounded-full transition-all duration-500"
          />
        </div>

        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 relative z-10"
            >
              <div className="shrink-0 pt-1">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                  isCompleted ? "bg-primary text-white" : 
                  isActive ? "bg-primary text-white scale-110 shadow-primary/20" : 
                  "bg-white border-2 border-slate-100 text-slate-300"
                )}>
                  {isCompleted ? <CheckCircle2 size={22} /> : 
                   isActive ? <step.icon size={22} /> : 
                   <Circle size={22} />}
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h4 className={cn(
                  "text-sm font-bold tracking-tight transition-colors",
                  isActive ? "text-slate-800" : isCompleted ? "text-slate-600" : "text-slate-400"
                )}>
                  {step.title}
                </h4>
                <p className={cn(
                  "text-xs leading-relaxed",
                  isActive ? "text-slate-600" : "text-slate-400"
                )}>
                  {step.description}
                </p>
                
                {isActive && (
                  <motion.button 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onStepClick?.(step.id)}
                    className="mt-3 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.15em] py-2 px-4 bg-primary/5 rounded-xl border border-primary/10 active:scale-95 transition-all"
                  >
                    {step.action}
                    <ArrowRight size={14} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Info size={12} className="text-primary" />
          Pro Tip: Link your AADHAAR for a smoother experience
        </p>
      </div>
    </section>
  );
}

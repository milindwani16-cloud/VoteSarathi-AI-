
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface GuideProps {
  onBack: () => void;
}

export function FirstTimeVoterGuide({ onBack }: GuideProps) {
  const steps = [
    {
      title: 'Registration',
      description: 'The first step is to ensure your name is on the Electoral Roll. You can register online via NVSP portal.',
      icon: CheckCircle2,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      title: 'Find your Booth',
      description: 'Check your polling station location and the serial number in the Electoral Roll.',
      icon: Info,
      color: 'text-orange-500 bg-orange-50'
    },
    {
      title: 'Documents to Carry',
      description: 'Carry your Voter ID (EPIC) card. If you don\'t have it, you can carry any of the 12 approved ID documents like Aadhaar, PAN, etc.',
      icon: AlertCircle,
      color: 'text-green-500 bg-green-50'
    },
    {
      title: 'At the Polling Station',
      description: 'First official will check your name. Second will mark your finger with ink and take your signature.',
      icon: HelpCircle,
      color: 'text-purple-500 bg-purple-50'
    },
    {
      title: 'Casting the Vote',
      description: 'Press the blue button against the candidate of your choice on the EVM. A red lamp will glow and a beep will be heard.',
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
        <h1 className="text-xl font-bold">First Time Voter Guide</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
          <h2 className="text-primary font-bold text-lg mb-2">Welcome to Democracy!</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Casting your first vote is a significant milestone. This guide will help you navigate the process seamlessly.
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
            Important Tip
          </h4>
          <p className="text-xs text-orange-800 leading-relaxed">
            Mobile phones, cameras, or any electronic gadgets are strictly NOT allowed inside the polling booth. Leave them at home or with a trusted person.
          </p>
        </div>
      </div>
    </div>
  );
}

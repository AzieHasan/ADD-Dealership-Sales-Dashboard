/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, X, ArrowRight, Play, BookOpen, Filter, CheckCircle2 } from 'lucide-react';
import { IngressLogo } from './IngressLogo';

interface GuideWelcomePromptProps {
  onStartTour: () => void;
  onOpenExplainer: () => void;
  isTourOpen?: boolean;
}

export function GuideWelcomePrompt({ onStartTour, onOpenExplainer, isTourOpen }: GuideWelcomePromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or completed the guide
    const dismissed = localStorage.getItem('ingress_guide_prompt_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('ingress_guide_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  const handleStartTour = () => {
    handleDismiss();
    onStartTour();
  };

  const handleOpenExplainer = () => {
    handleDismiss();
    onOpenExplainer();
  };

  if (!isVisible || isTourOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-5 right-5 z-40 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] font-sans select-none"
      >
        <div 
          className="bg-white border-2 border-[#8f043b] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl relative overflow-hidden text-black"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          {/* Ingress Maroon top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#8f043b]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-500 hover:text-black p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Dismiss prompt"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <IngressLogo className="h-6 w-auto flex-shrink-0 mt-0.5" />

            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8f043b] font-black">
                  INGRESS ADD AUTO GUIDE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-black leading-snug" style={{ color: '#000000' }}>
                How to Use FILTER PARAMETERS & Read Dashboard
              </h4>
              <p className="text-xs text-black font-semibold mt-1 leading-relaxed" style={{ color: '#000000' }}>
                Take a 60-second guided tour with sample data across <strong className="font-black text-black">Mitsubishi Puchong</strong>, <strong className="font-black text-black">PERODUA The Curve</strong>, and <strong className="font-black text-black">PROTON e.MAS Bangi</strong>.
              </p>
            </div>
          </div>

          {/* Sample Snippet Callout - Clean Light Background */}
          <div 
            className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-black font-bold flex items-center justify-between"
            style={{ backgroundColor: '#f8fafc', color: '#000000' }}
          >
            <span style={{ color: '#000000' }}>Sample Scope: August 2026</span>
            <span className="text-[#8f043b] font-black">RM 78.45M Revenue • 94 Bookings</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200">
            <button
              onClick={handleStartTour}
              className="flex-1 py-1.5 px-3 text-black text-xs font-mono font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border hover:bg-rose-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#8f043b', borderWidth: '1.5px', color: '#000000' }}
            >
              <Play className="w-3 h-3 fill-[#850536] text-[#850536]" />
              <span className="text-black font-bold" style={{ color: '#000000' }}>Start Auto Guide</span>
            </button>

            <button
              onClick={handleOpenExplainer}
              className="py-1.5 px-3 text-black border text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
            >
              <BookOpen className="w-3 h-3 text-[#850536]" />
              <span className="text-black font-bold" style={{ color: '#000000' }}>Handbook</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

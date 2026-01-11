import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import WaitlistModal from './components/WaitlistModal';
import { initAnalytics, analytics } from './lib/analytics';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'form' | 'chat'>('form');
  const [modalTrigger, setModalTrigger] = useState<'auto' | 'button' | 'cta'>('auto');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // Sequence Timing:
    // 0.0s: Mount
    // 4.6s: Trigger Auto-Open
    const timer = setTimeout(() => {
      setIsModalOpen((prev) => {
        if (!hasInteracted && !prev) {
          setModalMode('form');
          setModalTrigger('auto');
          return true;
        }
        return prev;
      });
    }, 4600);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const openModal = (
    mode: 'form' | 'chat' = 'form',
    trigger: 'auto' | 'button' | 'cta' = 'button'
  ) => {
    setHasInteracted(true);
    setModalMode(mode);
    setModalTrigger(trigger);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setHasInteracted(true);
    setIsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-dark text-brand-light overflow-hidden font-sans selection:bg-brand-orange selection:text-brand-dark">
      
      {/* Moving Technical Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
        <div className="absolute -inset-[100%] w-[300%] h-[300%] bg-grid-pattern bg-grid origin-center rotate-12" />
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-brand-dark/10 to-black/30 pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <Hero
            onCtaClick={() => {
              analytics.ctaClicked('hero');
              openModal('form', 'cta');
            }}
            isModalOpen={isModalOpen}
          />
        </main>

        <footer className="py-6 text-center text-brand-orange/40 text-[10px] uppercase tracking-widest font-normal">
          © {new Date().getFullYear()} Stockbase Inc.
        </footer>
      </div>

      {/* Modal Layer */}
      <AnimatePresence>
        {isModalOpen && (
          <WaitlistModal 
            onClose={closeModal} 
            initialMode={modalMode} 
            openTrigger={modalTrigger}
          />
        )}
      </AnimatePresence>

      {/* Floating Re-open Button (Visible when modal is closed) */}
      <AnimatePresence>
        {!isModalOpen && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => {
                    analytics.ctaClicked('floating_button');
                    analytics.chatModeEntered('button');
                    openModal('chat', 'button');
                }}
                className="fixed bottom-6 right-6 z-40 bg-slate-900/80 border border-brand-orange/40 text-brand-orange p-3 rounded-full shadow-[0_0_20px_rgba(212,165,116,0.15)] hover:border-brand-orange hover:shadow-[0_0_30px_rgba(212,165,116,0.3)] hover:scale-105 transition-all group backdrop-blur-sm"
            >
                <div className="absolute inset-0 bg-brand-orange/10 rounded-full animate-ping opacity-20 pointer-events-none" />
                <MessageSquare className="w-6 h-6" />
            </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  onCtaClick: () => void;
  onTypingComplete?: () => void;
  isModalOpen?: boolean;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick, isModalOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const typeText = "Stop guessing. Start tracking.";

  return (
    <div className="text-center w-full max-w-[90rem] mx-auto flex flex-col items-center">
      {/* Business Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 mb-8 md:mb-12 border border-brand-orange/30 bg-brand-orange/5 text-brand-orange text-[11px] font-sans font-normal tracking-widest uppercase rounded-sm"
      >
        <span className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
        Limited Availability
      </motion.div>

      {/* Main Headline - Phudu Ultra Bold (Extrabold) - Increased Sizes */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-extrabold tracking-tight text-brand-orange mb-8 px-4 uppercase drop-shadow-subtle leading-[0.9]"
      >
        The operating system <br/> for trades.
      </motion.h1>

      {/* Subheadline - Typing Animation */}
      <div className="text-lg sm:text-xl md:text-2xl text-brand-light/90 max-w-2xl mx-auto mb-12 md:mb-16 font-sans font-normal leading-relaxed px-4 min-h-[4rem]">
        <p className="inline-block">
            {typeText.split("").map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 0, // Instant appearance for "typing" feel
                        delay: 0.8 + (index * 0.05) // Start after hero animation
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </p>
        <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + (typeText.length * 0.05) + 0.5, duration: 1 }}
            className="text-brand-orange/70 text-sm md:text-base mt-4 block font-normal"
        >
            Take control of your inventory and logistics.
        </motion.span>
      </div>

      {/* Blueprint Button */}
      <div className="h-[72px] flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {!isModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
              transition={{ duration: 0.3 }}
              className="relative group"
            >
              <button
                onClick={onCtaClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative px-8 md:px-10 py-4 md:py-5 bg-transparent text-brand-orange font-sans font-normal text-lg tracking-widest uppercase focus:outline-none"
              >
                {/* Button Background - Darker steel */}
                <motion.div 
                  className="absolute inset-0 bg-slate-900/60"
                  animate={{ opacity: isHovered ? 0.8 : 0.4 }}
                />
                
                {/* Content */}
                <span className="relative z-10 flex items-center gap-3 text-sm md:text-base">
                  Join Waitlist
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1 text-brand-orange' : 'text-brand-orange/50'}`} />
                </span>

                {/* Mechanical SVG Borders - Drawing Effect */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  <motion.rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="none"
                    stroke="#d4a574"
                    strokeWidth="1"
                    strokeOpacity={isHovered ? 1 : 0.5}
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: 1,
                      pathOffset: 0
                    }}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: 5
                    }}
                  />
                  {/* Inner guide lines (corners only) */}
                  <path d="M 0 10 L 0 0 L 10 0" fill="none" stroke="#d4a574" strokeWidth="2" opacity="0.8" />
                  <path d="M 100% 10 L 100% 0 L calc(100% - 10px) 0" fill="none" stroke="#d4a574" strokeWidth="2" opacity="0.8" />
                  <path d="M 0 calc(100% - 10px) L 0 100% L 10 100%" fill="none" stroke="#d4a574" strokeWidth="2" opacity="0.8" />
                  <path d="M 100% calc(100% - 10px) L 100% 100% L calc(100% - 10px) 100%" fill="none" stroke="#d4a574" strokeWidth="2" opacity="0.8" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Hero;
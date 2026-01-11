import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Loader2, ChevronRight, ArrowLeft, Sparkles, Send, PlayCircle, Layers, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface WaitlistModalProps {
  onClose: () => void;
  initialMode?: 'form' | 'chat';
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `You are the specialized AI Solution Engineer for Stockbase. 
Stockbase is the "Operating System for Trades" - a next-generation platform for trade contractors (Plumbing, HVAC, Electrical).

CORE KNOWLEDGE BASE:
- **Mission:** Eliminate the "guessing game" in inventory and logistics.
- **Function:** specialized inventory tracking, procurement automation, and warehouse/van logistics.
- **Integrations:** We integrate deeply with Simpro, ServiceTitan, and AroFlo.
- **Features:** Real-time stock levels, project allocation, supplier integration, waste tracking (e.g., copper pipe scraps).
- **Status:** Currently in highly exclusive Closed Beta.

BEHAVIORAL RULES:
1. Keep answers "industrial/professional" in tone. Avoid fluff, but be comprehensive if needed.
2. Do not use emojis. Use precise language.
3. If asked about pricing, say "Pricing is customized based on volume during the beta period."
4. If asked "Does it work offline?", answer "Yes, the mobile app creates a local ledger that syncs when connection is restored."
5. If the user asks for a "simulation", briefly describe a scenario: "Simulation: Technician takes 15mm copper elbow. Barcode scan > Stockbase deducts from Van 4 > Syncs to Simpro Job #2938 > Procurement alert sent for restock."`;

const MAX_FREE_INTERACTIONS = 3;

const SUGGESTIONS = [
    { text: "Run a logistics simulation", highlight: "logistics simulation", icon: PlayCircle },
    { text: "How deep is Simpro integration?", highlight: "Simpro integration", icon: Layers },
    { text: "Can you track copper waste?", highlight: "copper waste", icon: HelpCircle },
];

const WaitlistModal: React.FC<WaitlistModalProps> = ({ onClose, initialMode = 'form' }) => {
  const [mode, setMode] = useState<'form' | 'chat'>(initialMode);
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'complete'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (mode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  // Load chat history/count
  useEffect(() => {
    const savedCount = localStorage.getItem('stockbase_chat_count');
    if (savedCount) setInteractionCount(parseInt(savedCount, 10));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('complete'), 1500);
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || inputValue;
    
    if (!textToSend.trim() || isLoading) return;

    if (interactionCount >= MAX_FREE_INTERACTIONS) {
      setGateMessage("Preview limit reached. Join the waitlist to continue.");
      setMode('form');
      return;
    }

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: SYSTEM_INSTRUCTION, maxOutputTokens: 1000 },
        history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      });

      const result = await chat.sendMessageStream({ message: textToSend });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].text = fullResponse;
            return newHistory;
          });
        }
      }

      const newCount = interactionCount + 1;
      setInteractionCount(newCount);
      localStorage.setItem('stockbase_chat_count', newCount.toString());

      if (newCount >= MAX_FREE_INTERACTIONS) {
        setTimeout(() => {
           setGateMessage("Questions answered. Please secure your spot to continue.");
           setMode('form');
        }, 2500);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Main Container - Fixed Height to prevent jumping */}
      <div className="relative w-[95vw] max-w-[500px] h-[650px] flex flex-col pointer-events-none">
        
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full rounded-xl overflow-hidden z-30 flex flex-col flex-grow border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] pointer-events-auto"
        >
            {/* Top Shine */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60" />

            <div className="flex-grow flex flex-col h-full">
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20 bg-slate-900/50">
                    <div className="flex items-center gap-3 w-full">
                        <AnimatePresence mode="wait">
                            {mode === 'chat' ? (
                                <motion.div 
                                    key="chat-header"
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    className="flex items-center justify-between w-full"
                                >
                                    <button 
                                        onClick={() => setMode('form')}
                                        className="flex items-center gap-2 text-brand-light/50 hover:text-brand-light transition-colors group px-2 py-1 -ml-2 rounded-md hover:bg-white/5"
                                    >
                                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/>
                                        <span className="text-xs uppercase tracking-widest font-bold">Back</span>
                                    </button>
                                    
                                    {/* Interaction Dots in Header */}
                                    <div className="flex items-center gap-1.5 mx-auto">
                                        {[...Array(MAX_FREE_INTERACTIONS)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`h-1 w-1 rounded-full transition-colors ${
                                                    i < Math.max(0, MAX_FREE_INTERACTIONS - (Math.max(0, MAX_FREE_INTERACTIONS - interactionCount))) ? 'bg-brand-orange' : 'bg-brand-light/10'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <div className="w-10"></div> 
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="form-header"
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-sm font-heading font-bold text-brand-light tracking-wide">
                                        Priority Access
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {mode !== 'chat' && (
                        <button 
                            onClick={onClose}
                            className="p-2 -mr-2 text-brand-light/30 hover:text-brand-light transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                     {mode === 'chat' && (
                        <button 
                            onClick={onClose}
                            className="p-2 -mr-2 text-brand-light/30 hover:text-brand-light transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Body Content Switcher */}
                <div className="flex-grow flex flex-col relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        {formState === 'complete' ? (
                            <SuccessView onClose={onClose} />
                        ) : mode === 'chat' ? (
                            <ChatView 
                                key="chat"
                                messages={messages}
                                inputValue={inputValue}
                                setInputValue={setInputValue}
                                handleSendMessage={handleSendMessage}
                                isLoading={isLoading}
                                messagesEndRef={messagesEndRef}
                                remaining={Math.max(0, MAX_FREE_INTERACTIONS - interactionCount)}
                            />
                        ) : (
                            <FormView 
                                key="form"
                                formState={formState}
                                handleSubmit={handleSubmit}
                                onSwitchToChat={() => setMode('chat')}
                                gateMessage={gateMessage}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const SuccessView = ({ onClose }: { onClose: () => void }) => (
    <motion.div 
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center text-center py-6 h-full w-full px-8 relative z-20"
    >
        <div className="relative w-20 h-20 mb-6">
            <motion.div
               className="absolute inset-0 bg-brand-orange/5 rounded-full"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1.5, opacity: [0, 0.4, 0] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
            <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(212,165,116,0.2)]" viewBox="0 0 100 100">
                <motion.circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#d4a574"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    initial={{ pathLength: 0, rotate: -90 }}
                    animate={{ pathLength: 1, rotate: -90 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                <motion.path
                    d="M 32 52 L 45 65 L 68 38"
                    fill="none"
                    stroke="#d4a574"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
                />
            </svg>
        </div>
        <h3 className="text-2xl font-heading font-extrabold text-brand-light mb-3 tracking-tight">You're on the list.</h3>
        <p className="text-brand-light/60 text-base font-sans font-normal mb-8 max-w-[260px] leading-relaxed">We've reserved your spot. Watch your inbox.</p>
        <button onClick={onClose} className="text-xs text-brand-light/30 hover:text-brand-orange transition-colors uppercase tracking-widest">
            Close
        </button>
    </motion.div>
);

const FormView = ({ formState, handleSubmit, onSwitchToChat, gateMessage }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="p-8 md:p-12 h-full flex flex-col justify-center relative z-20"
    >
        {gateMessage && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-brand-orange/5 border border-brand-orange/20 rounded-md text-xs text-brand-orange/90 flex items-center gap-3 font-sans"
            >
                <div className="w-1.5 h-1.5 bg-brand-orange rounded-full shrink-0" />
                {gateMessage}
            </motion.div>
        )}

        <div className="mb-10">
            <h2 className="text-2xl font-heading font-extrabold text-brand-light mb-2 tracking-tight">Access Beta</h2>
            <p className="text-brand-light/50 text-sm leading-relaxed max-w-sm font-sans font-normal">
                Enter your details to secure priority access.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <InputGroup id="first" label="First Name" icon={User} delay={0.1} />
                <InputGroup id="last" label="Last Name" icon={User} delay={0.15} />
            </div>
            <InputGroup id="email" label="Work Email" icon={Mail} type="email" delay={0.2} />
            
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                type="submit"
                disabled={formState === 'submitting'}
                className="w-full mt-4 bg-brand-orange hover:bg-[#c29363] text-brand-dark font-sans font-bold text-sm tracking-widest uppercase py-4 rounded-md transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-orange/5"
            >
                {formState === 'submitting' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        Secure Spot
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </>
                )}
            </motion.button>
        </form>

        <div className="mt-8 flex items-center justify-center">
             <button 
                onClick={onSwitchToChat}
                type="button"
                className="flex items-center gap-2 text-xs text-brand-light/30 hover:text-brand-orange transition-colors uppercase tracking-widest group font-sans"
             >
                <Sparkles size={12} />
                <span className="border-b border-transparent group-hover:border-brand-orange pb-0.5">Got Questions?</span>
             </button>
        </div>
    </motion.div>
);

const ChatView = ({ messages, inputValue, setInputValue, handleSendMessage, isLoading, messagesEndRef, remaining }: any) => (
    <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="flex flex-col h-full relative z-20"
    >
        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32">
            {messages.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full space-y-4 pb-12"
                >
                    <div className="text-brand-light/50 text-xs uppercase tracking-widest mb-2 font-bold">Suggested Questions</div>
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={(e) => handleSendMessage(e, s.text)}
                            className="w-full max-w-xs p-4 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-brand-orange/10 hover:border-brand-orange/30 text-left transition-all group flex items-center gap-3"
                        >
                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-brand-orange group-hover:text-brand-dark transition-colors">
                                <s.icon size={16} />
                            </div>
                            <span className="text-sm text-brand-light group-hover:text-white transition-colors">
                                {s.text.split(s.highlight).map((part, index, arr) => (
                                    <React.Fragment key={index}>
                                        {part}
                                        {index < arr.length - 1 && (
                                            <span className="font-heading font-extrabold text-brand-orange group-hover:text-brand-orange tracking-tight">
                                                {s.highlight}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </span>
                        </button>
                    ))}
                </motion.div>
            )}

            {messages.map((msg: Message, idx: number) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-lg ${
                        msg.role === 'model' 
                            ? 'bg-brand-orange shadow-brand-orange/20' 
                            : 'bg-slate-800 border border-white/5'
                    }`}>
                        {msg.role === 'model' 
                            ? <Layers size={16} className="text-slate-900" strokeWidth={2.5} />
                            : <User size={14} className="text-brand-orange" /> 
                        }
                    </div>

                    {/* Bubble */}
                    <div className={`px-5 py-3.5 text-sm leading-relaxed backdrop-blur-sm shadow-sm max-w-[75%] ${
                         msg.role === 'model' 
                            ? 'bg-white/5 border border-white/10 text-brand-light rounded-2xl rounded-tl-sm' 
                            : 'bg-brand-orange/10 border border-brand-orange/20 text-brand-light/90 rounded-2xl rounded-tr-sm'
                    }`}>
                        {msg.text}
                    </div>
                </motion.div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange shadow-lg shadow-brand-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Layers size={16} className="text-slate-900" strokeWidth={2.5} />
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-10 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-[bounce_1.4s_infinite_0ms]"/>
                        <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-[bounce_1.4s_infinite_200ms]"/>
                        <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-[bounce_1.4s_infinite_400ms]"/>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input - Anchored to Bottom - Fixed Position Logic */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-24 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
             <form onSubmit={handleSendMessage} className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={remaining > 0 ? "What's in it for you?" : "Limit reached..."}
                    disabled={remaining === 0}
                    className="w-full bg-slate-900 border border-white/10 text-brand-light text-sm py-4 pl-5 pr-12 rounded-full shadow-2xl focus:outline-none focus:border-brand-orange/50 transition-all placeholder:text-brand-light/20 disabled:opacity-50 font-sans"
                    autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button 
                        type="submit"
                        disabled={!inputValue.trim() || isLoading || remaining === 0}
                        className="p-2 bg-brand-orange/10 text-brand-orange rounded-full hover:bg-brand-orange hover:text-brand-dark disabled:opacity-0 transition-all"
                    >
                        <Send size={18} strokeWidth={2} className="ml-0.5" />
                    </button>
                </div>
            </form>
        </div>
    </motion.div>
);

const InputGroup = ({ id, label, icon: Icon, type="text", delay }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="space-y-1.5 group"
    >
        <label className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-light/30 group-focus-within:text-brand-orange transition-colors ml-1">
            {label}
        </label>
        <div className="relative">
            <input 
                required
                type={type}
                className="w-full bg-slate-900/50 border border-white/10 text-brand-light p-3.5 pl-4 text-sm focus:outline-none focus:border-brand-orange/40 focus:bg-slate-900 transition-all rounded-md placeholder:text-brand-light/10 font-normal"
                placeholder=" "
            />
        </div>
    </motion.div>
);

export default WaitlistModal;
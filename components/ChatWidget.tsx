import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, ChevronRight, Lock } from 'lucide-react';
import { ChatMessageContent } from './ChatMessageContent';
import { getChatSessionId } from '../lib/chatSession';

interface ChatWidgetProps {
  onOpenWaitlist: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const MAX_FREE_INTERACTIONS = 3;

const SUGGESTIONS = [
  "Stock running low",
  "Quoting takes long",
  "Replace current systems?",
];

const ChatWidget: React.FC<ChatWidgetProps> = ({ onOpenWaitlist }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Stockbase Intelligence online. How can I optimize your logistics?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Load interaction count from local storage to persist the "gate"
  useEffect(() => {
    const savedCount = localStorage.getItem('stockbase_chat_count');
    if (savedCount) {
      setInteractionCount(parseInt(savedCount, 10));
    }
  }, []);

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText ?? inputValue;
    if (!textToSend.trim() || isLoading) return;

    // Check soft gate
    if (interactionCount >= MAX_FREE_INTERACTIONS) {
      return;
    }

    const userText = textToSend;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const sessionId = getChatSessionId();
      const payload: Record<string, unknown> = {
        message: userText,
        history: messages,
        profile: 'concise',
        mode: 'widget',
      };
      if (sessionId) payload.sessionId = sessionId;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();
      const fullResponse = typeof data.text === 'string' ? data.text : 'Connection interrupted. Please try again.';

      setMessages(prev => [...prev, { role: 'model', text: fullResponse }]);

      // Increment Interaction Count
      const newCount = interactionCount + 1;
      setInteractionCount(newCount);
      localStorage.setItem('stockbase_chat_count', newCount.toString());

      // If we just hit the limit, add a system message
      if (newCount >= MAX_FREE_INTERACTIONS) {
        setTimeout(() => {
           setMessages(prev => [...prev, { 
             role: 'model', 
             text: "I'd love to help you plan your entire setup. Please join the waitlist to continue chatting with a Solution Engineer." 
           }]);
        }, 500);
      }

    } catch (error) {
      console.error("AI Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isGateLocked = interactionCount >= MAX_FREE_INTERACTIONS;

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-slate-900 border border-brand-orange/40 text-brand-orange p-4 rounded-full shadow-[0_0_20px_rgba(212,165,116,0.15)] hover:shadow-[0_0_30px_rgba(212,165,116,0.3)] hover:border-brand-orange transition-all group"
          >
            <div className="absolute inset-0 bg-brand-orange/10 rounded-full animate-ping opacity-20 pointer-events-none" />
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] flex flex-col rounded-sm overflow-hidden border border-brand-orange/20 bg-slate-900/95 backdrop-blur-md shadow-2xl"
          >
            {/* Header */}
            <div className="h-14 border-b border-brand-orange/10 bg-slate-950/50 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-brand-orange/10 rounded-sm">
                   <Bot className="w-4 h-4 text-brand-orange" />
                </div>
                <div>
                    <h3 className="text-sm font-heading font-bold text-brand-light tracking-wide">STOCKBASE AI</h3>
                    <p className="text-[10px] text-brand-orange/50 uppercase tracking-widest font-mono">
                       {isGateLocked ? 'SESSION LIMIT REACHED' : 'ONLINE'}
                    </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-light/30 hover:text-brand-orange transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-thin scrollbar-thumb-brand-orange/20 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-sm text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand-orange/10 border border-brand-orange/20 text-brand-light' 
                        : 'bg-slate-800/50 border border-white/5 text-brand-light/90'
                    }`}
                  >
                    <ChatMessageContent text={msg.text} />
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-slate-800/50 p-3 rounded-sm border border-white/5 flex gap-1">
                        <span className="w-1.5 h-1.5 bg-brand-orange/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                        <span className="w-1.5 h-1.5 bg-brand-orange/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                        <span className="w-1.5 h-1.5 bg-brand-orange/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950/50 border-t border-brand-orange/10">
              {!isGateLocked && (
                <div className="mb-3 flex gap-2 overflow-x-auto whitespace-nowrap">
                  {SUGGESTIONS.map((text, i) => (
                    <button
                      key={i}
                      onClick={(e) => handleSendMessage(e, text)}
                      className="shrink-0 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-widest text-brand-light/70 transition-all hover:border-brand-orange/40 hover:text-brand-light"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}
              {isGateLocked ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-xs text-brand-orange/70 justify-center pb-2 border-b border-brand-orange/5">
                        <Lock size={12} />
                        <span className="uppercase tracking-widest">Free Preview Ended</span>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onOpenWaitlist();
                        }}
                        className="w-full bg-brand-orange hover:bg-[#c29363] text-brand-dark font-bold text-xs uppercase tracking-widest py-3 rounded-sm transition-all flex items-center justify-center gap-2"
                    >
                        Join Waitlist to Continue
                        <ChevronRight size={14} />
                    </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about Simpro integration..."
                        className="w-full bg-slate-900/50 border border-brand-orange/20 text-brand-light text-sm p-3 pr-10 rounded-sm focus:outline-none focus:border-brand-orange/50 transition-colors placeholder:text-brand-light/20"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-orange hover:text-white disabled:opacity-30 disabled:hover:text-brand-orange transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
              )}
              {/* Counter Dots */}
              <div className="flex justify-center gap-1 mt-3">
                  {[...Array(MAX_FREE_INTERACTIONS)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-0.5 w-4 rounded-full transition-colors ${
                            i < interactionCount ? 'bg-brand-orange/20' : 'bg-brand-orange'
                        }`}
                      />
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

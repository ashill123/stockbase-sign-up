import React from 'react';
import { Layers } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 md:py-6 px-4 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="p-1.5 bg-slate-900/50 border border-brand-orange/30 rounded-sm shadow-sm group-hover:border-brand-orange/60 transition-colors">
            <Layers className="w-5 h-5 text-brand-orange" />
        </div>
        <span className="text-xl font-heading font-extrabold tracking-tight text-brand-light group-hover:text-white transition-colors">
          Stockbase
        </span>
      </div>
    </header>
  );
};

export default Header;
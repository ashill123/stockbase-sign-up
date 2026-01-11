import React from 'react';

const logoUrl = new URL('../Stockbase Main.svg', import.meta.url).href;

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 md:py-6 px-4 md:px-12 flex items-center justify-between">
      <div className="flex items-center group cursor-pointer">
        <img
          src={logoUrl}
          alt="Stockbase logo"
          className="h-[84px] sm:h-[96px] w-auto max-w-[420px] object-contain"
        />
      </div>
    </header>
  );
};

export default Header;

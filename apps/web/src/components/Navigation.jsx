
import React from 'react';
import { Compass, Radio } from 'lucide-react';
import { navigateToSection } from '../lib/sectionNavigation.js';

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M4 16C4 16 8 8 16 8C24 8 28 16 28 16C28 16 24 24 16 24C8 24 4 16 4 16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 12C16 12 14 14 14 16C14 18 16 20 16 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xl text-white font-playfair italic sm:text-2xl">Abyss</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigateToSection('[data-discover-section]')}
          className="abyss-button group flex items-center gap-2 rounded-full px-2.5 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] sm:px-4 sm:text-[10px] sm:tracking-[0.16em]"
        >
          <Compass className="hidden h-3.5 w-3.5 text-cyan-200/65 transition-colors group-hover:text-cyan-100 sm:block" strokeWidth={1.4} />
          <span>Discover</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToSection('[data-contact-section]')}
          className="abyss-button group flex items-center gap-2 rounded-full px-2.5 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] sm:px-4 sm:text-[10px] sm:tracking-[0.16em]"
        >
          <Radio className="hidden h-3.5 w-3.5 text-cyan-200/70 transition-colors group-hover:text-cyan-100 sm:block" strokeWidth={1.4} />
          <span className="sm:hidden">Join</span>
          <span className="hidden sm:inline">Join Mission</span>
        </button>
      </div>
    </nav>
  );
}

export default Navigation;

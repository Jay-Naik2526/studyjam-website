import React from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import onlyLogo from '../assets/only.png';
import fontboltLogo from '../assets/fontbolt.png';

// This component now takes `setCurrentPage` (to go home)
// and `setIsOpen` (to open the menu)
function Header({ setCurrentPage, setIsOpen }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">

          {/* LEFT: GDG Logo */}
          <button
            className="flex items-center text-left"
            onClick={() => setCurrentPage('solutions')}
          >
            <img
              className="h-16 w-auto flex-shrink-0"
              src={onlyLogo}
              alt="Logo"
            />
          </button>

          {/* CENTER: Fontbolt Logo (perfectly centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <img
              className="h-10 sm:h-12 w-auto"
              src={fontboltLogo}
              alt="Fontbolt Logo"
            />
          </div>

          {/* RIGHT: Menu Button */}
          <div className="flex items-center">
            <button
              className="p-2 text-gray-600 hover:text-gray-800"
              // THIS IS THE FIX: Connect the click to open the menu
              onClick={() => setIsOpen(true)} 
            >
              <HiMenuAlt3 className="w-7 h-7" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Header;
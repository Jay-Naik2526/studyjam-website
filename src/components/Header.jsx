import React from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import gdscLogo from '../assets/gdg-logo.png';

// This component now takes `setCurrentPage` (to go home)
// and `setIsOpen` (to open the menu)
function Header({ setCurrentPage, setIsOpen }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT: Logo and Title (always navigates home) */}
          <button
            className="flex items-center text-left"
            onClick={() => setCurrentPage('solutions')}
          >
            <img
              className="h-8 w-auto flex-shrink-0"
              src={gdscLogo}
              alt="GDG Logo"
            />
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">
                Google Developer Group on Campus
              </div>
              <div className="text-sm font-medium text-gray-500">
                MPSTME Shirpur
              </div>
            </div>
          </button>

          {/* CENTER: Page Title (Bigger) */}
          {/* It's hidden on small screens to prevent overlap */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
            <span className="text-2xl font-bold text-gray-800 whitespace-nowrap">
              Study Jam Solutions
            </span>
          </div>

          
          {/* RIGHT: Menu Button */}
          <div className="flex items-center">
            <button
              className="p-2 text-gray-600 hover:text-blue-600"
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
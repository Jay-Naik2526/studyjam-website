import React from 'react';
import { FaBook, FaScroll } from 'react-icons/fa';

// This component receives 4 props
function Menu({ isOpen, setIsOpen, currentPage, setCurrentPage }) {

  // Helper to close the menu AND switch the page
  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  const getButtonClasses = (pageName) => {
    const baseClasses = 'flex items-center w-full space-x-3 px-4 py-3 rounded-lg font-medium text-lg text-left';
    if (currentPage === pageName) {
      return `${baseClasses} bg-blue-100 text-blue-700`;
    } else {
      return `${baseClasses} text-gray-700 hover:bg-gray-100`;
    }
  };

  return (
    <>
      {/* 1. Main Menu Container */}
      {/* It slides in from the right and fades in. */}
      <div
        className={`fixed top-0 right-0 z-[100] h-screen w-full max-w-sm bg-white shadow-2xl transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Navigation</h2>
          <div className="space-y-2">
            <button
              className={getButtonClasses('solutions')}
              onClick={() => handleNavClick('solutions')}
            >
              <FaBook />
              <span>Solutions</span>
            </button>
            <button
              className={getButtonClasses('rules')}
              onClick={() => handleNavClick('rules')}
            >
              <FaScroll />
              <span>Rules & Guidelines</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Backdrop */}
      {/* This is the dark overlay that covers the page when the menu is open */}
      <div
        className={`fixed top-0 left-0 z-[90] h-screen w-screen bg-black/40 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)} // Click the background to close
      ></div>
    </>
  );
}

export default Menu;
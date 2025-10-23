import React from 'react';
import gdgLogo from '../assets/gdg-logo.png';
import fontboltLogo from '../assets/fontbolt.png';

function Footer() {
  const currentYear = new Date().getFullYear(); // Automatically gets the current year

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <img src={gdgLogo} alt="GDG Logo" className="h-20 w-auto" />
          <img src={fontboltLogo} alt="Fontbolt Logo" className="h-10 w-auto" />
          <p className="text-sm text-gray-500">&copy; {currentYear} GDG on Campus MPSTME Shirpur</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
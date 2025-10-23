import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear(); // Automatically gets the current year

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <p>
            &copy; {currentYear} GDG on Campus MPSTME Shirpur.
          </p>
          <p>
            Made with ❤️ by your GDG team.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
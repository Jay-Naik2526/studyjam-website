import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

function ScrollToTop() {
  // This state tracks if the button should be visible
  const [isVisible, setIsVisible] = useState(false);

  // This function checks the scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 300) { // Show button if scrolled > 300px
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // This function scrolls the page to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // This makes it scroll smoothly!
    });
  };

  // This "effect" adds the scroll listener when the component mounts
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // This cleans up the listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* We only render the button if isVisible is true */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="bg-grey-600 hover:bg-grey-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default ScrollToTop;
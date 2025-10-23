import React, { useState } from 'react';
import Header from './components/Header';
import SolutionsPage from './components/SolutionsPage';
import RulesPage from './components/RulesPage';
import Footer from './components/Footer';
import Menu from './components/Menu';
import ScrollToTop from './components/ScrollToTop';
// 1. Import animation components
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [currentPage, setCurrentPage] = useState('solutions');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation settings for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: "tween", // Smooth transition
    ease: "anticipate", // A slightly bouncy ease
    duration: 0.4
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen relative overflow-x-hidden">

      <Header 
        setCurrentPage={setCurrentPage} 
        setIsOpen={setIsMenuOpen} 
      />

      <Menu 
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 2. Wrap the page content with AnimatePresence */}
        <AnimatePresence mode="wait"> {/* 'wait' ensures one page fades out before the next fades in */}
          {/* 3. Use the currentPage as a key to trigger animation on change */}
          {/* 4. Wrap the page component in motion.div */}
          <motion.div
            key={currentPage}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {currentPage === 'solutions' ? <SolutionsPage /> : <RulesPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <ScrollToTop />

    </div>
  );
}

export default App;
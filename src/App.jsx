import React, { useState } from 'react';
import Header from './components/Header';
import SolutionsPage from './components/SolutionsPage';
import RulesPage from './components/RulesPage';
import LeaderboardPage from './components/LeaderboardPage';
import TeamsPage from './components/TeamsPage';
import Footer from './components/Footer';
import Menu from './components/Menu';
import ScrollToTop from './components/ScrollToTop';
import cloudImage from './assets/cloud.png';
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
    <div className="bg-gray-50 text-gray-800 min-h-screen relative overflow-x-hidden">

      <Header 
        setCurrentPage={setCurrentPage} 
        setIsOpen={setIsMenuOpen} 
      />

      {/* Hero Section with Cloud Image */}
      <section className="relative bg-black py-6">
        <div className="w-full">
          <div className="text-center">
            <img 
              src={cloudImage} 
              alt="Cloud Hero" 
              className="mx-auto h-32 sm:h-40 lg:h-48 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      <Menu 
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white relative">
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
            {currentPage === 'solutions' && <SolutionsPage />}
            {currentPage === 'rules' && <RulesPage />}
            {currentPage === 'leaderboard' && <LeaderboardPage />}
            {currentPage === 'teams' && <TeamsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <ScrollToTop />

    </div>
  );
}

export default App;
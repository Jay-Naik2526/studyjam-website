import React, { useState, useMemo } from 'react';
import { skillBadges, arcadeGame } from '../data/labData.js';
import CourseCard from './CourseCard';
import { FaSearch } from 'react-icons/fa';
// Import motion for animations
import { motion } from 'framer-motion'; 

function SolutionsPage() {
  // 1. Add state for the search term
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Filter the courses based on the search term
  const filteredSkillBadges = useMemo(() => {
    if (!searchTerm) return skillBadges; // If search is empty, show all

    const lowerSearchTerm = searchTerm.toLowerCase();

    return skillBadges.filter(course => 
      course.name.toLowerCase().includes(lowerSearchTerm) ||
      course.labs.some(lab => lab.name.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm]);

  const filteredArcadeGame = useMemo(() => {
    if (!searchTerm) return arcadeGame;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return arcadeGame.filter(course => 
      course.name.toLowerCase().includes(lowerSearchTerm) ||
      course.labs.some(lab => lab.name.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm]);

  // Animation variants for the cards
  const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
  };

  return (
    <div>
      {/* --- Search Bar --- */}
      <div className="mb-10 relative">

        <input
          type="text"
          placeholder="Search labs or courses (e.g., GSP421, Cloud Storage...)"
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* --- Skill Badges Section --- */}
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Skill Badges
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        Complete all 19 Skill Badges to be eligible for rewards.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 items-start">
        {/* 3. Use the FILTERED list and add animation */}
        {filteredSkillBadges.map((course, index) => (
          <motion.div
            key={course.number} 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: index * 0.05 }} // Stagger animation
            layout // Smooth layout changes
          >
            <CourseCard course={course} />
          </motion.div>
        ))}
        {/* Show message if no results */}
        {filteredSkillBadges.length === 0 && searchTerm && (
          <p className="text-gray-600 md:col-span-2 text-center py-8">No skill badges found matching your search.</p>
        )}
      </div>

      {/* --- Arcade Game Section --- */}
      <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-2">
        Arcade Game
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        Complete the Gen AI Arcade Game as your final requirement.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 items-start">
        {/* 4. Use the FILTERED list and add animation */}
        {filteredArcadeGame.map((course, index) => (
          <motion.div
            key={course.number} 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: index * 0.05 }}
            layout
          >
            <CourseCard course={course} />
          </motion.div>
        ))}
         {/* Show message if no results */}
        {filteredArcadeGame.length === 0 && searchTerm && (
           <p className="text-gray-600 md:col-span-2 text-center py-8">Arcade game not found matching your search.</p>
        )}
      </div>
    </div>
  );
}

export default SolutionsPage;
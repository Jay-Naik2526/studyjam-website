import React, { useState } from 'react';
import { FaBook, FaRocket, FaYoutube, FaChevronDown } from 'react-icons/fa';

function CourseCard({ course }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    // Added hover effects for a modern "lift"
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* --- Card Header --- */}
      {/* Increased padding and font sizes */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900 pr-4">
            {course.name}
          </h3>
          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
            {course.number}
          </span>
        </div>
        <a
          href={course.courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-md text-blue-600 hover:text-blue-800 mt-3 font-medium"
        >
          <FaBook />
          <span>View Course Page</span>
        </a>
      </div>

      {/* --- Toggle Button --- */}
      <button
        className="w-full flex justify-between items-center p-6 text-left text-blue-600 hover:bg-blue-50 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)} // Toggles the state
      >
        <span className="text-md font-medium">View All Labs & Solutions</span>
        <FaChevronDown
          className={`transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* --- Collapsible Lab List (THE ANIMATION) --- */}
      {/* Uses max-height transition for smooth slide */}
      <div
        className={`transition-[max-height] duration-700 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px]' : 'max-h-0' // Large max-height to accommodate any list length
        }`}
      >
        <div className="bg-gray-50 border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            
            {course.labs.map((lab, index) => (
              <li
                key={index}
                className={`p-5 ${
                  lab.isChallenge ? 'bg-yellow-50' : '' // Highlight challenge labs
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium pr-4">
                    {lab.name}
                  </span>
                  {lab.required && (
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full flex-shrink-0">
                      Required
                    </span>
                  )}
                </div>
                {/* Made buttons slightly larger and added hover/active effects */}
                <div className="mt-4 space-x-3">
                  <a
                    href={lab.labUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 hover:scale-105 active:scale-95" 
                  >
                    <FaRocket />
                    <span>Start Lab</span>
                  </a>
                  {lab.solutionUrl && (
                    <a
                      href={lab.solutionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <FaYoutube />
                      <span>Solution</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;

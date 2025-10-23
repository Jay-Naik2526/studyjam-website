import React from 'react';
// Import the icons we'll need for this page
import {
  FaCreditCard,
  FaSearch,
  FaCalendarCheck,
  FaComments,
  FaPlay,
  FaBan,
  FaCheckCircle,
  FaUserSecret,
  FaChrome,
  FaLightbulb,
} from 'react-icons/fa';
import { FaHourglassHalf } from 'react-icons/fa6';
// Import motion for animations
import { motion } from 'framer-motion';

function RulesPage() {
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* --- Section 1: Credits Banner --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-12"
      >
        <div className="flex items-center mb-4 md:mb-0">
          <FaCreditCard className="w-10 h-10 text-blue-600" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Haven't Redeemed Your Google Cloud Credits?
            </h3>
            <p className="text-gray-600">
              If you haven't redeemed your credits yet, click below to get
              started!
            </p>
          </div>
        </div>
        <a
          href="https://docs.google.com/document/d/1e4pKLEfAqCcRl5LmHLaO4f3vKAvDjelm85IUTiaN_no/edit?tab=t.0#heading=h.g7dr31dq0zf5"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          Redeem Now →
        </a>
      </motion.div>

      {/* --- Section 2: Easy Steps --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Easy Steps for Completing Labs
        </h2>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Follow these proven steps to complete any lab successfully! 🎯
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.2 }}
        className="space-y-6 mb-16"
      >
        {/* Step 1 */}
        <div className="flex items-start bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mr-5">1</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              📝 Copy the Lab Code
            </h3>
            <p className="text-gray-700 mt-1">
              Copy the code of that lab (e.g.,{' '}
              <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-sm">
                gsp421
              </code>
              )
            </p>
          </div>
        </div>
        {/* Step 2 */}
        <div className="flex items-start bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mr-5">2</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              🔍 Search on YouTube
            </h3>
            <p className="text-gray-700 mt-1">
              Search the lab code on YouTube (e.g., "gsp421 solution").
            </p>
          </div>
        </div>
        {/* Step 3 */}
        <div className="flex items-start bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mr-5">3</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              📅 Look for Latest Video
            </h3>
            <p className="text-gray-700 mt-1">
              Use YouTube filters → Sort by "Upload date" → Select "This month".
            </p>
          </div>
        </div>
        {/* Step 4 */}
        <div className="flex items-start bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mr-5">4</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              💬 Check Comments
            </h3>
            <p className="text-gray-700 mt-1">
              Read the comments to verify the solution is working.
            </p>
          </div>
        </div>
        {/* Step 5 */}
        <div className="flex items-start bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mr-5">5</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              🎯 Follow Step by Step
            </h3>
            <p className="text-gray-700 mt-1">
              Pause the video after each step, complete it in your lab, then
              continue.
            </p>
          </div>
        </div>
      </motion.div>

      {/* --- Section 3: Important Rules --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Important Rules to Follow
        </h2>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Keep these in mind to avoid any issues and ensure success! 🎓
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
      >
        {/* Rule 1 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <FaHourglassHalf className="w-10 h-10 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            Minimum 6 Minutes
          </h3>
          <p className="text-gray-700 mt-2">
            Spend at least <strong>6 minutes</strong> on each lab. Labs completed
            too quickly may be flagged.
          </p>
        </div>
        {/* Rule 2 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <FaBan className="w-10 h-10 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            One Lab at a Time
          </h3>
          <p className="text-gray-700 mt-2">
            Don't start <strong>two labs at once</strong> to avoid errors and
            confusing the system.
          </p>
        </div>
        {/* Rule 3 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <FaCheckCircle className="w-10 h-10 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            Complete 100% Score
          </h3>
          <p className="text-gray-700 mt-2">
            Don't end the lab before getting <strong>all 100 points</strong>.
            Incomplete labs won't count.
          </p>
        </div>
        {/* Rule 4 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <FaUserSecret className="w-10 h-10 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            Incognito Mode
          </h3>
          <p className="text-gray-700 mt-2">
            Open all labs in an <strong>incognito window</strong> for your
            Google Cloud Console student email.
          </p>
        </div>
      </motion.div>

      {/* --- Section 4: Pro Tips --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.5 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-8"
      >
        <div className="flex items-center justify-center mb-6">
          <FaLightbulb className="w-10 h-10 text-yellow-500 mr-4" />
          <h2 className="text-3xl font-bold text-gray-900">
            Pro Tips for Success
          </h2>
        </div>
        <ul className="space-y-4">
          {[
            'Always verify lab code before starting',
            'Bookmark working video solutions',
            'Keep your Cloud Skills Boost account logged in',
            'Take breaks between labs to avoid fatigue',
            'Screenshot your 100% completion for proof',
          ].map((tip, index) => (
            <li key={index} className="flex items-center text-lg text-gray-700">
              <FaCheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* --- Section 5: CTA --- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <h2 className="text-3xl font-bold text-gray-900">
          Ready to Start Your Journey? 🚀
        </h2>
        <p className="text-lg text-gray-600 mt-3 mb-6">
          Follow these rules and you'll complete all 20 courses in no time!
        </p>
      </motion.div>
    </div>
  );
}

export default RulesPage;
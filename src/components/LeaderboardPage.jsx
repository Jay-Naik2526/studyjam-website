import React, { useState, useEffect, useMemo } from 'react';
import { usePapaParse } from 'react-papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSpinner, FaSearch, FaCheckCircle, FaTimesCircle, FaSortAmountDown, FaSortAmountUp,
  FaUserGraduate, FaStar, FaTrophy, FaPercentage, FaSync, FaFileCsv, FaUsers
} from 'react-icons/fa';
import leaderboardImage from '../assets/leaderboard.png';

// --- Constants ---
const TEAM_FILES = [
    { name: 'RIO (Cloud)', file: 'RIO (Cloud).csv' },
    { name: 'Berlin (Creative)', file: 'Berlin (Creative).csv' },
    { name: 'Tokyo (EM)', file: 'Tokyo (EM).csv' },
    { name: 'Helsinki (AIML).csv', file: 'Helsinki (AIML).csv' },
    { name: 'Denver (WEB)', file: 'Denver (WEB).csv' }
];
const TEAM_EMAIL_HEADER = 'Confirm your email address linked to your Skills Boost Profile';

const MAIN_EMAIL_HEADER = 'User Email';
const MAIN_NAME_HEADER = 'User Name';
const MAIN_BADGES_HEADER = '# of Skill Badges Completed';
const MAIN_ARCADE_HEADER = '# of Arcade Games Completed';
const MAIN_PROFILE_HEADER = 'Google Cloud Skills Boost Profile URL';
// NEW: Constant for localStorage Key
const LOCAL_STORAGE_KEY = 'studyjam_stable_rank_map';
// --- End Constants ---


// Helper functions
const calculateProgress = (skillBadges, arcadeGame) => {
  const badges = parseInt(skillBadges || 0);
  const arcade = parseInt(arcadeGame || 0);
  const totalCompleted = badges + arcade;
  const progress = totalCompleted >= 20 ? 100 : Math.round((totalCompleted / 20) * 100);
  return progress;
};
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) { return "Error"; }
};

// NEW: LocalStorage Helpers for Stable Rank
const loadPersistentData = () => {
    try {
        const json = localStorage.getItem(LOCAL_STORAGE_KEY);
        // map: { email: stableIndex }, nextStableIndex: Number
        return json ? JSON.parse(json) : { map: {}, nextStableIndex: 0 };
    } catch (e) {
        // If localStorage is blocked (e.g., security settings or certain sandboxes), we fall back to a non-persistent map
        console.error("Could not load persistent data from localStorage. Ranking stability may be compromised if CSV order is random.", e);
        return { map: {}, nextStableIndex: 0 };
    }
};

const savePersistentData = (data) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        // Handle saving failure silently but log it
        console.warn("Could not save persistent data to localStorage. Ranking stability will only last for this session.", e);
    }
};


function LeaderboardPage() {
  const { readString } = usePapaParse();
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'Total Completions', direction: 'descending' });

  // --- Data Fetching and Processing ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let fetchedTeamMap = {};
      let fetchedMainData = [];
      
      // STEP 1: Load previous persistent data (rankings) from browser storage
      let { map: stableRankMap, nextStableIndex } = loadPersistentData();
      let updatedStableRankMap = { ...stableRankMap };
      let maxStableIndex = nextStableIndex; 

      try {
        // --- Fetch and Parse Team Data ---
        console.log("Starting to fetch team data...");
        const teamPromises = TEAM_FILES.map(async (team) => {
          try {
            const response = await fetch(`/teams/${team.file}?cachebust=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${team.file}`);
            const csvText = await response.text();
            console.log(`Fetched ${team.file}`);
            return new Promise((resolve, reject) => {
              readString(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: header => header.trim(),
                complete: (results) => {
                  if (results.errors.length > 0) console.warn(`Parsing warnings in ${team.file}:`, results.errors);
                  // Check headers
                  if (results.data.length > 0 && !(TEAM_EMAIL_HEADER in results.data[0])) {
                      const foundHeaders = Object.keys(results.data[0] || {});
                      const truncatedExpectedHeader = TEAM_EMAIL_HEADER.length > 50 ? TEAM_EMAIL_HEADER.substring(0, 47) + '...' : TEAM_EMAIL_HEADER;
                      const errorMsg = `Expected header '${truncatedExpectedHeader}' not found in ${team.file}. Found: [${foundHeaders.join(', ')}]. Check TEAM_EMAIL_HEADER constant or CSV.`;
                      console.error(errorMsg);
                      reject(new Error(errorMsg)); return;
                  }
                  console.log(`Parsed ${team.file}, found ${results.data.length} rows.`);
                  resolve({
                      teamName: team.name,
                      emails: results.data.map(row => row[TEAM_EMAIL_HEADER]?.trim().toLowerCase()).filter(email => email)
                  });
                },
                error: (err) => reject(new Error(`Parsing error in ${team.file}: ${err.message}`))
              });
            });
          } catch (teamFetchError) {
             console.error(`Failed to fetch or process team file ${team.file}:`, teamFetchError);
             throw new Error(`Could not load team file ${team.file}: ${teamFetchError.message}`);
          }
        });

        const teamResults = await Promise.all(teamPromises);
        teamResults.forEach(result => {
          result.emails.forEach(email => {
            if (fetchedTeamMap[email]) { /* Optional: console.warn(`Email ${email} found in multiple teams...`) */ }
            fetchedTeamMap[email] = result.teamName; // Map email to team name
          });
        });
        console.log(`Team Map Created with ${Object.keys(fetchedTeamMap).length} unique emails.`);


        // --- Fetch and Parse Main Leaderboard Data ---
        console.log("Fetching main leaderboard data (leaderboard-data.csv)...");
        const mainResponse = await fetch('/leaderboard-data.csv?cachebust=' + Date.now());
        if (!mainResponse.ok) throw new Error(`HTTP ${mainResponse.status} for main leaderboard (leaderboard-data.csv)`);
        const mainCsvText = await mainResponse.text();
        setLastUpdated(new Date());
        console.log("Fetched main leaderboard data.");

        await new Promise((resolve, reject) => {
            readString(mainCsvText, {
              header: true,
              skipEmptyLines: true,
              transformHeader: header => header.trim(),
              complete: (results) => {
                if (results.errors.length > 0) console.error("CSV Parsing Errors (Main):", results.errors);
                // Check headers
                if (results.data.length > 0) {
                     const firstRowKeys = Object.keys(results.data[0]);
                     const requiredHeaders = [MAIN_EMAIL_HEADER, MAIN_NAME_HEADER, MAIN_BADGES_HEADER, MAIN_ARCADE_HEADER, MAIN_PROFILE_HEADER];
                     const missingHeaders = requiredHeaders.filter(h => !firstRowKeys.includes(h));
                     if (missingHeaders.length > 0) {
                          const errorMsg = `Missing required headers in leaderboard-data.csv: ${missingHeaders.join(', ')}. Found: [${firstRowKeys.join(', ')}]. Check MAIN_ constants or CSV.`;
                          console.error(errorMsg);
                          reject(new Error(errorMsg)); return;
                     }
                 } else { console.warn("Main leaderboard CSV appears empty..."); }

                // Process main data and merge with team map using MAIN_EMAIL_HEADER
                fetchedMainData = results.data.map((row, index) => {
                    const email = row[MAIN_EMAIL_HEADER]?.trim().toLowerCase(); // Key for matching
                    const badges = row[MAIN_BADGES_HEADER];
                    const arcade = row[MAIN_ARCADE_HEADER];
                    const total = (parseInt(badges || 0) + parseInt(arcade || 0));
                    
                    // STEP 2: Assign stable index for persistence
                    let stableIndex;
                    if (updatedStableRankMap[email] !== undefined) {
                        stableIndex = updatedStableRankMap[email]; // Use old, saved index
                    } else {
                        stableIndex = maxStableIndex; // Assign new index
                        updatedStableRankMap[email] = stableIndex;
                        maxStableIndex++;
                    }

                    return {
                      ...row,
                      [MAIN_BADGES_HEADER]: parseInt(badges || 0),
                      [MAIN_ARCADE_HEADER]: parseInt(arcade || 0),
                      'Total Completions': total,
                      Progress: calculateProgress(badges, arcade),
                      'Profile URL': row[MAIN_PROFILE_HEADER]?.trim(), // Keep profile URL
                      TeamName: fetchedTeamMap[email] || 'N/A', // Assign team name using email map
                      id: email || `row-${index}`, // Use email as unique ID
                      StableIndex: stableIndex // <--- NEW STABLE INDEX FOR PERSISTENCE
                    }
                }).filter(row => row[MAIN_NAME_HEADER] && row[MAIN_EMAIL_HEADER]);

                // STEP 3: Save the updated map to the browser's persistent storage
                savePersistentData({ map: updatedStableRankMap, nextStableIndex: maxStableIndex });
                
                console.log(`Processed ${fetchedMainData.length} rows with stable ranks.`);
                setRawData(fetchedMainData);
                resolve();
              },
              error: (err) => reject(new Error(`Parsing error in main leaderboard: ${err.message}`))
            });
        });

      } catch (err) {
        console.error("Data Fetching/Parsing Failed Overall:", err);
        const truncatedExpectedHeader = TEAM_EMAIL_HEADER.length > 50 ? TEAM_EMAIL_HEADER.substring(0, 47) + '...' : TEAM_EMAIL_HEADER;
        setError(`Failed to load data: ${err.message}. Check file paths, ensure headers match constants (esp. team email header='${truncatedExpectedHeader}'). See console (F12).`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Removed: interval logic for simplicity and to match the file upload model.
  }, [readString]);

 // --- Filtering and Sorting Logic ---
  useEffect(() => {
    let result = [...rawData];

    // Apply Search Filter (Name, Email, Team)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(row =>
        row[MAIN_NAME_HEADER]?.toLowerCase().includes(lowerSearchTerm) ||
        row[MAIN_EMAIL_HEADER]?.toLowerCase().includes(lowerSearchTerm) ||
        row['TeamName']?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply Category/Team Filter
    if (activeFilter !== 'all') {
        if (['beginner', 'advanced', 'complete'].includes(activeFilter)) {
            switch (activeFilter) {
               case 'beginner': result = result.filter(row => row.Progress < 50); break;
               case 'advanced': result = result.filter(row => row.Progress >= 50 && row.Progress < 100); break;
               case 'complete': result = result.filter(row => row.Progress === 100); break;
             }
        } else { // Team name filter
            result = result.filter(row => row.TeamName === activeFilter);
        }
    }


    // Apply Sorting
     if (sortConfig.key) {
        result.sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];
          const sortDirection = sortConfig.direction === 'ascending' ? 1 : -1;


          if (['Progress', MAIN_BADGES_HEADER, MAIN_ARCADE_HEADER, 'Total Completions'].includes(sortConfig.key)) {
              aValue = Number(aValue || 0);
              bValue = Number(bValue || 0);
          } else { // String comparison for Name, Email, TeamName
              aValue = String(aValue || '').toLowerCase();
              bValue = String(bValue || '').toLowerCase();
          }
          
          // 1. Primary Sort by selected column
          if (aValue < bValue) return -1 * sortDirection;
          if (aValue > bValue) return 1 * sortDirection;

          // --- STABLE TIE-BREAKER LOGIC (Persisted Rank) ---

          // 2. Secondary Sort: Total Completions (Descending) 
          if (sortConfig.key !== 'Total Completions') {
              const totalA = a['Total Completions'] || 0;
              const totalB = b['Total Completions'] || 0;
              // We always want higher scores on top here (descending for score)
              if (totalA < totalB) return 1; 
              if (totalA > totalB) return -1;
          }
          
          // 3. Final Tie-breaker: Stable Index (Ascending). 
          // This uses the historically assigned index to fix the rank order among tied players.
          return a.StableIndex - b.StableIndex;
        });
      }

    // Add Rank after sorting
    result = result.map((row, index) => ({ ...row, CalculatedRank: index + 1 }));

    setFilteredData(result);
  }, [rawData, searchTerm, activeFilter, sortConfig]);


  // --- Quick Stats Calculation (remains the same) ---
  const stats = useMemo(() => {
    const totalParticipants = rawData.length;
    if (totalParticipants === 0) return { above50: 0, totalBadges: 0, completed: 0, avgProgress: 0, totalParticipants: 0 };
    const above50 = rawData.filter(row => row.Progress >= 50).length;
    const totalBadges = rawData.reduce((sum, row) => sum + (Number(row[MAIN_BADGES_HEADER]) || 0), 0);
    const completed = rawData.filter(row => row.Progress === 100).length;
    const totalProgress = rawData.reduce((sum, row) => sum + (Number(row.Progress) || 0), 0);
    const avgProgress = totalParticipants > 0 ? Math.round(totalProgress / totalParticipants) : 0;
    return { above50, totalBadges, completed, avgProgress, totalParticipants };
   }, [rawData]);

  // --- Event Handlers (handleSort, handleFilterClick, handleReset remain the same) ---
  const handleSort = (key) => {
    let direction = 'ascending';
     if (key === 'CalculatedRank') {
         key = 'Total Completions';
         direction = 'descending';
     } else if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
     } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
        direction = 'ascending';
     }
     if (key === 'Total Completions' && direction === 'ascending' && sortConfig.key !== 'Total Completions') {
        direction = 'descending';
     }
    setSortConfig({ key, direction });
  };
  const handleFilterClick = (filter) => setActiveFilter(filter);
  const handleReset = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSortConfig({ key: 'Total Completions', direction: 'descending' });
  };

  // --- CSV Export (Includes Team) ---
  const handleExportCSV = () => {
     // NOTE: This assumes PapaParse library makes Papa.unparse available globally.
     const headers = [
        'CalculatedRank', 'User Name', 'User Email', 'TeamName', 'Progress',
        MAIN_BADGES_HEADER, MAIN_ARCADE_HEADER, 'Total Completions',
        MAIN_PROFILE_HEADER
     ];
     const csvData = filteredData.map(row => ({
        'CalculatedRank': row.CalculatedRank,
        'User Name': row[MAIN_NAME_HEADER],
        'User Email': row[MAIN_EMAIL_HEADER],
        'TeamName': row.TeamName,
        'Progress': row.Progress + '%',
        [MAIN_BADGES_HEADER]: row[MAIN_BADGES_HEADER],
        [MAIN_ARCADE_HEADER]: row[MAIN_ARCADE_HEADER],
        'Total Completions': row['Total Completions'],
        [MAIN_PROFILE_HEADER]: row['Profile URL'], // Use correct key
     }));
     // Check for Papa.unparse availability
     if(typeof Papa === 'undefined' || !Papa.unparse) {
         console.error("PapaParse library not available for CSV export.");
         alert("CSV Export failed: PapaParse library not found.");
         return;
     }
     const csvContent = "data:text/csv;charset=utf-8," + Papa.unparse({ fields: headers, data: csvData });
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", "leaderboard_export.csv");
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };


  // --- Render Logic (UI structure remains largely the same) ---
  if (loading) { return ( <div className="flex justify-center items-center h-64"> <FaSpinner className="animate-spin text-red-600 w-12 h-12" /> <span className="ml-4 text-lg text-gray-600">Loading Leaderboard Data...</span> </div> ); }
  if (error) { return ( <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow max-w-2xl mx-auto"> <h2 className="text-xl font-semibold">Error Loading Data</h2> <p>{error}</p> <p className="mt-2 text-sm">Please ensure CSV files exist in <code>public/</code> and <code>public/teams/</code> and headers **exactly** match constants. Check console (F12).</p> </div> ); }


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header with Image */}
      <div className="text-center mb-8">
        <img 
          src={leaderboardImage} 
          alt="Leaderboard" 
          className="mx-auto h-16 sm:h-20 lg:h-24 w-auto object-contain mb-4"
        />
        <p className="text-lg text-gray-600"> Track your progress and compete with {stats.totalParticipants} participants! </p>
        {lastUpdated && ( <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full mt-2"> Last Updated: {formatTimestamp(lastUpdated)} </span> )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
         {[ { icon: FaUserGraduate, value: stats.above50, label: 'Above 50% Progress' }, { icon: FaStar, value: stats.totalBadges, label: 'Total Skill Badges' }, { icon: FaTrophy, value: stats.completed, label: 'Completed (20/20)' }, { icon: FaPercentage, value: `${stats.avgProgress}%`, label: 'Average Progress' }, ].map((stat, index) => ( <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center" > <stat.icon className="w-8 h-8 text-red-600 mx-auto mb-2" /> <div className="text-2xl font-bold text-gray-900">{stat.value}</div> <div className="text-sm text-gray-600">{stat.label}</div> </motion.div> ))}
      </div>

      {/* Filter & Search Controls */}
       <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
           <div className="relative mb-4">
               <input type="text" id="searchInput" placeholder="Search by name, email, or team..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
           </div>
           <div className="flex flex-wrap gap-2 justify-center mb-4">
              {[ { label: 'All', filter: 'all' }, { label: 'Beginner (<50%)', filter: 'beginner' }, { label: 'Advanced (≥50%)', filter: 'advanced' }, { label: 'Complete (100%)', filter: 'complete' }, ].map(({ label, filter }) => ( <button key={filter} onClick={() => handleFilterClick(filter)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${ activeFilter === filter ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' }`} > {label} </button> ))}
              {TEAM_FILES.map(({ name }) => ( <button key={name} onClick={() => handleFilterClick(name)} className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center space-x-1 ${ activeFilter === name ? 'bg-white-700 text-black border-red-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' }`} > <FaUsers className="w-3 h-3"/> <span>{name}</span> </button> ))}
           </div>
           <div className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-gray-200">
               <div className="flex items-center space-x-2">
                 <label htmlFor="sortSelect" className="text-sm font-medium text-gray-700">Sort by:</label>
                 <select id="sortSelect" value={sortConfig.key} onChange={(e) => handleSort(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500">
                   <option value="Total Completions">Rank (Total)</option>
                   <option value={MAIN_NAME_HEADER}>Name</option>
                   <option value="TeamName">Team</option>
                   <option value="Progress">Progress %</option>
                   <option value={MAIN_BADGES_HEADER}>Skill Badges</option>
                 </select>
                 <button onClick={() => handleSort(sortConfig.key)} className="p-1 text-gray-600 hover:text-red-600"> {sortConfig.direction === 'ascending' ? '▲' : '▼'} </button>
               </div>
               <div className="flex items-center space-x-2">
                  <button onClick={handleExportCSV} className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"> <FaFileCsv /> <span>CSV</span> </button>
                  <button onClick={handleReset} className="flex items-center space-x-1 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"> <FaSync /> <span>Reset</span> </button>
               </div>
           </div>
           <div className="text-sm text-gray-600 mt-3"> Showing {filteredData.length} of {rawData.length} participants </div>
       </div>

      {/* Leaderboard Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              {[ { key: 'CalculatedRank', label: 'Rank' }, { key: MAIN_NAME_HEADER, label: 'Participant' }, { key: 'TeamName', label: 'Team' }, { key: 'Progress', label: 'Progress' }, { key: MAIN_BADGES_HEADER, label: 'Skill Badges (19)' }, { key: MAIN_ARCADE_HEADER, label: 'Arcade (1)' }, { key: 'Total Completions', label: 'Total (20)' }, ].map(({ key, label }) => ( <th key={key} scope="col" onClick={() => handleSort(key === 'CalculatedRank' ? 'Total Completions' : key)} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap" > <div className="flex items-center"> {label} {(sortConfig.key === key || (key === 'CalculatedRank' && sortConfig.key === 'Total Completions')) && ( <span className="ml-1"> {sortConfig.direction === 'ascending' ? '▲' : '▼'} </span> )} </div> </th> ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {filteredData.length > 0 ? filteredData.map((row) => (
                <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="hover:bg-gray-50" >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.CalculatedRank}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-[200px] truncate"> <div>{row[MAIN_NAME_HEADER]}</div> <div className="text-xs text-gray-500">{row[MAIN_EMAIL_HEADER]}</div> {row['Profile URL'] && <a href={row['Profile URL']} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline block truncate"> Profile Link </a>} </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{row.TeamName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 min-w-[100px]"> <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${row.Progress}%` }}></div></div> <span className="text-xs font-semibold">{row.Progress}%</span> </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">{row[MAIN_BADGES_HEADER]}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700">{row[MAIN_ARCADE_HEADER]}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-gray-800">{row['Total Completions']}</td>
                </motion.tr>
              )) : ( <tr> <td colSpan="7" className="text-center py-10 text-gray-500">No participants found matching your criteria.</td> </tr> )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Leaderboard Cards (Mobile) */}
      <div className="md:hidden space-y-4">
          <AnimatePresence>
              {filteredData.length > 0 ? filteredData.map((row) => (
                  <motion.div key={row.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} layout className="bg-white rounded-lg shadow border border-gray-200 p-4" >
                     <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-lg font-semibold text-gray-900"><span className="text-gray-500 mr-2">{row.CalculatedRank}</span>{row[MAIN_NAME_HEADER]}</div>
                          <div className="text-xs text-gray-500">{row[MAIN_EMAIL_HEADER]}</div>
                          <div className="text-xs text-purple-700 font-medium mt-1">{row.TeamName}</div>
                          {row['Profile URL'] && <a href={row['Profile URL']} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline block truncate mt-1"> Profile Link </a>}
                        </div>
                        <div className="text-right flex-shrink-0 ml-2"> <div className="text-xl font-bold text-red-600">{row.Progress}%</div> <div className="text-xs text-gray-500">Progress</div> </div>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 my-2"><div className="bg-red-600 h-2 rounded-full" style={{ width: `${row.Progress}%` }}></div></div>
                     <div className="grid grid-cols-3 gap-2 text-xs text-center border-t pt-2 mt-2">
                        <div><span className="font-semibold">{row[MAIN_BADGES_HEADER]}</span> / 19<br/>Badges</div>
                        <div><span className="font-semibold">{row[MAIN_ARCADE_HEADER]}</span> / 1<br/>Arcade</div>
                        <div><span className="font-semibold">{row['Total Completions']}</span> / 20<br/>Total</div>
                     </div>
                  </motion.div>
              )) : ( <div className="text-center py-10 text-gray-500">No participants found matching your criteria.</div> )}
          </AnimatePresence>
      </div>

    </motion.div>
  );
}

export default LeaderboardPage;

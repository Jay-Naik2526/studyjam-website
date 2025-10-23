import React, { useState, useEffect, useMemo } from 'react';
import { usePapaParse } from 'react-papaparse';
import { motion } from 'framer-motion'; // Ensure framer-motion is installed
import {
  FaSpinner, FaUsers, FaStar, FaTrophy, FaPercentage, FaCrown
} from 'react-icons/fa'; // Ensure react-icons is installed
import teamImage from '../assets/team.png';

// --- Verified Constants ---
const TEAM_FILES = [
    { name: 'RIO (Cloud)', file: 'RIO (Cloud).csv' },
    { name: 'Berlin (Creative)', file: 'Berlin (Creative).csv' },
    { name: 'Tokyo (EM)', file: 'Tokyo (EM).csv' },
    { name: 'Helsinki (AIML)', file: 'Helsinki (AIML).csv' },
    { name: 'Denver (WEB)', file: 'Denver (WEB).csv' }
];
// Header used in the 5 team CSV files for email
const TEAM_EMAIL_HEADER = 'Confirm your email address linked to your Skills Boost Profile';
// Headers used in the main leaderboard-data.csv file
const MAIN_EMAIL_HEADER = 'User Email';
const MAIN_NAME_HEADER = 'User Name'; // Needed for filtering empty rows
const MAIN_BADGES_HEADER = '# of Skill Badges Completed';
const MAIN_ARCADE_HEADER = '# of Arcade Games Completed';
// --- End Constants ---

// --- Helper Functions ---
const safeParseInt = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
};

const calculateProgress = (skillBadges, arcadeGame) => {
  const badges = safeParseInt(skillBadges);
  const arcade = safeParseInt(arcadeGame);
  const totalCompleted = badges + arcade;
  const progress = totalCompleted >= 20 ? 100 : Math.round((totalCompleted / 20) * 100);
  return isNaN(progress) ? 0 : progress; // Ensure no NaN result
};
// --- End Helper Functions ---

function TeamsPage() {
  const { readString } = usePapaParse();
  const [participantData, setParticipantData] = useState([]); // Holds processed main data with TeamName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching and Processing ---
  useEffect(() => {
    const fetchDataAndProcess = async () => {
      setLoading(true);
      setError(null);
      let fetchedTeamMap = {}; // { main_email: teamName }

      try {
        // 1. Fetch and Parse Team Data to build the email map
        console.log("TeamsPage: Fetching team data...");
        const teamPromises = TEAM_FILES.map(async (team) => {
          const filePath = `/teams/${team.file}`;
          try {
            const response = await fetch(`${filePath}?cachebust=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${filePath}`);
            const csvText = await response.text();
            return new Promise((resolve, reject) => {
              readString(csvText, {
                header: true, skipEmptyLines: true, transformHeader: h => h.trim(),
                complete: (results) => {
                  // Basic validation
                  if (results.errors.length > 0) console.warn(`Parsing warnings ${team.file}:`, results.errors);
                  if (results.data.length > 0 && !(TEAM_EMAIL_HEADER in results.data[0])) {
                    const found = Object.keys(results.data[0]||{}).join(', ');
                    const shortExpected = TEAM_EMAIL_HEADER.substring(0,30)+'...';
                    console.error(`Header '${shortExpected}' missing in ${team.file}. Found: [${found}]`);
                    resolve({ teamName: team.name, emails: [] }); // Resolve empty but don't fail all
                    return;
                  }
                  // Extract emails using the correct header
                  const emails = results.data
                    .map(r => r[TEAM_EMAIL_HEADER]?.trim().toLowerCase())
                    .filter(Boolean); // Filter out empty/null emails
                  console.log(`Parsed ${team.file}, extracted ${emails.length} valid emails.`);
                  resolve({ teamName: team.name, emails: emails });
                },
                error: (err) => reject(new Error(`Parsing ${team.file}: ${err.message}`))
              });
            });
          } catch (e) {
             console.error(`Failed loading/processing ${filePath}:`, e);
             // Let Promise.all handle the failure by rejecting
             return Promise.reject(new Error(`Could not load team file ${team.file}: ${e.message}`));
          }
        });

        const teamResults = await Promise.all(teamPromises); // Wait for all team files
        teamResults.forEach(result => {
          // result might be undefined if a promise was rejected and not caught properly before Promise.all
          if(result && result.emails) {
            result.emails.forEach(email => { fetchedTeamMap[email] = result.teamName; });
          }
        });
        const teamMapSize = Object.keys(fetchedTeamMap).length;
        console.log(`TeamsPage: Team Map Created with ${teamMapSize} unique emails.`);
        if (teamMapSize === 0 && TEAM_FILES.length > 0) {
             console.warn("Team map is empty. Verify team CSV paths, content, and the TEAM_EMAIL_HEADER constant.");
             // Proceeding, but participants won't have teams assigned.
        }

        // 2. Fetch and Parse Main Leaderboard Data
        console.log("TeamsPage: Fetching main leaderboard data...");
        const mainResponse = await fetch('/leaderboard-data.csv?cachebust=' + Date.now());
        if (!mainResponse.ok) throw new Error(`HTTP ${mainResponse.status} for leaderboard-data.csv`);
        const mainCsvText = await mainResponse.text();
        console.log("TeamsPage: Fetched main data.");

        await new Promise((resolve, reject) => { // Use promise for async nature of papaparse
            readString(mainCsvText, {
              header: true, skipEmptyLines: true, transformHeader: h => h.trim(),
              complete: (results) => {
                 if (results.errors.length > 0) console.error("CSV Parsing Errors (Main):", results.errors);
                 // Check main headers
                 if (results.data.length > 0) {
                     const keys = Object.keys(results.data[0]);
                     const req = [MAIN_EMAIL_HEADER, MAIN_NAME_HEADER, MAIN_BADGES_HEADER, MAIN_ARCADE_HEADER]; // Profile URL not strictly needed for team stats
                     const missing = req.filter(h => !keys.includes(h));
                     if (missing.length > 0) { reject(new Error(`Missing headers in leaderboard-data.csv: ${missing.join(',')}`)); return; }
                 } else { console.warn("Main leaderboard CSV empty?"); resolve(); return; } // Resolve if empty

                // 3. Process Main Data and Merge Team Info
                const processedMainData = results.data.map((row, index) => {
                    // ** Use MAIN_EMAIL_HEADER for lookup key **
                    const lookupEmail = row[MAIN_EMAIL_HEADER]?.trim().toLowerCase();
                    const badges = safeParseInt(row[MAIN_BADGES_HEADER]);
                    const arcade = safeParseInt(row[MAIN_ARCADE_HEADER]);
                    const teamName = fetchedTeamMap[lookupEmail] || 'N/A'; // Find team using main email

                    // Keep only data needed for team calculations
                    return {
                      Email: lookupEmail, // Store the lookup key
                      Badges: badges,
                      Arcade: arcade,
                      Total: badges + arcade,
                      Progress: calculateProgress(badges, arcade),
                      TeamName: teamName,
                      // Include Name for potential filtering/debugging if needed later
                      Name: row[MAIN_NAME_HEADER],
                      id: lookupEmail || `row-${index}` // Use email as unique ID
                    }
                // Filter out rows missing essential data AFTER mapping
                }).filter(row => row.Email && row.Name);

                console.log(`TeamsPage: Processed ${processedMainData.length} valid participant rows.`);
                setParticipantData(processedMainData);
                resolve(); // Resolve the promise
              },
              error: (err) => reject(new Error(`Parsing leaderboard-data.csv: ${err.message}`))
            }); // End readString options
        }); // End Promise wrapper

      } catch (err) {
        // Catch errors from Promise.all or main data fetch/parse
        console.error("TeamsPage: CATCH block (Overall Fetch/Process Error):", err);
        setError(`Failed to load or process data: ${err.message}. Check console for details.`);
      } finally {
        console.log("TeamsPage: Fetch process finished.");
        setLoading(false);
      }
    };

    fetchDataAndProcess();
  }, [readString]); // Dependency array ensures this runs only once

  // --- Calculate Team Statistics ---
  const calculatedTeamStats = useMemo(() => {
    console.log("TeamsPage: Calculating team stats from participant data count:", participantData.length);
    if (participantData.length === 0 && !loading && !error) return []; // Avoid calculation if data is empty post-load

    const statsByTeam = {};
    const teamNamesInvolved = new Set(participantData.map(p => p.TeamName));
    console.log("TeamsPage: Aggregating stats for teams:", Array.from(teamNamesInvolved));

    teamNamesInvolved.forEach(name => {
         statsByTeam[name] = { name: name, members: 0, totalProgress: 0, totalBadges: 0, totalArcade: 0, completions: 0 };
    });

    participantData.forEach(p => {
      const teamName = p.TeamName;
      if (statsByTeam[teamName]) {
          statsByTeam[teamName].members += 1;
          statsByTeam[teamName].totalProgress += (Number(p.Progress) || 0);
          statsByTeam[teamName].totalBadges += (Number(p.Badges) || 0);
          statsByTeam[teamName].totalArcade += (Number(p.Arcade) || 0);
          if (p.Progress === 100) statsByTeam[teamName].completions += 1;
      }
    });
    console.log("TeamsPage: Raw Aggregated Stats:", statsByTeam);

    let finalStats = Object.values(statsByTeam).map(team => ({
      ...team,
      avgProgress: team.members > 0 ? Math.round(team.totalProgress / team.members) : 0,
    }));
    console.log("TeamsPage: Stats after average calculation:", finalStats);

    finalStats = finalStats.filter(team => team.name !== 'N/A'); // Filter out N/A group
    console.log("TeamsPage: Stats after filtering N/A:", finalStats);

    finalStats.sort((a, b) => { // Sort by Avg Progress -> Total Badges -> Name
        if (b.avgProgress !== a.avgProgress) return b.avgProgress - a.avgProgress;
        if (b.totalBadges !== a.totalBadges) return b.totalBadges - a.totalBadges;
        return a.name.localeCompare(b.name);
    });
    console.log("TeamsPage: Stats after sorting:", finalStats);

    const rankedStats = finalStats.map((team, index) => ({ ...team, rank: index + 1 }));
    console.log("TeamsPage: Final Ranked Stats:", rankedStats);
    return rankedStats;

   }, [participantData, loading, error]); // Recalculate if participantData changes


  // --- Render Logic ---
  if (loading) { return ( <div className="flex justify-center items-center h-64"> <FaSpinner className="animate-spin text-red-600 w-12 h-12" /> <span className="ml-4 text-lg text-gray-600">Loading Team Data...</span> </div> ); }
  if (error) { return ( <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow max-w-2xl mx-auto"> <h2 className="text-xl font-semibold">Error Loading Team Data</h2> <p>{error}</p> <p className="mt-2 text-sm">Check CSV files and headers. See console (F12).</p> </div> ); }

  // Only show "No data" if loading is finished, there's no error, AND stats are empty
  const showNoDataMessage = !loading && !error && calculatedTeamStats.length === 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-10">
        <img 
          src={teamImage} 
          alt="Team Standings" 
          className="mx-auto h-16 sm:h-20 lg:h-24 w-auto object-contain mb-4"
        />
        <p className="text-lg text-gray-600"> See how the teams are performing overall! </p>
        <p className="text-sm text-gray-500 mt-1">({calculatedTeamStats.length} teams ranked)</p>
      </div>

      {/* Team Stats Cards/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {calculatedTeamStats.map((team, index) => (
          <motion.div
            key={team.name}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-lg border ${ team.rank === 1 ? 'border-red-500 border-10' : 'border-grey-200' } overflow-hidden flex flex-col`}
          >
            {/* Rank Badge & Title */}
            <div className={`p-4 ${team.rank === 1 ? 'bg-black-400' : 'bg-gray-100'} text-center relative`}>
                <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${ team.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-black-200 text-gray-700' }`}> Rank{team.rank} </span>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center"> {team.rank === 1 && <FaCrown className="text-yellow-600 mr-2" />} {team.name} </h2>
            </div>
             {/* Main Stats */}
             <div className="p-6 flex-grow">
                <div className="text-center mb-6">
                    <p className="text-5xl font-bold text-red-600">{team.avgProgress}%</p>
                    <p className="text-gray-600 font-medium">Average Progress</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center text-sm border-t pt-4">
                    <div> <FaUsers className="mx-auto w-5 h-5 text-gray-500 mb-1"/> <p className="font-semibold text-gray-800">{team.members}</p> <p className="text-gray-500">Members</p> </div>
                     <div> <FaTrophy className="mx-auto w-5 h-5 text-green-500 mb-1"/> <p className="font-semibold text-gray-800">{team.completions}</p> <p className="text-gray-500">Completed (20/20)</p> </div>
                     <div> <FaStar className="mx-auto w-5 h-5 text-yellow-500 mb-1"/> <p className="font-semibold text-gray-800">{team.totalBadges}</p> <p className="text-gray-500">Total Badges</p> </div>
                     <div> <svg className="w-5 h-5 mx-auto text-purple-500 mb-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg> <p className="font-semibold text-gray-800">{team.totalArcade}</p> <p className="text-gray-500">Total Arcade</p> </div>
                </div>
             </div>
          </motion.div>
        ))}
         {/* Show message only if loading is done, no errors, but the final list is empty */}
         {showNoDataMessage && (
            <p className="text-center text-gray-500 col-span-1 md:col-span-2 lg:col-span-3 py-10">
                No ranked team data to display. This might happen if participant data hasn't loaded, failed processing, or no participants could be assigned to named teams.
            </p>
         )}
      </div>
    </motion.div>
  );
}

export default TeamsPage;
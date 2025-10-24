// NBA JAM - Main Application
// Uses NBA's official CDN data for reliable standings

// NBA Team ID mappings
const nbaTeamIds = {
    // Eastern Conference
    "1610612737": "Atlanta Hawks",
    "1610612738": "Boston Celtics",
    "1610612751": "Brooklyn Nets",
    "1610612766": "Charlotte Hornets",
    "1610612741": "Chicago Bulls",
    "1610612739": "Cleveland Cavaliers",
    "1610612765": "Detroit Pistons",
    "1610612754": "Indiana Pacers",
    "1610612748": "Miami Heat",
    "1610612749": "Milwaukee Bucks",
    "1610612752": "New York Knicks",
    "1610612753": "Orlando Magic",
    "1610612755": "Philadelphia 76ers",
    "1610612761": "Toronto Raptors",
    "1610612764": "Washington Wizards",
    // Western Conference
    "1610612742": "Dallas Mavericks",
    "1610612743": "Denver Nuggets",
    "1610612744": "Golden State Warriors",
    "1610612745": "Houston Rockets",
    "1610612746": "Los Angeles Clippers",
    "1610612747": "Los Angeles Lakers",
    "1610612763": "Memphis Grizzlies",
    "1610612750": "Minnesota Timberwolves",
    "1610612740": "New Orleans Pelicans",
    "1610612760": "Oklahoma City Thunder",
    "1610612756": "Phoenix Suns",
    "1610612757": "Portland Trail Blazers",
    "1610612758": "Sacramento Kings",
    "1610612759": "San Antonio Spurs",
    "1610612762": "Utah Jazz"
};

// Conference assignments
const easternTeams = [
    "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
    "Chicago Bulls", "Cleveland Cavaliers", "Detroit Pistons", "Indiana Pacers",
    "Miami Heat", "Milwaukee Bucks", "New York Knicks", "Orlando Magic",
    "Philadelphia 76ers", "Toronto Raptors", "Washington Wizards"
];

const westernTeams = [
    "Dallas Mavericks", "Denver Nuggets", "Golden State Warriors", "Houston Rockets",
    "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Minnesota Timberwolves",
    "New Orleans Pelicans", "Oklahoma City Thunder", "Phoenix Suns", "Portland Trail Blazers",
    "Sacramento Kings", "San Antonio Spurs", "Utah Jazz"
];

// State
let currentStandings = null;
let playerScores = {};
let teamRecords = {}; // Store W-L records

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchNBAStandings();
    // Refresh standings every 5 minutes
    setInterval(fetchNBAStandings, 5 * 60 * 1000);
});

// Fetch current NBA standings using NBA's CDN
async function fetchNBAStandings() {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    
    loader.classList.add('active');
    errorMessage.classList.remove('active');
    
    try {
        // First, fetch the current season standings
        const standingsUrl = 'https://cdn.nba.com/static/json/staticData/NBA_Season_Standings.json';
        const response = await fetch(standingsUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch NBA standings');
        }
        
        const data = await response.json();
        
        // Parse the standings data
        currentStandings = parseNBAStandings(data);
        
        // Calculate scores and update UI
        calculateScores();
        updateUI();
        updateLastUpdated();
        
    } catch (error) {
        console.error('Error fetching standings:', error);
        
        // Try alternative method: calculate from individual team records
        try {
            await fetchStandingsFromTeamRecords();
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            errorMessage.textContent = 'Failed to load NBA standings. Please refresh the page.';
            errorMessage.classList.add('active');
        }
    } finally {
        loader.classList.remove('active');
    }
}

// Parse NBA standings from the official data
function parseNBAStandings(data) {
    const standings = {
        eastern: [],
        western: []
    };
    
    // Check if we have the expected data structure
    if (data && data.standings) {
        // Process each conference
        const conferences = data.standings;
        
        // Eastern Conference
        if (conferences.Eastern) {
            standings.eastern = processConferenceStandings(conferences.Eastern, easternTeams);
        }
        
        // Western Conference
        if (conferences.Western) {
            standings.western = processConferenceStandings(conferences.Western, westernTeams);
        }
    }
    
    // If the primary structure doesn't work, try alternative parsing
    if (standings.eastern.length === 0 || standings.western.length === 0) {
        return parseAlternativeStructure(data);
    }
    
    return standings;
}

// Process conference standings
function processConferenceStandings(conferenceData, conferenceTeams) {
    const teams = [];
    
    // Extract teams from the conference data
    if (Array.isArray(conferenceData)) {
        conferenceData.forEach(team => {
            const teamName = nbaTeamIds[team.teamId] || team.teamName || team.team;
            if (teamName && conferenceTeams.includes(teamName)) {
                teams.push({
                    name: teamName,
                    wins: parseInt(team.wins || team.w || 0),
                    losses: parseInt(team.losses || team.l || 0),
                    winPct: parseFloat(team.winPct || team.winPercentage || 0),
                    record: `${team.wins || team.w || 0}-${team.losses || team.l || 0}`
                });
            }
        });
    }
    
    // Sort by win percentage
    teams.sort((a, b) => {
        if (b.winPct !== a.winPct) return b.winPct - a.winPct;
        return b.wins - a.wins;
    });
    
    // Assign ranks
    teams.forEach((team, index) => {
        team.rank = index + 1;
    });
    
    return teams;
}

// Alternative parsing method for different data structures
function parseAlternativeStructure(data) {
    const standings = {
        eastern: [],
        western: []
    };
    
    // Try to find teams in various possible data structures
    const allTeams = [];
    
    // Look for teams in different possible locations
    const possiblePaths = [
        data.teams,
        data.standings,
        data.league?.standard?.teams,
        data.resultSet?.rowSet
    ];
    
    for (const path of possiblePaths) {
        if (path && Array.isArray(path)) {
            path.forEach(item => {
                const teamName = extractTeamName(item);
                if (teamName) {
                    const wins = extractWins(item);
                    const losses = extractLosses(item);
                    allTeams.push({
                        name: teamName,
                        wins: wins,
                        losses: losses,
                        winPct: wins / (wins + losses) || 0,
                        record: `${wins}-${losses}`
                    });
                }
            });
            if (allTeams.length > 0) break;
        }
    }
    
    // Separate into conferences
    allTeams.forEach(team => {
        if (easternTeams.includes(team.name)) {
            standings.eastern.push(team);
        } else if (westernTeams.includes(team.name)) {
            standings.western.push(team);
        }
    });
    
    // Sort and rank each conference
    ['eastern', 'western'].forEach(conf => {
        standings[conf].sort((a, b) => {
            if (b.winPct !== a.winPct) return b.winPct - a.winPct;
            return b.wins - a.wins;
        });
        standings[conf].forEach((team, index) => {
            team.rank = index + 1;
        });
    });
    
    return standings;
}

// Fallback: Calculate standings from team records
async function fetchStandingsFromTeamRecords() {
    console.log('Attempting fallback method: fetching team records...');
    
    // Use the NBA's scoreboard endpoint which includes team records
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const scoreboardUrl = `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`;
    
    const response = await fetch(scoreboardUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch scoreboard data');
    }
    
    const data = await response.json();
    
    // Extract team records from the scoreboard
    const standings = {
        eastern: [],
        western: []
    };
    
    // Process teams from the scoreboard
    if (data && data.scoreboard && data.scoreboard.games) {
        const teamsProcessed = new Set();
        
        data.scoreboard.games.forEach(game => {
            // Process home team
            if (game.homeTeam && !teamsProcessed.has(game.homeTeam.teamId)) {
                processTeamFromGame(game.homeTeam, standings);
                teamsProcessed.add(game.homeTeam.teamId);
            }
            
            // Process away team
            if (game.awayTeam && !teamsProcessed.has(game.awayTeam.teamId)) {
                processTeamFromGame(game.awayTeam, standings);
                teamsProcessed.add(game.awayTeam.teamId);
            }
        });
    }
    
    // If we don't have enough teams, fetch from static endpoint
    if (standings.eastern.length < 15 || standings.western.length < 15) {
        await fetchStaticStandings(standings);
    }
    
    // Sort and rank
    ['eastern', 'western'].forEach(conf => {
        standings[conf].sort((a, b) => {
            const aWinPct = a.wins / (a.wins + a.losses) || 0;
            const bWinPct = b.wins / (b.wins + b.losses) || 0;
            if (bWinPct !== aWinPct) return bWinPct - aWinPct;
            return b.wins - a.wins;
        });
        standings[conf].forEach((team, index) => {
            team.rank = index + 1;
            team.winPct = team.wins / (team.wins + team.losses) || 0;
        });
    });
    
    currentStandings = standings;
}

// Process team from game data
function processTeamFromGame(teamData, standings) {
    const teamName = nbaTeamIds[teamData.teamId] || teamData.teamName;
    
    if (teamName) {
        const teamRecord = {
            name: teamName,
            wins: parseInt(teamData.wins || 0),
            losses: parseInt(teamData.losses || 0),
            record: `${teamData.wins || 0}-${teamData.losses || 0}`
        };
        
        if (easternTeams.includes(teamName)) {
            standings.eastern.push(teamRecord);
        } else if (westernTeams.includes(teamName)) {
            standings.western.push(teamRecord);
        }
    }
}

// Fetch static standings as final fallback
async function fetchStaticStandings(standings) {
    try {
        // Try NBA's conference standings endpoint
        const conferenceUrl = 'https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2024/league/00_full_schedule.json';
        const response = await fetch(conferenceUrl);
        
        if (response.ok) {
            const data = await response.json();
            // Parse this data structure and add missing teams to standings
            // This is a backup of backup, so we'll just ensure we have teams
        }
    } catch (error) {
        console.error('Static standings fetch failed:', error);
    }
    
    // If all else fails, ensure we have all teams with default values
    ensureAllTeams(standings);
}

// Ensure all teams are present
function ensureAllTeams(standings) {
    easternTeams.forEach(teamName => {
        if (!standings.eastern.find(t => t.name === teamName)) {
            standings.eastern.push({
                name: teamName,
                wins: 0,
                losses: 0,
                winPct: 0,
                record: '0-0'
            });
        }
    });
    
    westernTeams.forEach(teamName => {
        if (!standings.western.find(t => t.name === teamName)) {
            standings.western.push({
                name: teamName,
                wins: 0,
                losses: 0,
                winPct: 0,
                record: '0-0'
            });
        }
    });
}

// Helper functions to extract data from various formats
function extractTeamName(item) {
    return nbaTeamIds[item.teamId] || 
           item.teamName || 
           item.team || 
           item.name ||
           (item[4] && nbaTeamIds[item[4]]);
}

function extractWins(item) {
    return parseInt(item.wins || item.w || item[8] || 0);
}

function extractLosses(item) {
    return parseInt(item.losses || item.l || item[9] || 0);
}

// Calculate accuracy scores for all players
function calculateScores() {
    if (!currentStandings) return;
    
    playerScores = {};
    
    Object.keys(predictions).forEach(playerName => {
        const playerPredictions = predictions[playerName];
        
        // Calculate Eastern Conference accuracy
        const easternAccuracy = calculateConferenceAccuracy(
            playerPredictions.eastern,
            currentStandings.eastern
        );
        
        // Calculate Western Conference accuracy
        const westernAccuracy = calculateConferenceAccuracy(
            playerPredictions.western,
            currentStandings.western
        );
        
        // Calculate combined accuracy (average of both conferences)
        const combinedAccuracy = (easternAccuracy + westernAccuracy) / 2;
        
        playerScores[playerName] = {
            eastern: easternAccuracy,
            western: westernAccuracy,
            combined: combinedAccuracy,
            details: {
                eastern: calculateDetailedAccuracy(playerPredictions.eastern, currentStandings.eastern),
                western: calculateDetailedAccuracy(playerPredictions.western, currentStandings.western)
            }
        };
    });
}

// Calculate accuracy for a single conference
function calculateConferenceAccuracy(predictions, actualStandings) {
    let totalAccuracy = 0;
    const maxDistance = 14; // Maximum possible distance (1st to 15th)
    
    predictions.forEach((teamName, predictedIndex) => {
        const predictedRank = predictedIndex + 1;
        const actualTeam = actualStandings.find(team => team.name === teamName);
        
        if (actualTeam) {
            const actualRank = actualTeam.rank;
            const distance = Math.abs(predictedRank - actualRank);
            const accuracy = ((maxDistance - distance) / maxDistance) * 100;
            totalAccuracy += accuracy;
        }
    });
    
    return totalAccuracy / 15; // Average accuracy across all 15 teams
}

// Calculate detailed accuracy for each team
function calculateDetailedAccuracy(predictions, actualStandings) {
    const details = [];
    const maxDistance = 14;
    
    predictions.forEach((teamName, predictedIndex) => {
        const predictedRank = predictedIndex + 1;
        const actualTeam = actualStandings.find(team => team.name === teamName);
        
        if (actualTeam) {
            const actualRank = actualTeam.rank;
            const distance = Math.abs(predictedRank - actualRank);
            const accuracy = ((maxDistance - distance) / maxDistance) * 100;
            
            details.push({
                team: teamName,
                predicted: predictedRank,
                actual: actualRank,
                distance: distance,
                accuracy: accuracy
            });
        }
    });
    
    return details;
}

// Update the UI with current scores and standings
function updateUI() {
    if (!playerScores || Object.keys(playerScores).length === 0) return;
    
    // Update scoreboard
    updateScoreboard();
    
    // Update conference tabs
    updateConferenceTabs();
}

// Update the main scoreboard
function updateScoreboard() {
    const scoreCardsContainer = document.getElementById('scoreCards');
    
    // Sort players by combined accuracy
    const sortedPlayers = Object.entries(playerScores)
        .sort((a, b) => b[1].combined - a[1].combined);
    
    scoreCardsContainer.innerHTML = '';
    
    sortedPlayers.forEach((entry, index) => {
        const [playerName, scores] = entry;
        const isLeader = index === 0;
        
        const card = document.createElement('div');
        card.className = `player-card ${isLeader ? 'leader' : ''}`;
        
        const accuracyClass = getAccuracyColorClass(scores.combined);
        
        card.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="player-name">${playerName.toUpperCase()}</div>
            <div class="accuracy-score ${accuracyClass}">${scores.combined.toFixed(1)}%</div>
            <div class="accuracy-label">Overall Accuracy</div>
            <div class="conference-scores">
                <div class="conf-score">
                    <div class="label">Eastern</div>
                    <div class="value ${getAccuracyColorClass(scores.eastern)}">${scores.eastern.toFixed(1)}%</div>
                </div>
                <div class="conf-score">
                    <div class="label">Western</div>
                    <div class="value ${getAccuracyColorClass(scores.western)}">${scores.western.toFixed(1)}%</div>
                </div>
            </div>
        `;
        
        scoreCardsContainer.appendChild(card);
    });
}

// Update conference tabs content
function updateConferenceTabs() {
    updateCombinedTab();
    updateConferenceTab('eastern');
    updateConferenceTab('western');
}

// Update combined standings view
function updateCombinedTab() {
    const container = document.getElementById('combinedTab');
    container.innerHTML = '<h3 style="text-align: center; margin-bottom: 20px;">Combined Conference Overview</h3>';
    
    // Create summary table
    const table = document.createElement('div');
    table.className = 'standings-table';
    
    // Header
    table.innerHTML = `
        <div class="table-header">
            <div>Conference</div>
            <div>Teams</div>
            <div>Aaron</div>
            <div>Austin</div>
            <div>Paul</div>
        </div>
    `;
    
    // Eastern Conference Summary
    const easternRow = document.createElement('div');
    easternRow.className = 'team-row';
    easternRow.innerHTML = `
        <div style="font-weight: bold;">Eastern</div>
        <div>15 Teams</div>
        <div class="player-prediction ${getAccuracyClass(playerScores.aaron.eastern)}">
            ${playerScores.aaron.eastern.toFixed(1)}%
        </div>
        <div class="player-prediction ${getAccuracyClass(playerScores.austin.eastern)}">
            ${playerScores.austin.eastern.toFixed(1)}%
        </div>
        <div class="player-prediction ${getAccuracyClass(playerScores.paul.eastern)}">
            ${playerScores.paul.eastern.toFixed(1)}%
        </div>
    `;
    table.appendChild(easternRow);
    
    // Western Conference Summary
    const westernRow = document.createElement('div');
    westernRow.className = 'team-row';
    westernRow.innerHTML = `
        <div style="font-weight: bold;">Western</div>
        <div>15 Teams</div>
        <div class="player-prediction ${getAccuracyClass(playerScores.aaron.western)}">
            ${playerScores.aaron.western.toFixed(1)}%
        </div>
        <div class="player-prediction ${getAccuracyClass(playerScores.austin.western)}">
            ${playerScores.austin.western.toFixed(1)}%
        </div>
        <div class="player-prediction ${getAccuracyClass(playerScores.paul.western)}">
            ${playerScores.paul.western.toFixed(1)}%
        </div>
    `;
    table.appendChild(westernRow);
    
    // Combined Summary
    const combinedRow = document.createElement('div');
    combinedRow.className = 'team-row';
    combinedRow.style.borderTop = '2px solid rgba(255,255,255,0.3)';
    combinedRow.innerHTML = `
        <div style="font-weight: bold;">TOTAL</div>
        <div>30 Teams</div>
        <div class="player-prediction ${getAccuracyClass(playerScores.aaron.combined)}" style="font-weight: bold;">
            ${playerScores.aaron.combined.toFixed(1)}%
        </div>
        <div class="player-prediction ${getAccuracyClass(playerScores.austin.combined)}" style="font-weight: bold;">
            ${playerScores.austin.combined.toFixed(1)}%
        </div>
        <div class="player-prediction ${getAccuracyClass(playerScores.paul.combined)}" style="font-weight: bold;">
            ${playerScores.paul.combined.toFixed(1)}%
        </div>
    `;
    table.appendChild(combinedRow);
    
    container.appendChild(table);
}

// Update individual conference tab
function updateConferenceTab(conference) {
    const container = document.getElementById(`${conference}Tab`);
    const standings = currentStandings[conference];
    const conferenceName = conference === 'eastern' ? 'Eastern' : 'Western';
    
    container.innerHTML = `<h3 style="text-align: center; margin-bottom: 20px;">${conferenceName} Conference Predictions</h3>`;
    
    const table = document.createElement('div');
    table.className = 'standings-table';
    
    // Header
    table.innerHTML = `
        <div class="table-header">
            <div>Current</div>
            <div>Team</div>
            <div>Aaron</div>
            <div>Austin</div>
            <div>Paul</div>
        </div>
    `;
    
    // Add each team
    standings.forEach(team => {
        const row = document.createElement('div');
        row.className = 'team-row';
        
        // Get predictions for this team
        const teamPredictions = {};
        Object.keys(predictions).forEach(playerName => {
            const playerPrediction = predictions[playerName][conference];
            const predictedRank = playerPrediction.indexOf(team.name) + 1;
            const distance = Math.abs(predictedRank - team.rank);
            const accuracy = ((14 - distance) / 14) * 100;
            teamPredictions[playerName] = {
                rank: predictedRank,
                accuracy: accuracy
            };
        });
        
        row.innerHTML = `
            <div class="actual-rank">${team.rank}</div>
            <div class="team-info">
                <img src="${teamLogos[team.name]}" alt="${team.name}" class="team-logo" onerror="this.style.display='none'">
                <span class="team-name">${team.name}</span>
                <span style="color: #999; font-size: 12px;">(${team.record})</span>
            </div>
            <div class="player-prediction ${getAccuracyClass(teamPredictions.aaron.accuracy)}">
                ${teamPredictions.aaron.rank}
            </div>
            <div class="player-prediction ${getAccuracyClass(teamPredictions.austin.accuracy)}">
                ${teamPredictions.austin.rank}
            </div>
            <div class="player-prediction ${getAccuracyClass(teamPredictions.paul.accuracy)}">
                ${teamPredictions.paul.rank}
            </div>
        `;
        
        table.appendChild(row);
    });
    
    container.appendChild(table);
}

// Get accuracy class based on percentage
function getAccuracyClass(accuracy) {
    if (accuracy >= 90) return 'accuracy-excellent';
    if (accuracy >= 80) return 'accuracy-good';
    if (accuracy >= 70) return 'accuracy-fair';
    if (accuracy >= 60) return 'accuracy-poor';
    return 'accuracy-bad';
}

// Get color class for text based on accuracy
function getAccuracyColorClass(accuracy) {
    if (accuracy >= 90) return 'accuracy-90';
    if (accuracy >= 80) return 'accuracy-80';
    if (accuracy >= 70) return 'accuracy-70';
    if (accuracy >= 60) return 'accuracy-60';
    return 'accuracy-50';
}

// Tab switching functionality
function showTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabName}Tab`).style.display = 'block';
}

// Update last updated timestamp
function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const dateString = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    element.textContent = `Last updated: ${dateString} at ${timeString}`;
}

// Make showTab function globally available
window.showTab = showTab;
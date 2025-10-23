// NBA JAM - Main Application
// Fetches current NBA standings and calculates prediction accuracy

// -------- CONFIG --------
const ESPN_STANDINGS_URL =
  'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?region=us&lang=en';
const NBA_BACKUP_URL =
  'https://data.nba.net/data/10s/prod/v1/current/standings_conference.json';

// Try direct first, then proxies (some hosts block CORS intermittently)
const PROXIES = [
  (url) => url, // direct
  (url) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
  // text-only reader that works cross-origin; we'll JSON.parse the text ourselves
  (url) => 'https://r.jina.ai/http/' + url.replace(/^https?:\/\//, '')
];

// Generic fetch that returns parsed JSON (tries all proxies)
async function fetchJSONWithFallback(url) {
  let lastErr;
  for (const build of PROXIES) {
    const attempt = build(url);
    try {
      const res = await fetch(attempt, { cache: 'no-store' });
      const text = await res.text();              // always read as text
      const json = JSON.parse(text);              // parse JSON from text
      return json;
    } catch (err) {
      lastErr = err;
      // try next proxy
    }
  }
  throw lastErr;
}

// State
let currentStandings = null;
let playerScores = {};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchNBAStandings();
    // Refresh standings every 5 minutes
    setInterval(fetchNBAStandings, 5 * 60 * 1000);
});

// Fetch current NBA standings
async function fetchNBAStandings() {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');

    loader.classList.add('active');
    errorMessage.classList.remove('active');

    try {
        // 1) ESPN first
        const data = await fetchJSONWithFallback(ESPN_STANDINGS_URL);
        if (data && data.children) {
            currentStandings = parseStandings(data);
            calculateScores();
            updateUI();
            updateLastUpdated();
            return; // success
        }
        throw new Error('Unexpected ESPN payload');
    } catch (err1) {
        console.warn('ESPN fetch failed, trying backup:', err1);
    }

    // 2) Backup feed
    try {
        const data2 = await fetchJSONWithFallback(NBA_BACKUP_URL);
        if (data2 && data2.league && data2.league.standard && data2.league.standard.conference) {
            currentStandings = parseBackupStandings(data2.league.standard.conference);
            calculateScores();
            updateUI();
            updateLastUpdated();
            // IMPORTANT: hide the error if backup succeeded
            errorMessage.classList.remove('active');
            return;
        }
        throw new Error('Unexpected backup payload');
    } catch (err2) {
        console.error('Backup fetch failed:', err2);
        errorMessage.textContent = 'Failed to load NBA standings (ESPN and backup unavailable).';
        errorMessage.classList.add('active');
    } finally {
        loader.classList.remove('active');
    }
}

// Legacy wrapper kept for compatibility (now just calls the new function)
async function tryBackupAPI() {
    // handled inside fetchNBAStandings()
}

// Parse ESPN API standings data
function parseStandings(data) {
    const standings = {
        eastern: [],
        western: []
    };
    
    // ESPN API returns conferences as children
    data.children.forEach(conference => {
        const isEastern = conference.name === 'Eastern Conference';
        const conferenceKey = isEastern ? 'eastern' : 'western';
        
        // Get all teams from the conference
        const teams = [];
        conference.children.forEach(division => {
            division.standings.entries.forEach(entry => {
                teams.push({
                    name: normalizeTeamName(entry.team.displayName),
                    wins: entry.stats.find(s => s.name === 'wins')?.value || 0,
                    losses: entry.stats.find(s => s.name === 'losses')?.value || 0,
                    winPct: entry.stats.find(s => s.name === 'winPercent')?.value || 0,
                    record: entry.stats.find(s => s.name === 'record')?.displayValue || '0-0'
                });
            });
        });
        
        // Sort by win percentage (and wins as tiebreaker)
        teams.sort((a, b) => {
            if (b.winPct !== a.winPct) return b.winPct - a.winPct;
            return b.wins - a.wins;
        });
        
        // Assign rankings
        teams.forEach((team, index) => {
            standings[conferenceKey].push({
                rank: index + 1,
                ...team
            });
        });
    });
    
    return standings;
}

// Try backup API handled inside fetchNBAStandings()

// Parse backup API standings
function parseBackupStandings(data) {
    const standings = {
        eastern: [],
        western: []
    };
    
    // Process Eastern Conference
    data.east.forEach((team, index) => {
        standings.eastern.push({
            rank: index + 1,
            name: normalizeTeamName(team.teamSitesOnly.teamNickname),
            wins: parseInt(team.win),
            losses: parseInt(team.loss),
            winPct: parseFloat(team.winPct),
            record: `${team.win}-${team.loss}`
        });
    });
    
    // Process Western Conference
    data.west.forEach((team, index) => {
        standings.western.push({
            rank: index + 1,
            name: normalizeTeamName(team.teamSitesOnly.teamNickname),
            wins: parseInt(team.win),
            losses: parseInt(team.loss),
            winPct: parseFloat(team.winPct),
            record: `${team.win}-${team.loss}`
        });
    });
    
    return standings;
}

// Normalize team names to match our predictions
function normalizeTeamName(name) {
    // Check if it's already a full name
    if (teamLogos[name]) {
        return name;
    }
    
    // Check mappings
    if (teamNameMappings[name]) {
        return teamNameMappings[name];
    }
    
    // Try to find a match
    for (const fullName in teamLogos) {
        if (fullName.includes(name) || name.includes(fullName)) {
            return fullName;
        }
    }
    
    return name;
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
            <div>Gill</div>
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
        <div class="player-prediction ${getAccuracyClass(playerScores.gill.eastern)}">
            ${playerScores.gill.eastern.toFixed(1)}%
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
        <div class="player-prediction ${getAccuracyClass(playerScores.gill.western)}">
            ${playerScores.gill.western.toFixed(1)}%
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
        <div class="player-prediction ${getAccuracyClass(playerScores.gill.combined)}" style="font-weight: bold;">
            ${playerScores.gill.combined.toFixed(1)}%
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
            <div>Gill</div>
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
            <div class="player-prediction ${getAccuracyClass(teamPredictions.gill.accuracy)}">
                ${teamPredictions.gill.rank}
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

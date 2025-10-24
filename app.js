// NBA JAM - Main Application
// Supports manual standings input and ESPN copy/paste

// State
let currentStandings = {
    eastern: [],
    western: []
};
let playerScores = {};

// Team name variations for matching
const teamVariations = {
    // Eastern Conference
    "Cavaliers": "Cleveland Cavaliers",
    "Cavs": "Cleveland Cavaliers",
    "Cleveland": "Cleveland Cavaliers",
    "Celtics": "Boston Celtics",
    "Boston": "Boston Celtics",
    "Knicks": "New York Knicks",
    "New York": "New York Knicks",
    "NY": "New York Knicks",
    "Magic": "Orlando Magic",
    "Orlando": "Orlando Magic",
    "Hawks": "Atlanta Hawks",
    "Atlanta": "Atlanta Hawks",
    "Bucks": "Milwaukee Bucks",
    "Milwaukee": "Milwaukee Bucks",
    "Pistons": "Detroit Pistons",
    "Detroit": "Detroit Pistons",
    "Heat": "Miami Heat",
    "Miami": "Miami Heat",
    "76ers": "Philadelphia 76ers",
    "Sixers": "Philadelphia 76ers",
    "Philadelphia": "Philadelphia 76ers",
    "Raptors": "Toronto Raptors",
    "Toronto": "Toronto Raptors",
    "Hornets": "Charlotte Hornets",
    "Charlotte": "Charlotte Hornets",
    "Pacers": "Indiana Pacers",
    "Indiana": "Indiana Pacers",
    "Bulls": "Chicago Bulls",
    "Chicago": "Chicago Bulls",
    "Nets": "Brooklyn Nets",
    "Brooklyn": "Brooklyn Nets",
    "Wizards": "Washington Wizards",
    "Washington": "Washington Wizards",
    // Western Conference
    "Thunder": "Oklahoma City Thunder",
    "OKC": "Oklahoma City Thunder",
    "Oklahoma City": "Oklahoma City Thunder",
    "Rockets": "Houston Rockets",
    "Houston": "Houston Rockets",
    "Warriors": "Golden State Warriors",
    "Golden State": "Golden State Warriors",
    "GSW": "Golden State Warriors",
    "Nuggets": "Denver Nuggets",
    "Denver": "Denver Nuggets",
    "Timberwolves": "Minnesota Timberwolves",
    "Wolves": "Minnesota Timberwolves",
    "Minnesota": "Minnesota Timberwolves",
    "Mavericks": "Dallas Mavericks",
    "Mavs": "Dallas Mavericks",
    "Dallas": "Dallas Mavericks",
    "Clippers": "Los Angeles Clippers",
    "LA Clippers": "Los Angeles Clippers",
    "LAC": "Los Angeles Clippers",
    "Lakers": "Los Angeles Lakers",
    "LA Lakers": "Los Angeles Lakers",
    "LAL": "Los Angeles Lakers",
    "Grizzlies": "Memphis Grizzlies",
    "Memphis": "Memphis Grizzlies",
    "Spurs": "San Antonio Spurs",
    "San Antonio": "San Antonio Spurs",
    "Suns": "Phoenix Suns",
    "Phoenix": "Phoenix Suns",
    "Pelicans": "New Orleans Pelicans",
    "Pels": "New Orleans Pelicans",
    "New Orleans": "New Orleans Pelicans",
    "Kings": "Sacramento Kings",
    "Sacramento": "Sacramento Kings",
    "Jazz": "Utah Jazz",
    "Utah": "Utah Jazz",
    "Trail Blazers": "Portland Trail Blazers",
    "Blazers": "Portland Trail Blazers",
    "Portland": "Portland Trail Blazers"
};

// All NBA teams
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

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved standings from localStorage if available
    const saved = localStorage.getItem('nbaStandings');
    if (saved) {
        currentStandings = JSON.parse(saved);
        calculateScores();
        updateUI();
    } else {
        // Try to fetch standings automatically
        fetchStandings();
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Fetch standings button
    document.getElementById('fetchStandings').addEventListener('click', fetchStandings);
    
    // Manual update button
    document.getElementById('manualUpdate').addEventListener('click', () => {
        document.getElementById('updateModal').style.display = 'block';
        prefillManualInput();
    });
    
    // ESPN paste button
    document.getElementById('loadFromUrl').addEventListener('click', () => {
        document.getElementById('urlModal').style.display = 'block';
    });
    
    // Save manual standings
    document.getElementById('saveStandings').addEventListener('click', saveManualStandings);
    
    // Parse ESPN standings
    document.getElementById('parseEspn').addEventListener('click', parseEspnStandings);
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Fetch standings using multiple methods
async function fetchStandings() {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');
    
    loader.classList.add('active');
    errorMessage.classList.remove('active');
    
    try {
        // Try method 1: ESPN API via CORS proxy
        await fetchFromESPN();
    } catch (error) {
        console.error('ESPN fetch failed:', error);
        
        // Try method 2: Basketball Reference
        try {
            await fetchFromBasketballRef();
        } catch (error2) {
            console.error('Basketball Reference fetch failed:', error2);
            
            // Show error and suggest manual update
            errorMessage.innerHTML = `
                Failed to auto-fetch standings. Please use one of these options:<br>
                1. Click "Manual Update" to enter standings manually<br>
                2. Click "Paste ESPN Standings" and copy from ESPN.com
            `;
            errorMessage.classList.add('active');
        }
    } finally {
        loader.classList.remove('active');
    }
}

// Fetch from ESPN using CORS proxy
async function fetchFromESPN() {
    const proxyUrl = 'https://corsproxy.io/?';
    const espnUrl = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings';
    
    const response = await fetch(proxyUrl + encodeURIComponent(espnUrl));
    if (!response.ok) throw new Error('Failed to fetch from ESPN');
    
    const data = await response.json();
    
    if (data && data.children) {
        parseESPNData(data);
        calculateScores();
        updateUI();
        saveToLocalStorage();
    } else {
        throw new Error('Invalid ESPN data format');
    }
}

// Parse ESPN API data
function parseESPNData(data) {
    const standings = {
        eastern: [],
        western: []
    };
    
    data.children.forEach(conference => {
        const isEastern = conference.name === 'Eastern Conference';
        const conferenceKey = isEastern ? 'eastern' : 'western';
        
        const teams = [];
        conference.children.forEach(division => {
            division.standings.entries.forEach(entry => {
                const teamName = normalizeTeamName(entry.team.displayName);
                teams.push({
                    name: teamName,
                    wins: entry.stats.find(s => s.name === 'wins')?.value || 0,
                    losses: entry.stats.find(s => s.name === 'losses')?.value || 0,
                    winPct: entry.stats.find(s => s.name === 'winPercent')?.value || 0,
                    record: entry.stats.find(s => s.name === 'record')?.displayValue || '0-0'
                });
            });
        });
        
        // Sort by win percentage
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
    
    currentStandings = standings;
}

// Fetch from Basketball Reference
async function fetchFromBasketballRef() {
    // This is a fallback method - would need CORS proxy
    throw new Error('Basketball Reference not available');
}

// Normalize team names
function normalizeTeamName(name) {
    // Check if it's already a full name
    if (easternTeams.includes(name) || westernTeams.includes(name)) {
        return name;
    }
    
    // Check variations
    if (teamVariations[name]) {
        return teamVariations[name];
    }
    
    // Try to find a match
    const allTeams = [...easternTeams, ...westernTeams];
    for (const team of allTeams) {
        if (team.includes(name) || name.includes(team)) {
            return team;
        }
    }
    
    return name;
}

// Prefill manual input with current standings
function prefillManualInput() {
    const easternInput = document.getElementById('easternInput');
    const westernInput = document.getElementById('westernInput');
    
    if (currentStandings.eastern.length > 0) {
        easternInput.value = currentStandings.eastern
            .map(team => `${team.name}${team.record ? ` (${team.record})` : ''}`)
            .join('\n');
    }
    
    if (currentStandings.western.length > 0) {
        westernInput.value = currentStandings.western
            .map(team => `${team.name}${team.record ? ` (${team.record})` : ''}`)
            .join('\n');
    }
}

// Save manual standings
function saveManualStandings() {
    const easternInput = document.getElementById('easternInput').value.trim();
    const westernInput = document.getElementById('westernInput').value.trim();
    
    if (!easternInput || !westernInput) {
        alert('Please enter standings for both conferences');
        return;
    }
    
    // Parse Eastern Conference
    const easternLines = easternInput.split('\n').filter(line => line.trim());
    currentStandings.eastern = parseManualLines(easternLines);
    
    // Parse Western Conference
    const westernLines = westernInput.split('\n').filter(line => line.trim());
    currentStandings.western = parseManualLines(westernLines);
    
    // Update everything
    calculateScores();
    updateUI();
    saveToLocalStorage();
    
    // Close modal
    document.getElementById('updateModal').style.display = 'none';
    
    // Show success message
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = 'Standings updated successfully!';
    errorMessage.style.background = 'rgba(34, 197, 94, 0.2)';
    errorMessage.style.borderColor = '#22c55e';
    errorMessage.classList.add('active');
    setTimeout(() => {
        errorMessage.classList.remove('active');
        errorMessage.style.background = '';
        errorMessage.style.borderColor = '';
    }, 3000);
}

// Parse manual input lines
function parseManualLines(lines) {
    const teams = [];
    
    lines.forEach((line, index) => {
        // Remove leading numbers if present
        let cleanLine = line.replace(/^\d+[\.\)\s]+/, '').trim();
        
        // Extract record if present (in parentheses)
        let record = '0-0';
        const recordMatch = cleanLine.match(/\((\d+-\d+)\)/);
        if (recordMatch) {
            record = recordMatch[1];
            cleanLine = cleanLine.replace(/\(.*?\)/, '').trim();
        }
        
        // Normalize team name
        const teamName = normalizeTeamName(cleanLine);
        
        // Calculate win percentage
        const [wins, losses] = record.split('-').map(n => parseInt(n) || 0);
        const winPct = wins + losses > 0 ? wins / (wins + losses) : 0;
        
        teams.push({
            rank: index + 1,
            name: teamName,
            wins: wins,
            losses: losses,
            winPct: winPct,
            record: record
        });
    });
    
    return teams;
}

// Parse ESPN standings from paste
function parseEspnStandings() {
    const input = document.getElementById('espnInput').value;
    
    if (!input) {
        alert('Please paste ESPN standings');
        return;
    }
    
    // Split into lines
    const lines = input.split('\n').filter(line => line.trim());
    
    // Find conference markers
    let easternStart = -1;
    let westernStart = -1;
    
    lines.forEach((line, index) => {
        const lower = line.toLowerCase();
        if (lower.includes('eastern conference') || lower.includes('east')) {
            easternStart = index;
        }
        if (lower.includes('western conference') || lower.includes('west')) {
            westernStart = index;
        }
    });
    
    // Extract team data
    const easternTeamLines = [];
    const westernTeamLines = [];
    
    lines.forEach((line, index) => {
        // Skip headers and empty lines
        if (line.match(/^\s*$/) || line.includes('Conference') || line.includes('PCT') || line.includes('GB')) {
            return;
        }
        
        // Check if line contains a team
        const hasTeam = [...easternTeams, ...westernTeams].some(team => {
            const teamParts = team.split(' ');
            return teamParts.some(part => line.includes(part));
        });
        
        if (hasTeam) {
            if (westernStart > -1 && index > westernStart) {
                westernTeamLines.push(line);
            } else if (easternStart > -1 && index > easternStart) {
                easternTeamLines.push(line);
            }
        }
    });
    
    // Parse the teams
    currentStandings.eastern = parseEspnTeamLines(easternTeamLines, easternTeams);
    currentStandings.western = parseEspnTeamLines(westernTeamLines, westernTeams);
    
    // Update everything
    calculateScores();
    updateUI();
    saveToLocalStorage();
    
    // Close modal
    document.getElementById('urlModal').style.display = 'none';
    
    // Show success message
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = 'ESPN standings parsed successfully!';
    errorMessage.style.background = 'rgba(34, 197, 94, 0.2)';
    errorMessage.style.borderColor = '#22c55e';
    errorMessage.classList.add('active');
    setTimeout(() => {
        errorMessage.classList.remove('active');
        errorMessage.style.background = '';
        errorMessage.style.borderColor = '';
    }, 3000);
}

// Parse ESPN team lines
function parseEspnTeamLines(lines, conferenceTeams) {
    const teams = [];
    
    lines.forEach((line, index) => {
        // Find which team this is
        let teamName = '';
        for (const team of conferenceTeams) {
            if (line.includes(team) || 
                line.includes(team.split(' ').pop()) || 
                line.includes(team.split(' ')[0])) {
                teamName = team;
                break;
            }
        }
        
        if (!teamName) {
            // Try variations
            for (const [variation, fullName] of Object.entries(teamVariations)) {
                if (line.includes(variation) && conferenceTeams.includes(fullName)) {
                    teamName = fullName;
                    break;
                }
            }
        }
        
        if (teamName) {
            // Extract record (look for pattern like 20-4 or 20 4)
            const recordMatch = line.match(/(\d+)[\s-]+(\d+)/);
            let wins = 0, losses = 0, record = '0-0';
            
            if (recordMatch) {
                wins = parseInt(recordMatch[1]);
                losses = parseInt(recordMatch[2]);
                record = `${wins}-${losses}`;
            }
            
            const winPct = wins + losses > 0 ? wins / (wins + losses) : 0;
            
            teams.push({
                rank: index + 1,
                name: teamName,
                wins: wins,
                losses: losses,
                winPct: winPct,
                record: record
            });
        }
    });
    
    // Sort by win percentage to ensure correct ranking
    teams.sort((a, b) => {
        if (b.winPct !== a.winPct) return b.winPct - a.winPct;
        return b.wins - a.wins;
    });
    
    // Reassign ranks
    teams.forEach((team, index) => {
        team.rank = index + 1;
    });
    
    return teams;
}

// Calculate accuracy scores for all players
function calculateScores() {
    if (!currentStandings.eastern.length || !currentStandings.western.length) return;
    
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

// Update the UI
function updateUI() {
    updateScoreboard();
    updateStandingsTables();
    updateLastUpdated();
}

// Update the scoreboard
function updateScoreboard() {
    const scoreCardsContainer = document.getElementById('scoreCards');
    
    if (!playerScores || Object.keys(playerScores).length === 0) {
        scoreCardsContainer.innerHTML = '<p style="text-align: center; color: #999;">No standings loaded yet</p>';
        return;
    }
    
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

// Update standings tables
function updateStandingsTables() {
    updateConferenceStandings('eastern');
    updateConferenceStandings('western');
}

// Update a single conference standings table
function updateConferenceStandings(conference) {
    const container = document.getElementById(`${conference}Standings`);
    const standings = currentStandings[conference];
    
    if (!standings || standings.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No standings loaded</div>';
        return;
    }
    
    container.innerHTML = '';
    
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
                rank: predictedRank || '-',
                accuracy: predictedRank ? accuracy : 0
            };
        });
        
        row.innerHTML = `
            <div class="actual-rank">${team.rank}</div>
            <div class="team-info">
                <img src="${teamLogos[team.name] || ''}" alt="${team.name}" class="team-logo" onerror="this.style.display='none'">
                <span class="team-name">${team.name}</span>
            </div>
            <div class="team-record">${team.record}</div>
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
        
        container.appendChild(row);
    });
}

// Get accuracy class based on percentage
function getAccuracyClass(accuracy) {
    if (accuracy === 100) return 'accuracy-perfect';
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

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('nbaStandings', JSON.stringify(currentStandings));
    localStorage.setItem('nbaStandingsDate', new Date().toISOString());
}
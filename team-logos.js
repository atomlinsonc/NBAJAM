// NBA Team Logos Configuration
// Using ESPN's CDN for team logos

const teamLogos = {
    // Eastern Conference
    "Atlanta Hawks": "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
    "Boston Celtics": "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    "Brooklyn Nets": "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
    "Charlotte Hornets": "https://a.espncdn.com/i/teamlogos/nba/500/cha.png",
    "Chicago Bulls": "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    "Cleveland Cavaliers": "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
    "Detroit Pistons": "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
    "Indiana Pacers": "https://a.espncdn.com/i/teamlogos/nba/500/ind.png",
    "Miami Heat": "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
    "Milwaukee Bucks": "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
    "New York Knicks": "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
    "Orlando Magic": "https://a.espncdn.com/i/teamlogos/nba/500/orl.png",
    "Philadelphia 76ers": "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
    "Toronto Raptors": "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
    "Washington Wizards": "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png",
    
    // Western Conference
    "Dallas Mavericks": "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
    "Denver Nuggets": "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
    "Golden State Warriors": "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
    "Houston Rockets": "https://a.espncdn.com/i/teamlogos/nba/500/hou.png",
    "Los Angeles Clippers": "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
    "Los Angeles Lakers": "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    "Memphis Grizzlies": "https://a.espncdn.com/i/teamlogos/nba/500/mem.png",
    "Minnesota Timberwolves": "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
    "New Orleans Pelicans": "https://a.espncdn.com/i/teamlogos/nba/500/no.png",
    "Oklahoma City Thunder": "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
    "Phoenix Suns": "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
    "Portland Trail Blazers": "https://a.espncdn.com/i/teamlogos/nba/500/por.png",
    "Sacramento Kings": "https://a.espncdn.com/i/teamlogos/nba/500/sac.png",
    "San Antonio Spurs": "https://a.espncdn.com/i/teamlogos/nba/500/sa.png",
    "Utah Jazz": "https://a.espncdn.com/i/teamlogos/nba/500/utah.png"
};

// Team name mappings for API responses (in case of variations)
const teamNameMappings = {
    // ESPN API variations
    "LA Clippers": "Los Angeles Clippers",
    "LA Lakers": "Los Angeles Lakers",
    "Sixers": "Philadelphia 76ers",
    "76ers": "Philadelphia 76ers",
    "Blazers": "Portland Trail Blazers",
    "Pels": "New Orleans Pelicans",
    "Pelicans": "New Orleans Pelicans",
    "Cavs": "Cleveland Cavaliers",
    "Cavaliers": "Cleveland Cavaliers",
    "Wolves": "Minnesota Timberwolves",
    "Timberwolves": "Minnesota Timberwolves",
    "Warriors": "Golden State Warriors",
    "Mavs": "Dallas Mavericks",
    "Mavericks": "Dallas Mavericks",
    "Thunder": "Oklahoma City Thunder",
    "Nuggets": "Denver Nuggets",
    "Spurs": "San Antonio Spurs",
    "Grizzlies": "Memphis Grizzlies",
    "Hawks": "Atlanta Hawks",
    "Celtics": "Boston Celtics",
    "Nets": "Brooklyn Nets",
    "Hornets": "Charlotte Hornets",
    "Bulls": "Chicago Bulls",
    "Pistons": "Detroit Pistons",
    "Pacers": "Indiana Pacers",
    "Heat": "Miami Heat",
    "Bucks": "Milwaukee Bucks",
    "Knicks": "New York Knicks",
    "Magic": "Orlando Magic",
    "Raptors": "Toronto Raptors",
    "Wizards": "Washington Wizards",
    "Rockets": "Houston Rockets",
    "Kings": "Sacramento Kings",
    "Suns": "Phoenix Suns",
    "Jazz": "Utah Jazz"
};

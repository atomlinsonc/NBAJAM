// NBA JAM Predictions Data
// Actual predictions from the spreadsheet for Aaron, Austin, and Paul

const predictions = {
    aaron: {
        eastern: [
            "Cleveland Cavaliers",    // 1
            "New York Knicks",        // 2
            "Orlando Magic",          // 3
            "Atlanta Hawks",          // 4
            "Milwaukee Bucks",        // 5
            "Detroit Pistons",        // 6
            "Boston Celtics",         // 7
            "Miami Heat",             // 8
            "Philadelphia 76ers",     // 9
            "Toronto Raptors",        // 10
            "Charlotte Hornets",      // 11
            "Indiana Pacers",         // 12
            "Chicago Bulls",          // 13
            "Brooklyn Nets",          // 14
            "Washington Wizards"      // 15
        ],
        western: [
            "Oklahoma City Thunder",  // 1
            "Houston Rockets",        // 2
            "Denver Nuggets",         // 3
            "Minnesota Timberwolves", // 4
            "Los Angeles Lakers",     // 5
            "Golden State Warriors",  // 6
            "Los Angeles Clippers",   // 7
            "Dallas Mavericks",       // 8
            "Memphis Grizzlies",      // 9
            "San Antonio Spurs",      // 10
            "Phoenix Suns",           // 11
            "New Orleans Pelicans",   // 12
            "Sacramento Kings",       // 13
            "Utah Jazz",              // 14
            "Portland Trail Blazers"  // 15
        ]
    },
    austin: {
        eastern: [
            "Cleveland Cavaliers",    // 1
            "Orlando Magic",          // 2
            "New York Knicks",        // 3
            "Boston Celtics",         // 4
            "Detroit Pistons",        // 5
            "Milwaukee Bucks",        // 6
            "Atlanta Hawks",          // 7
            "Philadelphia 76ers",     // 8
            "Toronto Raptors",        // 9
            "Indiana Pacers",         // 10
            "Miami Heat",             // 11
            "Chicago Bulls",          // 12
            "Charlotte Hornets",      // 13
            "Washington Wizards",     // 14
            "Brooklyn Nets"           // 15
        ],
        western: [
            "Oklahoma City Thunder",  // 1
            "Houston Rockets",        // 2
            "Dallas Mavericks",       // 3
            "Denver Nuggets",         // 4
            "Minnesota Timberwolves", // 5
            "New Orleans Pelicans",   // 6
            "San Antonio Spurs",      // 7
            "Los Angeles Clippers",   // 8
            "Golden State Warriors",  // 9
            "Memphis Grizzlies",      // 10
            "Los Angeles Lakers",     // 11
            "Portland Trail Blazers", // 12
            "Phoenix Suns",           // 13
            "Sacramento Kings",       // 14
            "Utah Jazz"               // 15
        ]
    },
    paul: {
        eastern: [
            "New York Knicks",        // 1
            "Cleveland Cavaliers",    // 2
            "Orlando Magic",          // 3
            "Atlanta Hawks",          // 4
            "Indiana Pacers",         // 5
            "Philadelphia 76ers",     // 6
            "Detroit Pistons",        // 7
            "Toronto Raptors",        // 8
            "Miami Heat",             // 9
            "Brooklyn Nets",          // 10 (corrected from duplicate Atlanta Hawks)
            "Milwaukee Bucks",        // 11
            "Chicago Bulls",          // 12
            "Boston Celtics",         // 13
            "Washington Wizards",     // 14
            "Charlotte Hornets"       // 15
        ],
        western: [
            "Oklahoma City Thunder",  // 1
            "Denver Nuggets",         // 2
            "Minnesota Timberwolves", // 3
            "Los Angeles Clippers",   // 4
            "Houston Rockets",        // 5
            "Dallas Mavericks",       // 6
            "Golden State Warriors",  // 7
            "San Antonio Spurs",      // 8
            "Los Angeles Lakers",     // 9
            "Memphis Grizzlies",      // 10
            "Portland Trail Blazers", // 11
            "Phoenix Suns",           // 12
            "Sacramento Kings",       // 13
            "New Orleans Pelicans",   // 14
            "Utah Jazz"               // 15
        ]
    }
};

// INSTRUCTIONS FOR UPDATING PREDICTIONS:
// 1. Open your Google Spreadsheet with the predictions
// 2. For each player (Aaron, Austin, Paul, Gill):
//    - Replace the Eastern Conference teams in order from 1-15
//    - Replace the Western Conference teams in order from 1-15
// 3. Make sure team names match exactly as shown above
// 4. Save the file and commit to your GitHub repository
// 
// Team names must match exactly (including capitalization):
// Eastern Conference Teams:
// - Atlanta Hawks, Boston Celtics, Brooklyn Nets, Charlotte Hornets, Chicago Bulls
// - Cleveland Cavaliers, Detroit Pistons, Indiana Pacers, Miami Heat, Milwaukee Bucks
// - New York Knicks, Orlando Magic, Philadelphia 76ers, Toronto Raptors, Washington Wizards
//
// Western Conference Teams:
// - Dallas Mavericks, Denver Nuggets, Golden State Warriors, Houston Rockets, Los Angeles Clippers
// - Los Angeles Lakers, Memphis Grizzlies, Minnesota Timberwolves, New Orleans Pelicans
// - Oklahoma City Thunder, Phoenix Suns, Portland Trail Blazers, Sacramento Kings
// - San Antonio Spurs, Utah Jazz
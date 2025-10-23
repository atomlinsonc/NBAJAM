# NBA JAM - NBA Predictions Tracker

A real-time NBA standings prediction tracker that compares your friends' preseason predictions with actual NBA standings throughout the season.

![NBA JAM Preview](preview.png)

## Features

- 🏀 **Real-time NBA Standings** - Automatically fetches current NBA standings
- 📊 **Accuracy Scoring** - Calculates prediction accuracy for each player
- 🎯 **Visual Feedback** - Color-coded accuracy indicators (green = accurate, red = less accurate)
- 🏆 **Leaderboard** - Shows who's winning with combined conference accuracy
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔄 **Auto-refresh** - Updates standings every 5 minutes

## How Scoring Works

Each player's prediction accuracy is calculated based on how close their predicted seed is to the actual current seed:

- If a team is predicted at seed 7 and is currently at seed 10, that's 3 seeds off
- Accuracy = (14 - distance) / 14 * 100%
- In this example: (14 - 3) / 14 = 78.6% accuracy for that team
- Overall score is the average accuracy across all 30 teams

## Setup Instructions

### 1. Fork or Download this Repository

Click the "Fork" button on GitHub or download the ZIP file.

### 2. Update Predictions

Edit the `predictions.js` file with your actual predictions from your spreadsheet:

```javascript
const predictions = {
    aaron: {
        eastern: [
            "Boston Celtics",      // 1st seed prediction
            "New York Knicks",      // 2nd seed prediction
            // ... continue for all 15 teams
        ],
        western: [
            "Oklahoma City Thunder", // 1st seed prediction
            "Denver Nuggets",        // 2nd seed prediction
            // ... continue for all 15 teams
        ]
    },
    // Repeat for austin, paul, and gill
};
```

**Important:** Team names must match exactly as shown in the file comments.

### 3. Deploy to GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your site will be available at: `https://[your-username].github.io/[repository-name]/`

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js             # Main application logic
├── predictions.js      # Player predictions (EDIT THIS)
├── team-logos.js      # NBA team logo URLs
└── README.md          # This file
```

## Customization

### Adding/Removing Players

Edit `predictions.js` to add or remove players. Make sure each player has both `eastern` and `western` arrays with exactly 15 teams each.

### Changing Color Thresholds

Edit the `getAccuracyClass()` function in `app.js`:

```javascript
function getAccuracyClass(accuracy) {
    if (accuracy >= 90) return 'accuracy-excellent';  // Green
    if (accuracy >= 80) return 'accuracy-good';       // Light Green
    if (accuracy >= 70) return 'accuracy-fair';       // Yellow
    if (accuracy >= 60) return 'accuracy-poor';       // Orange
    return 'accuracy-bad';                             // Red
}
```

### Changing Update Frequency

In `app.js`, modify the refresh interval (currently 5 minutes):

```javascript
setInterval(fetchNBAStandings, 5 * 60 * 1000); // Change 5 to desired minutes
```

## API Information

This app uses the ESPN API to fetch current NBA standings. The API is free and doesn't require authentication. If the primary API fails, it automatically tries a backup source.

## Troubleshooting

### Standings Not Loading
- Check browser console for errors (F12 > Console)
- The CORS proxy might be down - try refreshing the page
- Make sure you're connected to the internet

### Team Names Not Matching
- Ensure team names in `predictions.js` match exactly with those in `team-logos.js`
- Check for typos and proper capitalization

### GitHub Pages Not Working
- Make sure the repository is public
- Wait 5-10 minutes after enabling GitHub Pages
- Check that all files are committed and pushed

## Browser Compatibility

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Feel free to use and modify for your own prediction games!

## Support

For issues or questions, please open an issue on GitHub or contact the repository owner.

---

**Have fun tracking your NBA predictions!** 🏀
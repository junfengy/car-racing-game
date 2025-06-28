# 🏎️ Car Racing Game

A fun browser-based car racing game where you control a car in the middle lane and avoid crashing into AI-controlled cars in the side lanes. Features a shared leaderboard powered by Supabase!

## 🎮 How to Play

1. **Open the game**: Open `index.html` in your web browser or visit the GitHub Pages link
2. **Controls**: 
   - 🅰️ **A Key**: Move left
   - 🅳 **D Key**: Move right
   - 🅂 **S Key**: Stop the car
   - 🔄 Release S to continue moving
3. **Objective**: Avoid crashing into the AI cars in all three lanes
4. **Scoring**: Earn points by surviving longer and letting AI cars pass you

## 🎯 Game Features

- **Three-lane road**: Your car can move between all lanes
- **Automatic forward movement**: Your car moves forward automatically
- **AI opponents**: Computer-controlled cars in all lanes
- **Collision detection**: Game resets when you crash
- **Score tracking**: Earn points for survival and car passing
- **Shared leaderboard**: Global leaderboard powered by Supabase
- **High score system**: Persistent high scores using localStorage
- **Progressive difficulty**: Game gets harder every 100 points
- **Time-based scoring**: +50 points every 10 seconds of survival
- **Smooth animations**: 60fps gameplay with requestAnimationFrame
- **Responsive design**: Works on different screen sizes
- **Email collection**: Optional email collection for leaderboard entries

## 🚀 How to Run

### Local Development
1. Download or clone this repository
2. **Set up Supabase** (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions):
   - Create a Supabase account at [supabase.com](https://supabase.com)
   - Create a new project and database table
   - Update `supabase-config.js` with your credentials
3. Start a local server: `python3 -m http.server 8000`
4. Open `http://localhost:8000` in your browser
5. Test the connection with `http://localhost:8000/test-supabase.html`

### GitHub Pages Deployment
1. Set up Supabase as described above
2. Push this repository to GitHub
3. Go to your repository Settings
4. Scroll down to "GitHub Pages" section
5. Select "Deploy from a branch"
6. Choose "main" branch and "/ (root)" folder
7. Click "Save"
8. Your game will be available at: `https://yourusername.github.io/repository-name`

## 🛠️ Technical Details

- **HTML5 Canvas**: For smooth 2D graphics rendering
- **Vanilla JavaScript**: No external dependencies required
- **CSS3**: Modern styling with gradients and animations
- **Supabase**: Real-time database for shared leaderboard
- **ES6 Modules**: Modern JavaScript module system
- **localStorage**: Persistent high score storage
- **Responsive design**: Works on desktop and mobile devices

## 🏆 Leaderboard System

- **Global leaderboard**: Scores shared across all players worldwide
- **Real-time updates**: Leaderboard updates immediately when new scores are added
- **One score per player**: Only the highest score for each email address is kept
- **Email privacy**: Email addresses are partially masked in the display
- **Top 10 scores**: Only the best scores are shown
- **Player names**: Uses email prefix as player name

## 🎨 Game Mechanics

- **Player Car**: Green car that can switch between lanes
- **AI Cars**: Randomly colored cars in all lanes
- **Road Animation**: Moving dashed lines create speed illusion
- **Physics**: Realistic acceleration and deceleration
- **Collision System**: Precise rectangle-based collision detection
- **Lane System**: Cars drive on yellow center lines
- **Difficulty Scaling**: Speed and car count increase with score

## 🏆 Scoring System

- **Car Passing**: +10 points per AI car that passes you
- **Survival Time**: +50 points every 10 seconds
- **High Score**: Persistent across browser sessions
- **Level Progression**: Every 100 points increases difficulty
- **Global Ranking**: Compare your score with players worldwide

## 🏆 Tips for High Scores

- Time your stops carefully to avoid oncoming cars
- Use lane switching strategically to avoid traffic
- Don't stop for too long - you need to keep moving
- Watch the patterns of AI cars to anticipate their movement
- Practice your timing to get better scores!

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (touch controls may vary)

## 🔧 Supabase Setup

For detailed instructions on setting up Supabase for the shared leaderboard, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

Quick setup:
1. Create Supabase account and project
2. Create `leaderboard` table with columns: `id`, `player_name`, `email`, `score`, `created_at`
3. Update `supabase-config.js` with your URL and anon key
4. Test connection with `test-supabase.html`

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Enjoy the game! 🏁 
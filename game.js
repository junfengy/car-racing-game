// Import Supabase leaderboard API
import { leaderboardAPI } from './supabase-config.js';

// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let highScore = 0; // Will be fetched from Supabase
let gameSpeed = 2;
let roadOffset = 0;
let difficultyLevel = 1;
let maxCarsOnScreen = 5;
let baseCarSpeed = 0.5;
let gameStartTime = Date.now();
let lastTimeBonus = 0;
let playerEmail = localStorage.getItem('playerEmail') || '';
let emailSubmitted = false;
let leaderboard = [];

// Car dimensions
const carWidth = 40;
const carHeight = 60;
const laneWidth = canvas.width / 4;

// Player car (middle lane)
const playerCar = {
    x: canvas.width / 2 - carWidth / 2,
    y: canvas.height - carHeight - 20,
    width: carWidth,
    height: carHeight,
    speed: 0,
    maxSpeed: 3,
    acceleration: 0.1,
    deceleration: 0.05,
    isStopped: false,
    lane: 1, // 0 = left, 1 = middle, 2 = right
    targetX: canvas.width / 2 - carWidth / 2
};

// AI cars array
let aiCars = [];

// Colors for different cars
const carColors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];

// Initialize AI cars
function initAICars() {
    aiCars = [];
    // Add cars to all three lanes with random speeds - cars drive on yellow lines
    aiCars.push({
        x: laneWidth - carWidth / 2, // Left yellow line
        y: -carHeight,
        width: carWidth,
        height: carHeight,
        speed: 0.5 + Math.random() * 0.8, // Speed between 0.5 and 1.3 (slower start)
        color: carColors[Math.floor(Math.random() * carColors.length)]
    });
    
    aiCars.push({
        x: canvas.width / 2 - carWidth / 2, // Center yellow line
        y: -carHeight * 2,
        width: carWidth,
        height: carHeight,
        speed: 0.5 + Math.random() * 0.8, // Speed between 0.5 and 1.3 (slower start)
        color: carColors[Math.floor(Math.random() * carColors.length)]
    });
    
    aiCars.push({
        x: canvas.width - laneWidth - carWidth / 2, // Right yellow line
        y: -carHeight * 3,
        width: carWidth,
        height: carHeight,
        speed: 0.5 + Math.random() * 0.8, // Speed between 0.5 and 1.3 (slower start)
        color: carColors[Math.floor(Math.random() * carColors.length)]
    });
}

// Draw a car
function drawCar(car, color = '#2ecc71') {
    ctx.fillStyle = color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Car details
    ctx.fillStyle = '#34495e';
    ctx.fillRect(car.x + 5, car.y + 5, car.width - 10, car.height - 10);
    
    // Windows
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(car.x + 8, car.y + 8, car.width - 16, 15);
    ctx.fillRect(car.x + 8, car.y + car.height - 23, car.width - 16, 15);
    
    // Wheels
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(car.x - 3, car.y + 5, 6, 10);
    ctx.fillRect(car.x + car.width - 3, car.y + 5, 6, 10);
    ctx.fillRect(car.x - 3, car.y + car.height - 15, 6, 10);
    ctx.fillRect(car.x + car.width - 3, car.y + car.height - 15, 6, 10);
}

// Draw the road
function drawRoad() {
    // Road background
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Road lines
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 5;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = roadOffset;
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Lane dividers - left lane
    ctx.beginPath();
    ctx.moveTo(laneWidth, 0);
    ctx.lineTo(laneWidth, canvas.height);
    ctx.stroke();
    
    // Lane dividers - right lane
    ctx.beginPath();
    ctx.moveTo(canvas.width - laneWidth, 0);
    ctx.lineTo(canvas.width - laneWidth, canvas.height);
    ctx.stroke();
    
    // Additional lane divider lines for better separation
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    // Left lane divider (between left and middle)
    ctx.beginPath();
    ctx.moveTo(laneWidth * 1.5, 0);
    ctx.lineTo(laneWidth * 1.5, canvas.height);
    ctx.stroke();
    
    // Right lane divider (between middle and right)
    ctx.beginPath();
    ctx.moveTo(canvas.width - laneWidth * 1.5, 0);
    ctx.lineTo(canvas.width - laneWidth * 1.5, canvas.height);
    ctx.stroke();
    
    ctx.setLineDash([]);
}

// Update player car movement
function updatePlayerCar() {
    if (playerCar.isStopped) {
        // Decelerate when stopped
        if (playerCar.speed > 0) {
            playerCar.speed -= playerCar.deceleration;
            if (playerCar.speed < 0) playerCar.speed = 0;
        }
    } else {
        // Accelerate when moving
        if (playerCar.speed < playerCar.maxSpeed) {
            playerCar.speed += playerCar.acceleration;
        }
    }
    
    // Smooth lane movement - cars drive on the yellow lines
    if (playerCar.lane === 0) {
        playerCar.targetX = laneWidth - carWidth / 2; // Left yellow line
    } else if (playerCar.lane === 1) {
        playerCar.targetX = canvas.width / 2 - carWidth / 2; // Center yellow line
    } else if (playerCar.lane === 2) {
        playerCar.targetX = canvas.width - laneWidth - carWidth / 2; // Right yellow line
    }
    
    // Smooth movement towards target position
    const moveSpeed = 0.05; // Reduced from 0.1 for more gradual movement
    playerCar.x += (playerCar.targetX - playerCar.x) * moveSpeed;
    
    // Update road movement based on player speed
    roadOffset += playerCar.speed;
    if (roadOffset > 40) roadOffset = 0;
}

// Update AI cars
function updateAICars() {
    for (let i = aiCars.length - 1; i >= 0; i--) {
        const car = aiCars[i];
        car.y += car.speed;
        
        // Remove cars that are off screen
        if (car.y > canvas.height) {
            aiCars.splice(i, 1);
            score += 10;
        }
    }
    
    // Check for difficulty increase every 100 points
    const newDifficultyLevel = Math.floor(score / 100) + 1;
    if (newDifficultyLevel > difficultyLevel) {
        difficultyLevel = newDifficultyLevel;
        maxCarsOnScreen = Math.min(5 + difficultyLevel, 12); // Max 12 cars
        baseCarSpeed = 0.5 + (difficultyLevel - 1) * 0.3; // Increase base speed from 0.5
    }
    
    // Add new AI cars randomly on all lanes
    if (Math.random() < (0.015 + difficultyLevel * 0.003) && aiCars.length < maxCarsOnScreen) { // Spawn if less than max cars on screen
        // Check which lanes currently have cars
        const lanesWithCars = new Set();
        for (const car of aiCars) {
            if (car.y < canvas.height && car.y > -carHeight) { // Only consider cars on screen
                if (Math.abs(car.x - (laneWidth - carWidth / 2)) < 10) {
                    lanesWithCars.add(0); // Left lane
                } else if (Math.abs(car.x - (canvas.width / 2 - carWidth / 2)) < 10) {
                    lanesWithCars.add(1); // Middle lane
                } else if (Math.abs(car.x - (canvas.width - laneWidth - carWidth / 2)) < 10) {
                    lanesWithCars.add(2); // Right lane
                }
            }
        }
        
        // Only spawn if there's at least one safe lane
        if (lanesWithCars.size < 3) {
            // Check minimum distance from existing cars
            const minDistance = 80; // Minimum vertical distance between cars
            let canSpawn = true;
            
            for (const car of aiCars) {
                if (car.y > -carHeight - minDistance && car.y < canvas.height) {
                    canSpawn = false;
                    break;
                }
            }
            
            if (canSpawn) {
                // Spawn 2-3 cars at once
                const carsToSpawn = Math.min(2 + Math.floor(Math.random() * 2), 3); // 2-3 cars
                const availableLanes = [0, 1, 2].filter(lane => !lanesWithCars.has(lane));
                
                for (let i = 0; i < carsToSpawn && availableLanes.length > 0; i++) {
                    // Randomly choose from available lanes
                    const laneIndex = Math.floor(Math.random() * availableLanes.length);
                    const lane = availableLanes[laneIndex];
                    availableLanes.splice(laneIndex, 1); // Remove used lane
                    
                    let x;
                    if (lane === 0) {
                        x = laneWidth - carWidth / 2; // Left yellow line
                    } else if (lane === 1) {
                        x = canvas.width / 2 - carWidth / 2; // Center yellow line
                    } else {
                        x = canvas.width - laneWidth - carWidth / 2; // Right yellow line
                    }
                    
                    aiCars.push({
                        x: x,
                        y: -carHeight - (i * 20), // Stagger cars vertically
                        width: carWidth,
                        height: carHeight,
                        speed: baseCarSpeed + Math.random() * 1.5, // Speed based on difficulty (reduced range)
                        color: carColors[Math.floor(Math.random() * carColors.length)]
                    });
                }
            }
        }
    }
}

// Check collision between two cars
function checkCollision(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

// Check for collisions
function checkCollisions() {
    for (const aiCar of aiCars) {
        if (checkCollision(playerCar, aiCar)) {
            gameOver();
            return;
        }
    }
}

// Game over function
async function gameOver() {
    gameRunning = false;
    
    // Check if player has email before submitting score
    if (!playerEmail) {
        // Check if this might be a high score
        const isPotentialHighScore = score >= highScore;
        if (isPotentialHighScore) {
            showEmailForm();
            return; // Don't show game over screen yet
        }
    }
    
    // Add score to leaderboard using Supabase
    if (playerEmail) {
        try {
            await leaderboardAPI.addScore(playerEmail.split('@')[0], playerEmail, score);
            console.log('Score submitted to leaderboard successfully');
            
            // Refresh the highest score from Supabase after submitting
            await fetchHighestScore();
        } catch (error) {
            console.error('Failed to submit score:', error.message);
            // Show user-friendly error message
            if (error.message.includes('wait before submitting')) {
                alert('Score submission rate limited. Please wait a moment before trying again.');
            } else if (error.message.includes('Invalid')) {
                alert('Score submission failed due to invalid data. Please try again.');
            } else {
                alert('Failed to submit score to leaderboard. Your local high score has been saved.');
            }
        }
    }
    
    // Check for new high score after fetching updated high score
    const isNewHighScore = score >= highScore;
    
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('highScoreDisplay').textContent = highScore;
    
    // Show new high score celebration
    const newHighScoreElement = document.getElementById('newHighScore');
    if (isNewHighScore) {
        newHighScoreElement.style.display = 'block';
    } else {
        newHighScoreElement.style.display = 'none';
    }
}

// Restart game function
function restartGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 2;
    roadOffset = 0;
    difficultyLevel = 1;
    maxCarsOnScreen = 5;
    baseCarSpeed = 0.5;
    gameStartTime = Date.now();
    lastTimeBonus = 0;
    
    // Reset player car
    playerCar.x = canvas.width / 2 - carWidth / 2;
    playerCar.y = canvas.height - carHeight - 20;
    playerCar.speed = 0;
    playerCar.isStopped = false;
    playerCar.lane = 1;
    playerCar.targetX = canvas.width / 2 - carWidth / 2;
    
    // Reset AI cars
    initAICars();
    
    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
    
    // Refresh the highest score from Supabase
    fetchHighestScore();
    
    // Restart the game loop
    gameLoop();
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = `Score: ${score} | High Score: ${highScore} | Level: ${difficultyLevel}`;
}

// Check for time-based scoring
function checkTimeBonus() {
    const currentTime = Date.now();
    const survivalTime = Math.floor((currentTime - gameStartTime) / 1000); // Time in seconds
    const currentTimeBonus = Math.floor(survivalTime / 10) * 50; // 50 points every 10 seconds
    
    if (currentTimeBonus > lastTimeBonus) {
        const pointsToAdd = currentTimeBonus - lastTimeBonus;
        score += pointsToAdd; // Add the difference in points
        lastTimeBonus = currentTimeBonus;
    }
}

// Email collection functions
function submitEmail() {
    const email = document.getElementById('playerEmail').value;
    if (email && isValidEmail(email)) {
        playerEmail = email;
        localStorage.setItem('playerEmail', email);
        emailSubmitted = true;
        hideEmailForm();
        fetchHighestScore().then(() => {
            startGame();
        });
    } else {
        alert('Please enter a valid email address!');
    }
}

function skipEmail() {
    emailSubmitted = true;
    hideEmailForm();
    fetchHighestScore().then(() => {
        startGame();
    });
}

function hideEmailForm() {
    document.getElementById('emailForm').style.display = 'none';
}

function showEmailForm() {
    document.getElementById('emailForm').style.display = 'block';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function startGame() {
    gameRunning = true;
    initAICars();
    gameLoop();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    drawRoad();
    
    // Update game objects
    updatePlayerCar();
    updateAICars();
    checkCollisions();
    checkTimeBonus(); // Check for time-based scoring
    updateScore();
    
    // Draw cars
    drawCar(playerCar);
    for (const aiCar of aiCars) {
        drawCar(aiCar, aiCar.color);
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 's' || e.key === 'S') {
        playerCar.isStopped = true;
    }
    if ((e.key === 'a' || e.key === 'A') && !playerCar.isStopped) {
        if (playerCar.lane > 0) {
            playerCar.lane--;
        }
    }
    if ((e.key === 'd' || e.key === 'D') && !playerCar.isStopped) {
        if (playerCar.lane < 2) {
            playerCar.lane++;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 's' || e.key === 'S') {
        playerCar.isStopped = false;
    }
});

// Initialize and start the game
console.log('Stored email:', playerEmail); // Debug log

// Fetch the highest score from Supabase when the game loads
fetchHighestScore().then(() => {
    if (!playerEmail) {
        console.log('No email found, showing form'); // Debug log
        showEmailForm();
    } else {
        console.log('Email found, starting game directly'); // Debug log
        emailSubmitted = true;
        startGame();
    }
});

// Leaderboard functions
async function showLeaderboard() {
    await updateLeaderboardDisplay();
    document.getElementById('leaderboardModal').style.display = 'block';
}

function hideLeaderboard() {
    document.getElementById('leaderboardModal').style.display = 'none';
}

async function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    try {
        // Show loading state
        leaderboardList.innerHTML = '<p>Loading leaderboard...</p>';
        
        // Fetch leaderboard from Supabase
        const topScores = await leaderboardAPI.getTopScores(10);
        
        if (topScores.length === 0) {
            leaderboardList.innerHTML = '<p>No scores yet. Be the first to set a record!</p>';
            return;
        }
        
        let html = '<div class="leaderboard-entries">';
        topScores.forEach((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            const playerName = entry.player_name || entry.email.split('@')[0] + '@***';
            const date = new Date(entry.created_at).toLocaleDateString();
            html += `
                <div class="leaderboard-entry">
                    <span class="rank">${medal} #${index + 1}</span>
                    <span class="player">${playerName}</span>
                    <span class="date">${date} - ${entry.score} pts</span>
                </div>
            `;
        });
        html += '</div>';
        leaderboardList.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<p>Error loading leaderboard. Please try again later.</p>';
    }
}

// Export functions to global scope for HTML onclick handlers
window.submitEmail = submitEmail;
window.skipEmail = skipEmail;
window.showLeaderboard = showLeaderboard;
window.hideLeaderboard = hideLeaderboard;
window.restartGame = restartGame;

// Function to fetch the highest score from Supabase
async function fetchHighestScore() {
    try {
        // Reset highScore to 0 first to ensure we get fresh data
        highScore = 0;
        
        const scores = await leaderboardAPI.getTopScores(1);
        if (scores.length > 0) {
            highScore = scores[0].score;
            console.log('Fetched highest score from Supabase:', highScore);
        } else {
            highScore = 0;
            console.log('No scores found in Supabase, using 0 as high score');
        }
        updateScore(); // Update the display
    } catch (error) {
        console.error('Error fetching highest score:', error);
        // If Supabase fails, keep the current highScore value
        updateScore();
    }
} 
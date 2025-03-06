/***********************************************
 * 1) MATRIX EFFECT + PARTICLE ANIMATION CODE
 ***********************************************/
function initializeMatrixEffect() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return; // Safeguard if no matrix canvas
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Setup for Matrix effect
  const letters = Array(256).join("0").split(""); 
  function drawMatrix() {
    // Slightly transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Green text
    ctx.fillStyle = "#0f0";
    letters.forEach((y_pos, index) => {
      const text = String.fromCharCode(3e4 + Math.random() * 33);
      const x_pos = index * 10;
      ctx.fillText(text, x_pos, y_pos);

      // Random reset
      if (y_pos > 100 + Math.random() * 1e5) {
        letters[index] = 0;
      } else {
        letters[index] = y_pos + 10;
      }
    });
  }
  setInterval(drawMatrix, 50);
}

/* Particle Effects */
function createParticle(e) {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = e.pageX + 'px';
  particle.style.top = e.pageY + 'px';
  container.appendChild(particle);

  setTimeout(() => {
    container.removeChild(particle);
  }, 2000);
}

function createEnergyWave(x, y) {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const wave = document.createElement('div');
  wave.className = 'energy-wave';
  wave.style.left = (x - 100) + 'px';
  wave.style.top = (y - 100) + 'px';
  container.appendChild(wave);

  setTimeout(() => {
    container.removeChild(wave);
  }, 3000);
}

/***********************************************
 * 2) MOBILE NAVIGATION CODE (unchanged)
 ***********************************************/
function setupMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const projectsToggleBtn = document.getElementById('projects-toggle-btn');
  const mobileProjectsDropdown = document.getElementById('mobile-dropdown');

  if (!hamburger || !mobileMenu) return;

  // Make sure the mobile menu starts closed
  mobileMenu.classList.remove('open');

  // Toggle overlay on hamburger click
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Toggle Projects submenu on mobile
  if (projectsToggleBtn && mobileProjectsDropdown) {
    projectsToggleBtn.addEventListener('click', () => {
      mobileProjectsDropdown.classList.toggle('open');
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

function handleScroll() {
  // Turn hamburger red on scroll
  const hamburger = document.getElementById('hamburger');
  if (!hamburger) return;

  if (window.scrollY > 50) {
    hamburger.classList.add('scrolled');
  } else {
    hamburger.classList.remove('scrolled');
  }
}

/***********************************************
 * 3) GALAGA-STYLE GAME CODE
 ***********************************************/

// Canvas & context (for the game)
let canvas, ctx;

// Player
let player, shipImg;

// Bullets & Enemies
let bullets = [];
let enemies = [];

// Game states
let score = 0;
let gameOver = false;
let gameWin = false;

// Settings
const playerWidth = 40;     // final drawn size of your ship image
const playerHeight = 40;    // tweak to match your PNG proportions
const playerSpeed = 4;      // slower horizontal movement
const bulletSpeed = 5;      // slower bullet
const enemySpeed = 0.3;     // slower enemy descent
const enemyWidth = 20;
const enemyHeight = 20;
const rowsOfEnemies = 3;    // fewer rows to keep it simpler
const enemiesPerRow = 7;    // you can adjust
const enemySpacingX = 60;
const enemySpacingY = 60;

// Key press tracking
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;

// To limit firing rate
let shootCooldown = 0; // frames until you can shoot again

function initGame() {
  // Setup the game canvas
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return; // safeguard if no canvas
  ctx = canvas.getContext('2d');

  // Load the player ship image
  shipImg = new Image();
  shipImg.src = 'images/ship.png';

  resetGame();
  // Listen for key events
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  // Optional: handle a mobile "shoot" button if you want
  const shootBtn = document.getElementById('shootButton');
  if (shootBtn) {
    shootBtn.addEventListener('click', () => {
      if (!gameOver) shootBullet();
    });
  }

  // Start the update-draw loop
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  // Reset game variables
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;
  gameWin = false;
  shootCooldown = 0;

  // Place player at bottom center
  if (canvas) {
    player = {
      x: canvas.width / 2 - playerWidth / 2,
      y: canvas.height - playerHeight - 10,
      width: playerWidth,
      height: playerHeight
    };
  }

  // Create new enemies
  createEnemies();
}

function createEnemies() {
  for (let row = 0; row < rowsOfEnemies; row++) {
    for (let col = 0; col < enemiesPerRow; col++) {
      enemies.push({
        x: 50 + col * enemySpacingX,
        y: 50 + row * enemySpacingY,
        width: enemyWidth,
        height: enemyHeight,
        alive: true
      });
    }
  }
}

function keyDownHandler(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = true;
  if (e.code === 'Space') spacePressed = true;

  // R to restart if game over
  if (e.code === 'KeyR' && gameOver) {
    resetGame();
    requestAnimationFrame(gameLoop);
  }
}

function keyUpHandler(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = false;
  if (e.code === 'Space') spacePressed = false;
}

function shootBullet() {
  // Create a bullet from the player's center top
  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10
  });
}

function update() {
  if (gameOver) return; // don’t update if game ended

  // Move player
  if (leftPressed && player.x > 0) {
    player.x -= playerSpeed;
  }
  if (rightPressed && player.x < canvas.width - player.width) {
    player.x += playerSpeed;
  }

  // Handle shooting (limit rate)
  if (spacePressed && shootCooldown <= 0) {
    shootBullet();
    shootCooldown = 30; // wait 30 frames before next shot
  }
  if (shootCooldown > 0) shootCooldown--;

  // Move bullets
  bullets.forEach((b) => {
    b.y -= bulletSpeed;
  });
  // Remove bullets off screen
  bullets = bullets.filter((b) => b.y + b.height > 0);

  // Move enemies
  enemies.forEach((e) => {
    if (e.alive) {
      e.y += enemySpeed;
      // If an enemy goes past the bottom -> game over (lose)
      if (e.y > canvas.height) {
        gameOver = true;
        gameWin = false;
      }
    }
  });

  // Bullet-enemy collisions
  for (let i = 0; i < enemies.length; i++) {
    let e = enemies[i];
    if (!e.alive) continue;

    for (let j = 0; j < bullets.length; j++) {
      let b = bullets[j];
      // basic collision check
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        // Bullet hits enemy
        e.alive = false;
        bullets.splice(j, 1); // remove bullet
        j--;
        score += 100;
        break;
      }
    }
  }

  // Check if all enemies are destroyed
  const anyAlive = enemies.some((e) => e.alive === true);
  if (!anyAlive) {
    // All enemies destroyed -> you win
    gameOver = true;
    gameWin = true;
  }
}

function draw() {
  if (!canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Score in the top-left
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 25);

  // Draw player (ship image)
  if (shipImg) {
    ctx.drawImage(shipImg, player.x, player.y, player.width, player.height);
  }

  // Draw bullets
  ctx.fillStyle = '#ff0';
  bullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Draw enemies (as "$")
  ctx.fillStyle = '#0f0';
  ctx.font = '20px Arial';
  enemies.forEach((enemy) => {
    if (enemy.alive) {
      ctx.fillText('$', enemy.x, enemy.y + enemy.height);
    }
  });

  // If game over, draw a message
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    let message = gameWin ? 'YOU WIN!' : 'GAME OVER!';
    ctx.fillText(message, canvas.width / 2 - 70, canvas.height / 2 - 10);

    ctx.font = '20px Arial';
    ctx.fillText('Press R to Restart', canvas.width / 2 - 90, canvas.height / 2 + 20);
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

/***********************************************
 * 4) DOM LOAD: INIT EVERYTHING
 ***********************************************/
document.addEventListener('DOMContentLoaded', () => {
  // 1. Start matrix background
  initializeMatrixEffect();

  // 2. Particle click effect (if desired)
  document.addEventListener('click', (e) => {
    createParticle(e);
    createEnergyWave(e.pageX, e.pageY);
  });

  // 3. Mobile nav
  setupMobileNav();
  window.addEventListener('scroll', handleScroll);

  // 4. Initialize Galaga game
  initGame();
});

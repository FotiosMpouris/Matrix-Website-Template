/***********************************************
 * 1) MOBILE NAV CODE (unchanged from your site)
 **********************************************/

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

/****************************************************
 * 2) GALAGA-STYLE GAME CODE
 ****************************************************/

// Canvas & Context
let canvas, ctx;

// Game Objects
let player;
let bullets = [];
let enemies = [];

// Settings
const playerWidth = 40;
const playerHeight = 20;
const playerSpeed = 5;
const bulletSpeed = 8;
const enemySpeed = 0.5;
const enemyWidth = 20;
const enemyHeight = 20;
const rowsOfEnemies = 4;
const enemiesPerRow = 8;
const enemySpacingX = 60;
const enemySpacingY = 50;

// Key press tracking
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;

function init() {
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return; // safeguard if no canvas present

  ctx = canvas.getContext('2d');

  // Create player in bottom center
  player = {
    x: canvas.width / 2 - playerWidth / 2,
    y: canvas.height - playerHeight - 10,
    width: playerWidth,
    height: playerHeight
  };

  // Create enemies
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

  // Listen for keys
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  // Start loop
  requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = true;
  if (e.code === 'Space') spacePressed = true;
}
function keyUpHandler(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = false;
  if (e.code === 'Space') spacePressed = false;
}

function shootBullet() {
  // Bullet from player center
  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10
  });
}

let shootCooldown = 0; // to prevent bullet spam

function update() {
  // Move player
  if (leftPressed && player.x > 0) {
    player.x -= playerSpeed;
  }
  if (rightPressed && player.x < canvas.width - player.width) {
    player.x += playerSpeed;
  }

  // Handle shooting
  if (spacePressed && shootCooldown <= 0) {
    shootBullet();
    shootCooldown = 20; // frames until next shot
  }
  if (shootCooldown > 0) shootCooldown--;

  // Move bullets
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bulletSpeed;
  }
  // Remove bullets off screen
  bullets = bullets.filter(b => b.y > -b.height);

  // Move enemies down slowly
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].alive) {
      enemies[i].y += enemySpeed;
      // If an enemy goes below bottom, you could trigger "game over" logic
      // but here we'll just let it pass
    }
  }

  // Check collisions (bullets vs enemies)
  for (let i = 0; i < enemies.length; i++) {
    if (!enemies[i].alive) continue;
    let e = enemies[i];

    for (let j = 0; j < bullets.length; j++) {
      let b = bullets[j];
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        // Collision
        e.alive = false;
        // Remove the bullet too
        bullets.splice(j, 1);
        j--;
        break;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = '#00f';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets
  ctx.fillStyle = '#ff0';
  for (let i = 0; i < bullets.length; i++) {
    ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
  }

  // Draw enemies (as "$")
  ctx.fillStyle = '#0a0';
  ctx.font = '20px Arial';
  enemies.forEach((enemy) => {
    if (enemy.alive) {
      ctx.fillText('$', enemy.x, enemy.y + enemy.height);
    }
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/****************************************************
 * On DOM load, run what we need
 ****************************************************/

document.addEventListener('DOMContentLoaded', () => {
  // Set up mobile nav
  setupMobileNav();
  window.addEventListener('scroll', handleScroll);

  // Initialize the game
  init();
});

function initializeMatrixEffect() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800; // Fixed size for game
  canvas.height = 500;
  const letters = Array(256).join("0").split("");

  // Make drawMatrix accessible globally for the game
  window.drawMatrix = function() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f0";
    letters.forEach((y_pos, index) => {
      const text = String.fromCharCode(3e4 + Math.random() * 33);
      const x_pos = index * 10;
      ctx.fillText(text, x_pos, y_pos);
      if (y_pos > 100 + Math.random() * 1e5) letters[index] = 0;
      else letters[index] = y_pos + 10;
    });
  };
  setInterval(window.drawMatrix, 50);

  window.addEventListener('resize', () => {
    canvas.width = 800;
    canvas.height = 500;
  });
}

function startGame() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.style.display = 'none');

  let player = { x: 400, y: 450, width: 30, height: 30, speed: 5, lives: 3 };
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let score = 0;
  let timeLeft = 60;
  let lastFire = 0;
  let lastEnemyFire = 0;
  let wave = 1;
  const keys = {};

  clearInterval(window.drawMatrixInterval);
  window.drawMatrixInterval = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Low opacity background
    ctx.fillRect(0, 0, 800, 500);
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)"; // Slower, less intense green
    let letters = Array(100).join("0").split("");
    letters.forEach((y_pos, index) => {
      const text = String.fromCharCode(3e4 + Math.random() * 33);
      const x_pos = index * 15;
      ctx.fillText(text, x_pos, y_pos);
      if (y_pos > 500) letters[index] = 0;
      else letters[index] = y_pos + 5;
    });
  }, 100);

  function spawnEnemyWave() {
    for (let i = 0; i < wave * 2; i++) { // More enemies per wave
      enemies.push({
        x: Math.random() * 700 + 50, // Random x position
        y: -20,
        width: 20,
        height: 20,
        speed: 1 + wave * 0.5, // Increase speed with wave
      });
    }
    wave++;
  }

  setInterval(spawnEnemyWave, 5000); // New wave every 5 seconds
  spawnEnemyWave(); // Initial wave

  function gameLoop() {
    ctx.clearRect(0, 0, 800, 500);

    // Player Ship (Triangle)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();

    // Move Player
    if (keys['ArrowLeft'] && player.x - player.width / 2 > 0) {
      player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width / 2 < 800) {
      player.x += player.speed;
    }
    if (keys['Space'] && Date.now() - lastFire > 200) { // Fire every 200ms
      bullets.push({ x: player.x, y: player.y - player.height / 2, dy: -7 });
      lastFire = Date.now();
    }

    // Player Bullets
    ctx.fillStyle = 'red';
    bullets = bullets.filter(b => b.y > 0);
    bullets.forEach(b => {
      ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
      b.y += b.dy;
    });

    // Enemy Bullets
    ctx.fillStyle = 'blue';
    enemyBullets = enemyBullets.filter(eb => eb.y < 500);
    enemyBullets.forEach(eb => {
      ctx.fillRect(eb.x - 2, eb.y, 4, 10);
      eb.y += eb.dy;
      // Collision with player
      if (Math.abs(eb.x - player.x) < 20 && Math.abs(eb.y - player.y) < 20) {
        player.lives--;
        enemyBullets.splice(enemyBullets.indexOf(eb), 1);
        if (player.lives <= 0) {
          endGame('Game Over! Score: ' + score);
        }
      }
    });

    // Enemies (with tentacles)
    ctx.fillStyle = 'blue';
    enemies = enemies.filter(e => e.y < 500);
    enemies.forEach((e, eIndex) => {
      e.y += e.speed;
      ctx.fillRect(e.x, e.y, e.width, e.height);
      // Tentacles
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x + 5, e.y + 20);
      ctx.lineTo(e.x + 5, e.y + 30);
      ctx.moveTo(e.x + 15, e.y + 20);
      ctx.lineTo(e.x + 15, e.y + 30);
      ctx.stroke();

      // Enemy firing
      if (Date.now() - lastEnemyFire > 1000 && Math.random() < 0.02) {
        enemyBullets.push({ x: e.x + e.width / 2, y: e.y + e.height, dy: 5 });
        lastEnemyFire = Date.now();
      }

      // Collision with player bullets
      bullets.forEach((b, bIndex) => {
        if (Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15) {
          score += 10;
          enemies.splice(eIndex, 1);
          bullets.splice(bIndex, 1);
        }
      });

      // Collision with player
      if (Math.abs(e.x - player.x) < 30 && Math.abs(e.y - player.y) < 30) {
        player.lives--;
        enemies.splice(eIndex, 1);
        if (player.lives <= 0) {
          endGame('Game Over! Score: ' + score);
        }
      }
    });

    // Score, Lives, and Timer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 50, 250, 90); // Below navbar
    ctx.fillStyle = 'white';
    ctx.font = '20px Segoe UI';
    ctx.fillText('Score: ' + score, 20, 80);
    ctx.fillText('Lives: ' + player.lives, 20, 110);
    ctx.fillText('Time: ' + Math.ceil(timeLeft) + 's', 20, 140);

    if (timeLeft > 0) {
      timeLeft -= 0.016;
    } else {
      endGame('Victory! Score: ' + score);
    }

    requestAnimationFrame(gameLoop);
  }

  function endGame(message) {
    sections.forEach(section => section.style.display = 'block');
    const existingPopup = document.querySelector('.game-popup');
    if (existingPopup) existingPopup.remove();
    const popup = document.createElement('div');
    popup.className = 'game-popup';
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 20px; border-radius: 10px; z-index: 1000; text-align: center; font-size: 1.5rem;';
    popup.innerHTML = `${message} <br><button onclick="this.parentElement.remove(); window.location.reload();" style="margin-top: 10px; padding: 5px 10px; background: var(--blood-red); color: white; border: none; cursor: pointer;">OK</button>`;
    document.body.appendChild(popup);
  }

  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });
  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  gameLoop();
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

/* Mobile Nav Toggles */
function setupMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const projectsToggleBtn = document.getElementById('projects-toggle-btn');
  const mobileProjectsDropdown = document.getElementById('mobile-dropdown');

  if (!hamburger || !mobileMenu) return;
  
  mobileMenu.classList.remove('open');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  if (projectsToggleBtn && mobileProjectsDropdown) {
    projectsToggleBtn.addEventListener('click', () => {
      mobileProjectsDropdown.classList.toggle('open');
    });
  }
  
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

function handleScroll() {
  const hamburger = document.getElementById('hamburger');
  if (!hamburger) return;

  if (window.scrollY > 50) {
    hamburger.classList.add('scrolled');
  } else {
    hamburger.classList.remove('scrolled');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeMatrixEffect();

  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) mobileMenu.classList.remove('open');

  document.addEventListener('click', (e) => {
    createParticle(e);
    createEnergyWave(e.pageX, e.pageY);
  });

  setupMobileNav();
  window.addEventListener('scroll', handleScroll);
});

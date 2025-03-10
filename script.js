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

  let player = { x: 400, y: 450, width: 30, height: 30, speed: 5, lives: 5, hitTime: 0 };
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let score = 0;
  let timeLeft = 60;
  let lastFire = 0;
  let lastEnemyFire = 0;
  let wave = 1;
  const keys = {};
  let letters = Array(150).join("0").split("");

  // Matrix Rain
  function drawMatrixRain() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, 800, 500);
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    letters.forEach((y_pos, index) => {
      const text = String.fromCharCode(3e4 + Math.random() * 33);
      const x_pos = index * 10;
      ctx.fillText(text, x_pos, y_pos);
      if (y_pos > 500) letters[index] = 0;
      else letters[index] = y_pos + 3;
    });
  }

  clearInterval(window.drawMatrixInterval);
  window.drawMatrixInterval = setInterval(drawMatrixRain, 80);

  function spawnEnemyWave() {
    const enemyCount = wave * 2;
    const spacing = 800 / (enemyCount + 1); // Even horizontal distribution
    for (let i = 0; i < enemyCount; i++) {
      const x = (i + 1) * spacing + (Math.random() * 50 - 25); // Spread with slight variation
      enemies.push({
        x: Math.max(20, Math.min(780, x)), // Keep within canvas
        y: -20,
        width: 20,
        height: 20,
        speed: 0.5 + wave * 0.1,
      });
    }
    wave++;
  }

  setInterval(spawnEnemyWave, 5000);
  spawnEnemyWave();

  function gameLoop() {
    ctx.clearRect(0, 0, 800, 500);
    drawMatrixRain();

    // Player Ship (Triangle with glow on hit)
    if (player.hitTime > 0) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = "red";
      player.hitTime -= 0.016;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Move Player
    if (keys['ArrowLeft'] && player.x - player.width / 2 > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x + player.width / 2 < 800) player.x += player.speed;
    if (keys[' '] && Date.now() - lastFire > 200) {
      bullets.push({ x: player.x, y: player.y - player.height / 2, dy: -5 });
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
      if (Math.abs(eb.x - player.x) < 20 && Math.abs(eb.y - player.y) < 20) {
        player.lives--;
        player.hitTime = 0.5; // Glow for 0.5 seconds
        enemyBullets.splice(enemyBullets.indexOf(eb), 1);
        if (player.lives <= 0) endGame('Game Over! Score: ' + score);
      }
    });

    // Enemies (with tentacles)
    ctx.fillStyle = 'blue';
    enemies = enemies.filter(e => e.y < 500);
    enemies.forEach((e, eIndex) => {
      e.y += e.speed;
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x + 5, e.y + 20);
      ctx.lineTo(e.x + 5, e.y + 30);
      ctx.moveTo(e.x + 15, e.y + 20);
      ctx.lineTo(e.x + 15, e.y + 30);
      ctx.stroke();

      if (Date.now() - lastEnemyFire > 1000 && Math.random() < 0.02) {
        enemyBullets.push({ x: e.x + e.width / 2, y: e.y + e.height, dy: 3 });
        lastEnemyFire = Date.now();
      }

      bullets.forEach((b, bIndex) => {
        if (Math.abs(b.x - e.x) < 20 && Math.abs(b.y - e.y) < 20) {
          score += 10;
          enemies.splice(eIndex, 1);
          bullets.splice(bIndex, 1);
        }
      });

      if (Math.abs(e.x - player.x) < 30 && Math.abs(e.y - player.y) < 30) {
        player.lives--;
        player.hitTime = 0.5; // Glow on hit
        enemies.splice(eIndex, 1);
        if (player.lives <= 0) endGame('Game Over! Score: ' + score);
      }
    });

    // Score, Lives, and Timer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(10, 80, 250, 120);
    ctx.fillStyle = 'white';
    ctx.font = '20px Segoe UI';
    ctx.fillText('Score: ' + score, 20, 120);
    ctx.fillText('Lives: ' + player.lives, 20, 150);
    ctx.fillText('Time: ' + Math.ceil(timeLeft) + 's', 20, 180);

    if (timeLeft > 0) timeLeft -= 0.016;
    else endGame('Victory! Score: ' + score);

    requestAnimationFrame(gameLoop);
  }

  function endGame(message) {
    sections.forEach(section => section.style.display = 'block');
    const existingPopup = document.querySelector('.game-popup');
    if (existingPopup) existingPopup.remove();
    const popup = document.createElement('div');
    popup.className = 'game-popup';
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 20px; border-radius: 10px; z-index: 1001; text-align: center; font-size: 1.5rem;';
    popup.innerHTML = `${message} <br>
      <button onclick="this.parentElement.remove(); startGame();" style="margin-top: 10px; margin-right: 10px; padding: 5px 10px; background: var(--blood-red); color: white; border: none; cursor: pointer;">Replay</button>
      <button onclick="window.location.reload();" style="margin-top: 10px; padding: 5px 10px; background: var(--blood-red); color: white; border: none; cursor: pointer;">OK</button>`;
    document.body.appendChild(popup);
  }

  // Mobile Check for Play Button
  document.querySelector('button[onclick="startGame()"]').addEventListener('click', (e) => {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      e.preventDefault();
      alert("It's too late for you, your game is already over!");
      return false;
    }
  });

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

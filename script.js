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

  let player = { x: 400, y: 250, angle: 0, speed: 0 };
  let bullets = [];
  let enemies = [];
  let redPill = { x: 400, y: 250, hits: 0, maxHits: 5 };
  let score = 0;
  let timeLeft = 60;
  let lastFire = 0;
  const keys = {};

  clearInterval(window.drawMatrixInterval);
  window.drawMatrixInterval = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Lower opacity for background
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

  function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * 800; y = -20; }
    else if (edge === 1) { x = 820; y = Math.random() * 500; }
    else if (edge === 2) { x = Math.random() * 800; y = 520; }
    else { x = -20; y = Math.random() * 500; }
    enemies.push({ x, y, speed: 2 + Math.random() * 2, targetX: redPill.x, targetY: redPill.y });
    console.log("Enemy spawned at:", x, y); // Debug log
  }

  setInterval(spawnEnemy, 500); // Increased spawn rate (every 500ms)

  function gameLoop() {
    ctx.clearRect(0, 0, 800, 500);

    // Draw Red Pill
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(redPill.x, redPill.y, 20, 0, Math.PI * 2);
    ctx.fill();
    if (redPill.hits >= redPill.maxHits) {
      endGame('Red Pill Destroyed! Score: ' + score);
    }

    // Player Ship (Triangle)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle * Math.PI / 180);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Rotate and Fire with Arrows
    if (keys['ArrowLeft']) player.angle -= 5;
    if (keys['ArrowRight']) player.angle += 5;
    if (keys['ArrowUp'] && Date.now() - lastFire > 100) { // Even faster firing (100ms cooldown)
      bullets.push({ x: player.x, y: player.y, dx: Math.sin(player.angle * Math.PI / 180) * 8, dy: -Math.cos(player.angle * Math.PI / 180) * 8 });
      lastFire = Date.now();
    }

    // Bullets
    ctx.fillStyle = 'red';
    bullets = bullets.filter(b => b.x > 0 && b.x < 800 && b.y > 0 && b.y < 500);
    bullets.forEach(b => {
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
      b.x += b.dx;
      b.y += b.dy;
    });

    // Enemies (with tentacles)
    ctx.fillStyle = 'blue';
    let enemiesToRemove = [];
    let bulletsToRemove = [];
    enemies.forEach((e, eIndex) => {
      let dx = redPill.x - e.x;
      let dy = redPill.y - e.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1) distance = 1; // Prevent division by zero
      e.speed = Math.min(6, 2 + (200 - distance) / 30); // More aggressive speed increase
      e.x += (dx / distance) * e.speed;
      e.y += (dy / distance) * e.speed;

      ctx.fillRect(e.x, e.y, 20, 20);
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x + 5, e.y + 20);
      ctx.lineTo(e.x + 5, e.y + 30);
      ctx.moveTo(e.x + 15, e.y + 20);
      ctx.lineTo(e.x + 15, e.y + 30);
      ctx.moveTo(e.x, e.y + 10);
      ctx.lineTo(e.x - 10, e.y + 20);
      ctx.moveTo(e.x + 20, e.y + 10);
      ctx.lineTo(e.x + 30, e.y + 20);
      ctx.stroke();

      // Collision with bullets
      bullets.forEach((b, bIndex) => {
        if (Math.abs(b.x - e.x) < 15 && Math.abs(b.y - e.y) < 15) {
          score += 20;
          enemiesToRemove.push(eIndex);
          bulletsToRemove.push(bIndex);
        }
      });

      // Collision with red pill
      if (Math.abs(e.x - redPill.x) < 30 && Math.abs(e.y - redPill.y) < 30) {
        redPill.hits++;
        enemiesToRemove.push(eIndex);
      }
    });

    // Remove marked enemies and bullets
    enemiesToRemove = [...new Set(enemiesToRemove)].sort((a, b) => b - a);
    bulletsToRemove = [...new Set(bulletsToRemove)].sort((a, b) => b - a);
    enemiesToRemove.forEach(index => enemies.splice(index, 1));
    bulletsToRemove.forEach(index => bullets.splice(index, 1));

    // Score and Timer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 50, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '30px Segoe UI';
    ctx.fillText('Score: ' + score, 20, 80);
    ctx.fillText('Time: ' + Math.ceil(timeLeft) + 's', 20, 110);

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

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

// ADD THE GAME CODE HERE (after initializeMatrixEffect)
function startGame() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let player = { x: 100, y: 400, speed: 5 };
  let agents = [];
  let codeDrops = [];
  let score = 0;
  let portal = { x: 700, y: 400, active: false };

  // Clear the existing Matrix rain interval to avoid overlap
  clearInterval(window.drawMatrixInterval);
  window.drawMatrixInterval = setInterval(window.drawMatrix, 50);

  function spawnAgent() {
    agents.push({ x: Math.random() * 800, y: -20, speed: 2 + Math.random() * 2 });
  }
  function spawnCode() {
    codeDrops.push({ x: Math.random() * 800, y: -20, speed: 1 });
  }

  setInterval(spawnAgent, 1000);
  setInterval(spawnCode, 1500);

  function gameLoop() {
    ctx.clearRect(0, 0, 800, 500);
    window.drawMatrix(); // Use the shared Matrix rain

    // Player
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Agents (Blue Pill obstacles)
    ctx.fillStyle = 'blue';
    agents = agents.filter(a => a.y < 500);
    agents.forEach(a => {
      ctx.fillRect(a.x, a.y, 20, 20);
      a.y += a.speed;
      if (Math.abs(a.x - player.x) < 15 && Math.abs(a.y - player.y) < 15) {
        alert('Game Over! Score: ' + score);
        location.reload(); // Restart the page to reset
      }
    });

    // Code Drops (MAGA Code collectibles)
    ctx.fillStyle = 'green';
    codeDrops = codeDrops.filter(c => c.y < 500);
    codeDrops.forEach(c => {
      ctx.fillRect(c.x, c.y, 10, 10);
      c.y += c.speed;
      if (Math.abs(c.x - player.x) < 10 && Math.abs(c.y - player.y) < 10) {
        score += 10;
        codeDrops.splice(codeDrops.indexOf(c), 1);
      }
    });

    // Portal (Red Pill Escape)
    if (score > 50) portal.active = true;
    if (portal.active) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, 20, 0, Math.PI * 2);
      ctx.fill();
      if (Math.abs(portal.x - player.x) < 20 && Math.abs(portal.y - player.y) < 20) {
        alert('Escaped! You’re a Matrix Rebel! Final Score: ' + score);
        location.reload();
      }
    }

    requestAnimationFrame(gameLoop);
  }

  document.addEventListener('mousemove', (e) => {
    player.x = e.clientX - 10;
    player.y = e.clientY - 10;
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

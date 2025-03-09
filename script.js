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

  let player = { x: 100, y: 400, speed: 5 };
  let agents = [];
  let codeDrops = [];
  let score = 0;
  let timeLeft = 30;
  let portal = { x: 700, y: 400, active: false };
  let sensitivity = 0.5; // Adjust sensitivity for smoother movement

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
    window.drawMatrix();

    // Player
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Agents (with tentacles)
    ctx.fillStyle = 'blue';
    agents = agents.filter(a => a.y < 500);
    agents.forEach(a => {
      // Main body
      ctx.fillRect(a.x, a.y, 20, 20);
      // Tentacles (4 small lines)
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x + 5, a.y + 20);
      ctx.lineTo(a.x + 5, a.y + 30);
      ctx.moveTo(a.x + 15, a.y + 20);
      ctx.lineTo(a.x + 15, a.y + 30);
      ctx.moveTo(a.x, a.y + 10);
      ctx.lineTo(a.x - 10, a.y + 20);
      ctx.moveTo(a.x + 20, a.y + 10);
      ctx.lineTo(a.x + 30, a.y + 20);
      ctx.stroke();
      a.y += a.speed;
      if (Math.abs(a.x - player.x) < 15 && Math.abs(a.y - player.y) < 15) {
        endGame('Game Over! Score: ' + score);
      }
    });

    // Code Drops (Red Pills with Glow)
    ctx.fillStyle = 'red';
    codeDrops = codeDrops.filter(c => c.y < 500);
    codeDrops.forEach(c => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 8, 4, 0, 0, Math.PI * 2); // Oval shape
      ctx.fill();
      ctx.shadowColor = 'red';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset glow
      c.y += c.speed;
      if (Math.abs(c.x - player.x) < 10 && Math.abs(c.y - player.y) < 10) {
        score += 10;
        codeDrops.splice(codeDrops.indexOf(c), 1);
      }
    });

    // Portal
    if (score > 50) portal.active = true;
    if (portal.active) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, 20, 0, Math.PI * 2);
      ctx.fill();
      if (Math.abs(portal.x - player.x) < 20 && Math.abs(portal.y - player.y) < 20) {
        endGame('Escaped! You’re a Matrix Rebel! Final Score: ' + score);
      }
    }

    // Score and Timer Display
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '30px Segoe UI';
    ctx.fillText('Score: ' + score, 20, 40);
    ctx.fillText('Time: ' + Math.ceil(timeLeft) + 's', 20, 70);

    // Countdown Timer
    if (timeLeft > 0) {
      timeLeft -= 0.016;
    } else {
      endGame('Time’s Up! Score: ' + score);
    }

    requestAnimationFrame(gameLoop);
  }

  function endGame(message) {
    sections.forEach(section => section.style.display = 'block');
    const existingPopup = document.querySelector('.game-popup');
    if (existingPopup) existingPopup.remove(); // Clear any existing popup
    const popup = document.createElement('div');
    popup.className = 'game-popup';
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 20px; border-radius: 10px; z-index: 1000; text-align: center; font-size: 1.5rem;';
    popup.innerHTML = `${message} <br><button onclick="document.querySelector('.game-popup').remove(); location.reload();" style="margin-top: 10px; padding: 5px 10px; background: var(--blood-red); color: white; border: none; cursor: pointer;">OK</button>`;
    document.body.appendChild(popup);
  }

  // Desktop movement (smoother with sensitivity)
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - 10;
    const newY = e.clientY - rect.top - 10;
    player.x += (newX - player.x) * sensitivity;
    player.y += (newY - player.y) * sensitivity;
  });

  // Mobile touch movement
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const newX = touch.clientX - rect.left - 10;
    const newY = touch.clientY - rect.top - 10;
    player.x += (newX - player.x) * (sensitivity * 0.8); // Slightly less sensitive for mobile
    player.y += (newY - player.y) * (sensitivity * 0.8);
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

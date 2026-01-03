// =================================================================
// MAGA MATRIX - SCRIPT.JS - FINAL VERSION
// - Katakana-style Matrix Rain restored.
// - New player and enemy ship designs implemented.
// - Core "Matrix Invaders" gameplay preserved.
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeMatrixEffect();
  document.addEventListener('click', (e) => {
    createParticle(e);
    createEnergyWave(e.pageX, e.pageY);
  });
});

// Original particle and wave effects
function createParticle(e) {
  const container = document.getElementById('particles-container');
  if (!container) return;
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = e.pageX + 'px';
  particle.style.top = e.pageY + 'px';
  container.appendChild(particle);
  setTimeout(() => { if (container.contains(particle)) container.removeChild(particle) }, 2000);
}

function createEnergyWave(x, y) {
  const container = document.getElementById('particles-container');
  if (!container) return;
  const wave = document.createElement('div');
  wave.className = 'energy-wave';
  wave.style.left = (x - 100) + 'px';
  wave.style.top = (y - 100) + 'px';
  container.appendChild(wave);
  setTimeout(() => { if (container.contains(wave)) container.removeChild(wave) }, 3000);
}

// =================================================================
// MODERN SPACE DEFENDER GAME - COMPLETE REDESIGN
// =================================================================
let gameInstance = null; 

function exitGame() {
  if (gameInstance) {
    gameInstance.stop();
    gameInstance = null;
  }
  
  // Remove exit button if it exists
  const exitBtn = document.getElementById('game-exit-btn');
  if (exitBtn) exitBtn.remove();
  
  // Show all sections again
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'flex');
  
  // Reset canvas
  const canvas = document.getElementById('matrix-canvas');
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Restart matrix effect
  initializeMatrixEffect();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startGame() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    alert("This game requires a keyboard. Please play on desktop.");
    return;
  }
  if (gameInstance) {
    gameInstance.stop();
  }
  
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Create exit button
  const exitBtn = document.createElement('button');
  exitBtn.id = 'game-exit-btn';
  exitBtn.innerHTML = '← EXIT GAME';
  exitBtn.className = 'game-exit-button';
  exitBtn.onclick = exitGame;
  document.body.appendChild(exitBtn);

  const keys = {};
  
  // Particle system for explosions
  let particles = [];
  
  let player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 7,
    lives: 3,
    maxLives: 3,
    shield: 100,
    maxShield: 100,
    isHit: false,
    hitTimer: 0
  };
  
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let score = 0;
  let wave = 1;
  let lastFireTime = 0;
  let gameOver = false;
  let animationFrameId;
  let stars = [];

  // Create starfield background
  function createStars() {
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 0.5
      });
    }
  }

  function drawStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    stars.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
    });
  }

  function createEnemies() {
    enemies = [];
    const enemyRows = 2 + Math.floor(wave / 3);
    const enemyCols = 6 + Math.floor(wave / 2);
    const enemySpacing = 80;
    const startX = (canvas.width - (enemyCols * enemySpacing)) / 2;

    for (let row = 0; row < enemyRows; row++) {
      for (let col = 0; col < enemyCols; col++) {
        enemies.push({
          x: startX + col * enemySpacing,
          y: 80 + row * enemySpacing,
          width: 40,
          height: 40,
          speed: 1.5 + wave * 0.3,
          direction: 1,
          health: 1 + Math.floor(wave / 5),
          maxHealth: 1 + Math.floor(wave / 5),
          angle: 0
        });
      }
    }
  }

  function createParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  }

  function drawParticles() {
    particles.forEach((p, index) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
      
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      
      if (p.life <= 0) {
        particles.splice(index, 1);
      }
    });
  }

  function drawPlayer() {
    if (player.isHit) {
      ctx.fillStyle = 'rgba(220, 20, 60, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      player.hitTimer--;
      if (player.hitTimer <= 0) player.isHit = false;
    }
    
    // Modern sleek ship design
    const centerX = player.x;
    const centerY = player.y;
    
    // Ship body - gradient
    const gradient = ctx.createLinearGradient(centerX, centerY - 25, centerX, centerY + 25);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(0.5, '#0088cc');
    gradient.addColorStop(1, '#004466');
    
    // Main body
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 25);
    ctx.lineTo(centerX - 20, centerY + 15);
    ctx.lineTo(centerX - 10, centerY + 25);
    ctx.lineTo(centerX + 10, centerY + 25);
    ctx.lineTo(centerX + 20, centerY + 15);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit glow
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Engine glow
    const engineGlow = Math.abs(Math.sin(Date.now() / 100)) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(220, 20, 60, ${engineGlow})`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#dc143c';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 25, 8, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawBullets() {
    bullets.forEach(b => {
      // Laser beam effect
      const gradient = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 20);
      gradient.addColorStop(0, '#ff0040');
      gradient.addColorStop(1, '#ff6080');
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0040';
      ctx.fillRect(b.x - 3, b.y, 6, 20);
      ctx.shadowBlur = 0;
      
      b.y -= b.speed;
    });
    bullets = bullets.filter(b => b.y > -20);
  }

  function drawEnemies() {
    enemies.forEach(enemy => {
      enemy.angle += 0.02;
      
      // Modern enemy design
      const centerX = enemy.x + enemy.width / 2;
      const centerY = enemy.y + enemy.height / 2;
      
      // Health-based color
      const healthPercent = enemy.health / enemy.maxHealth;
      const red = Math.floor(255 * (1 - healthPercent));
      const green = Math.floor(255 * healthPercent);
      
      // Enemy body
      ctx.fillStyle = `rgb(${red}, ${green}, 100)`;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(enemy.angle);
      
      // Hexagonal shape
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * 20;
        const y = Math.sin(angle) * 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Core glow
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.restore();
    });
  }
  
  function drawEnemyBullets() {
    enemyBullets.forEach(b => {
      ctx.fillStyle = '#00ff41';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff41';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      b.y += b.speed;
    });
    enemyBullets = enemyBullets.filter(b => b.y < canvas.height + 20);
  }

  function update() {
    if (gameOver) return;

    // Player movement
    if (keys['ArrowLeft'] && player.x > 50) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - 50) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 50) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - 50) player.y += player.speed;
    
    // Shooting
    if (keys[' '] && Date.now() - lastFireTime > 200) {
      bullets.push({ x: player.x, y: player.y - 25, speed: 10 });
      lastFireTime = Date.now();
    }

    // Enemy movement
    let wallHit = false;
    enemies.forEach(enemy => {
      enemy.x += enemy.speed * enemy.direction;
      if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        wallHit = true;
      }
      
      // Enemy shooting
      if (Math.random() < 0.002 + (wave * 0.0003)) {
        enemyBullets.push({ 
          x: enemy.x + enemy.width / 2, 
          y: enemy.y + enemy.height, 
          speed: 5 
        });
      }
    });

    if (wallHit) {
      enemies.forEach(enemy => {
        enemy.direction *= -1;
        enemy.y += 30;
      });
    }
    
    // Bullet collision with enemies
    bullets.forEach((bullet, bIndex) => {
      enemies.forEach((enemy, eIndex) => {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        const dist = Math.hypot(bullet.x - centerX, bullet.y - centerY);
        
        if (dist < 25) {
          bullets.splice(bIndex, 1);
          enemy.health--;
          
          if (enemy.health <= 0) {
            createParticles(centerX, centerY, '#ff6600', 30);
            enemies.splice(eIndex, 1);
            score += 100;
          } else {
            createParticles(centerX, centerY, '#ffaa00', 10);
          }
        }
      });
    });

    // Enemy bullet collision with player
    enemyBullets.forEach((bullet, bIndex) => {
      const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);
      if (dist < 30) {
        enemyBullets.splice(bIndex, 1);
        player.shield -= 20;
        player.isHit = true;
        player.hitTimer = 10;
        createParticles(player.x, player.y, '#00d4ff', 15);
        
        if (player.shield <= 0) {
          player.lives--;
          player.shield = player.maxShield;
          if (player.lives <= 0) {
            gameOver = true;
            createParticles(player.x, player.y, '#ff0000', 50);
          }
        }
      }
    });
    
    // Wave completion
    if (enemies.length === 0) {
      wave++;
      player.shield = Math.min(player.shield + 50, player.maxShield);
      createEnemies();
    }

    // Shield regeneration
    if (player.shield < player.maxShield) {
      player.shield += 0.1;
    }
  }

  function drawHUD() {
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    // Score
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#00d4ff';
    ctx.fillText(`SCORE: ${score}`, 30, 40);
    ctx.fillText(`WAVE: ${wave}`, 30, 75);
    
    // Lives
    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${player.lives}`, canvas.width - 30, 40);
    
    // Shield bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = canvas.width - 230;
    const barY = 55;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const shieldPercent = player.shield / player.maxShield;
    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(1, '#0088cc');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * shieldPercent, barHeight);
    
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    ctx.shadowBlur = 0;
  }
  
  function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 80px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    const gradient = ctx.createLinearGradient(0, canvas.height / 2 - 100, 0, canvas.height / 2);
    gradient.addColorStop(0, '#dc143c');
    gradient.addColorStop(1, '#ff6080');
    
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#dc143c';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText(`Wave Reached: ${wave}`, canvas.width / 2, canvas.height / 2 + 80);
    
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('Press R to Restart, Q to Exit, or ESC anytime', canvas.width / 2, canvas.height / 2 + 150);
    ctx.shadowBlur = 0;
  }

  function gameLoop() {
    // Clear with fade effect
    ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    
    if (gameOver) {
      drawGameOver();
    } else {
      update();
      drawParticles();
      drawPlayer();
      drawBullets();
      drawEnemies();
      drawEnemyBullets();
      drawHUD();
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function handleKeyDown(e) {
    keys[e.key] = true;
    
    // ESC key to exit game anytime
    if (e.key === 'Escape') {
      exitGame();
      return;
    }
    
    if (gameOver && e.key.toLowerCase() === 'r') {
      gameInstance.stop();
      startGame();
    }
    if (gameOver && e.key.toLowerCase() === 'q') {
      exitGame();
    }
  }
  
  function handleKeyUp(e) {
    keys[e.key] = false;
  }
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  gameInstance = {
    stop: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  };

  createStars();
  createEnemies();
  gameLoop();
}

// =================================================================
// KATAKANA-STYLE MATRIX BACKGROUND EFFECT (RESTORED)
// =================================================================
function initializeMatrixEffect() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  
  let letters = [];
  
  function setup() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / 20);
      letters = [];
      for (let i = 0; i < columns; i++) {
          letters[i] = 1;
      }
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '15pt monospace';
    
    letters.forEach((y, index) => {
        // This is the Katakana character set.
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        const x = index * 20;
        ctx.fillText(text, x, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) {
            letters[index] = 0;
        }
        letters[index]++;
    });
  }

  setup();
  setInterval(drawMatrix, 50);
  window.addEventListener('resize', setup);
}

// Red Pill Effect
function takeRedPill() {
  const effect = document.getElementById('red-pill-effect');
  effect.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Blue Pill Effect
function takeBluePill() {
  const effect = document.getElementById('blue-pill-effect');
  effect.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Effect
function closeEffect() {
  const effects = document.querySelectorAll('.pill-effect');
  effects.forEach(effect => {
    effect.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

// script.js

// If using GSAP's ScrollTrigger, uncomment below (GSAP library must be included):
// gsap.registerPlugin(ScrollTrigger);

/* ===========================
   Matrix Effect using Canvas
   =========================== */
function initializeMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    // Make canvas full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = Array(256).join("0").split("");

    function drawMatrix() {
        // Background fill - slightly transparent to create the trailing effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text color
        ctx.fillStyle = "#0f0"; // classic green matrix color or pick something patriotic
        letters.forEach((y_pos, index) => {
            const text = String.fromCharCode(3e4 + Math.random() * 33);
            const x_pos = index * 10;
            ctx.fillText(text, x_pos, y_pos);
            if (y_pos > 100 + Math.random() * 1e5) {
                letters[index] = 0;
            } else {
                letters[index] = y_pos + 10;
            }
        });
    }
    setInterval(drawMatrix, 50);

    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/* ===========================
   Particle Effects on Click
   =========================== */
function createParticle(e) {
    const container = document.getElementById('particles-container');
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = e.pageX + 'px';
    particle.style.top = e.pageY + 'px';

    container.appendChild(particle);

    // Remove after animation
    setTimeout(() => {
        container.removeChild(particle);
    }, 2000);
}
function createEnergyWave(x, y) {
    const container = document.getElementById('particles-container');
    const wave = document.createElement('div');
    wave.className = 'energy-wave';
    wave.style.left = (x - 100) + 'px';
    wave.style.top = (y - 100) + 'px';
    container.appendChild(wave);

    setTimeout(() => {
        container.removeChild(wave);
    }, 3000);
}

// Throttle function if needed
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/* ===========================
   Initialize Everything
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    initializeMatrixEffect();

    // On click, create simple particle & wave
    document.addEventListener('click', (e) => {
        createParticle(e);
        createEnergyWave(e.pageX, e.pageY);
    });
});

// script.js

function initializeMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = Array(256).join("0").split("");

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0f0"; // Green matrix color
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

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

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

document.addEventListener('DOMContentLoaded', () => {
    initializeMatrixEffect();

    // Simple click effect
    document.addEventListener('click', (e) => {
        createParticle(e);
        createEnergyWave(e.pageX, e.pageY);
    });
});

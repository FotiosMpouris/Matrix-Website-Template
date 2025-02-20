// scripts.js
gsap.registerPlugin(ScrollTrigger);

function initializeMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initializeMatrix();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const stars = '★☆✩✪✫✬✭✮✯';
    const fontSize = 16;
    let columns, drops;

    function initializeMatrix() {
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(26, 37, 38, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = stars.charAt(Math.floor(Math.random() * stars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height || Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(drawMatrix);
    }
    drawMatrix();
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    container.appendChild(particle);
    gsap.to(particle, {
        y: -500,
        x: Math.random() * 100 - 50,
        opacity: 0,
        duration: Math.random() * 3 + 2,
        ease: "power1.out",
        onComplete: () => particle.remove()
    });
}

function createEnergyWave(x, y, container) {
    const wave = document.createElement('div');
    wave.className = 'energy-wave';
    wave.style.left = `${x - 100}px`;
    wave.style.top = `${y - 100}px`;
    container.appendChild(wave);
    setTimeout(() => wave.remove(), 6000);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMatrixEffect();

    gsap.to('.title', { opacity: 1, y: 0, duration: 1, delay: 0.5 });
    gsap.to('.subtitle', { opacity: 1, y: 0, duration: 1, delay: 0.8 });

    const appointeeIcons = document.querySelectorAll('.appointee-icon');
    appointeeIcons.forEach((icon, index) => {
        gsap.to(icon, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: 1.2 + (index * 0.1),
            ease: "back.out(1.7)"
        });
    });

    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        gsap.to(section, {
            scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.2 * index
        });
    });

    const particlesContainers = document.querySelectorAll('.particles-container');
    particlesContainers.forEach(container => {
        setInterval(() => createParticle(container), 200);
    });

    document.addEventListener('mousemove', (e) => {
        particlesContainers.forEach(container => {
            const rect = container.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom && Math.random() < 0.1) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                createEnergyWave(x, y, container);
            }
        });
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
});

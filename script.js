// scripts.js
gsap.registerPlugin(ScrollTrigger);

function initializeMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars = '★☆✩✪✫✬✭✮✯';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(26, 37, 38, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = `${fontSize}px monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            const text = stars.charAt(Math.floor(Math.random() * stars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 50);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function createParticles() {
    const containers = document.querySelectorAll('.particles-container');
    containers.forEach(container => {
        setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = `${Math.random() * 4 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            container.appendChild(particle);
            
            gsap.to(particle, {
                y: -200,
                opacity: 0,
                duration: Math.random() * 3 + 2,
                ease: 'power1.out',
                onComplete: () => particle.remove()
            });
        }, 200);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMatrix();
    createParticles();

    // Animations
    gsap.to('.title', { opacity: 1, y: 0, duration: 1, delay: 0.5 });
    gsap.to('.subtitle', { opacity: 1, y: 0, duration: 1, delay: 0.8 });
    
    document.querySelectorAll('.appointee-icon').forEach((icon, i) => {
        gsap.to(icon, {
            opacity: 1,
            duration: 0.5,
            delay: 1 + i * 0.1,
            ease: 'back.out(1.7)'
        });
    });

    // Navbar toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
});

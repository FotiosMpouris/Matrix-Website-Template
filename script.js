gsap.registerPlugin(ScrollTrigger, TextPlugin);

function createMatrixBackground() {
    const containers = document.querySelectorAll('.matrix-background');
    containers.forEach(container => {
        const containerWidth = container.offsetWidth;
        const columnWidth = 30;
        const numberOfColumns = Math.ceil(containerWidth / columnWidth);
        const chars = '01★☆✩';
        container.innerHTML = '';
        for (let i = 0; i < numberOfColumns; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            let columnChars = '';
            for (let j = 0; j < 50; j++) {
                columnChars += chars[Math.floor(Math.random() * chars.length)] + '\n';
            }
            column.textContent = columnChars;
            column.style.left = `${i * columnWidth}px`;
            column.style.animationDelay = `${-Math.random() * 20}s`;
            container.appendChild(column);
        }
    });
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

function typeText(element, text, speed = 0.01) {
    gsap.to(element, {
        duration: text.length * speed,
        text: text,
        ease: "none",
        onStart: () => element.style.opacity = '1'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.matrix-background')) {
        createMatrixBackground();
    }

    const particlesContainers = document.querySelectorAll('.particles-container');
    particlesContainers.forEach(container => {
        setInterval(() => createParticle(container), 200);
    });

    gsap.to('.title', { opacity: 1, duration: 1, delay: 0.5 });
    gsap.to('.subtitle', { opacity: 1, duration: 1, delay: 0.8 });

    const skillIcons = document.querySelectorAll('.skill-icon');
    skillIcons.forEach((icon, index) => {
        gsap.to(icon, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: 1.2 + (index * 0.05),
            ease: "back.out(1.7)"
        });
    });

    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            duration: 1,
            delay: 0.2 * index
        });
    });

    const aboutPs = document.querySelectorAll('.about-content p');
    aboutPs.forEach((p, index) => {
        const text = p.getAttribute('data-text') || p.textContent;
        p.textContent = '';
        p.style.opacity = '0';
        typeText(p, text, 0.01);
    });

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    window.addEventListener('resize', createMatrixBackground);
});

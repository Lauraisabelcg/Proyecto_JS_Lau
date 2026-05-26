initNavigation();

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const targetSectionId = link.getAttribute('href').replace('#', '');
            navigateToSection(targetSectionId);
        });
    });

    const driversSection = document.querySelector('.drivers-section');
    if (driversSection) {
        driversSection.addEventListener('click', (e) => {
            const card = e.target.closest('.driver-card');
            if (!card) return;

            const targetSection = card.getAttribute('data-route-target');
            
            navLinks.forEach(item => item.classList.remove('active'));
            const rutasLink = document.getElementById('nav-rutas');
            if (rutasLink) rutasLink.classList.add('active');

            navigateToSection(targetSection);
        });
    }
}

function navigateToSection(sectionId) {
    console.log(`Redirigiendo modularmente a: ${sectionId}`);
    
    if (sectionId === 'inicio') {
        document.getElementById('inicio').scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'registro') {
        window.location.href = 'registro.html';
    } else if (sectionId === 'rutas') {
        window.location.href = 'rutas.html';
    }
}
// Libellés affichés pour chaque catégorie de data.json
const CATEGORY_LABELS = {
    web: 'Web',
    communication: 'Graphisme',
    audiovisuel: 'Audiovisuel'
};

document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allProjects = [];

    // 1. Récupérer les données depuis le JSON
    fetch('data.json?v=4')
        .then(response => {
            if (!response.ok) throw new Error(response.status);
            return response.json();
        })
        .then(data => {
            allProjects = data;
            displayProjects(allProjects); // Afficher tout au démarrage
        })
        .catch(error => {
            console.error('Erreur chargement JSON:', error);
            projectsContainer.innerHTML = '<p class="load-error">Impossible de charger les projets pour le moment. Réessayez dans quelques instants.</p>';
        });

    // 2. Fonction pour afficher les projets
    function displayProjects(projects) {
        projectsContainer.innerHTML = ''; // Vider le conteneur

        projects.forEach(project => {
            // Création de l'élément article pour la carte
            const card = document.createElement('article');
            card.classList.add('project-card');
            if (project.featured) card.classList.add('project-card--featured');

            // Captures web dans un cadre de navigateur, affiches et vidéos en entier
            const frame = project.category === 'web' ? 'frame-browser' : 'frame-print';

            card.innerHTML = `
                <div class="card-image ${frame}">
                    <img src="${project.image}" alt="Aperçu du projet ${project.title}" loading="lazy">
                </div>
                <div class="card-content">
                    ${project.featured ? '<span class="featured-label">Projet phare</span>' : ''}
                    <span class="card-category">${CATEGORY_LABELS[project.category] || project.category}</span>
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="card-links">
                        <a href="project.html?id=${project.id}" class="card-link">En savoir plus</a>
                        ${project.link ? `<a href="${project.link}" class="card-link" target="_blank" rel="noopener noreferrer">Voir le site</a>` : ''}
                        ${project.repo ? `<a href="${project.repo}" class="card-link" target="_blank" rel="noopener noreferrer">Voir le code</a>` : ''}
                    </div>
                </div>
            `;

            projectsContainer.appendChild(card);
        });
    }

    // 3. Gestion des filtres
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Gestion de l'état actif sur les boutons
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const filterValue = btn.getAttribute('data-filter');

            if (filterValue === 'all') {
                displayProjects(allProjects);
            } else {
                const filtered = allProjects.filter(p => p.category === filterValue);
                displayProjects(filtered);
            }
        });
    });
});

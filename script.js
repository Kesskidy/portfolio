document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allProjects = [];

    // 1. Récupérer les données depuis le JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allProjects = data;
            displayProjects(allProjects); // Afficher tout au démarrage
        })
        .catch(error => console.error('Erreur chargement JSON:', error));

    // 2. Fonction pour afficher les projets
    function displayProjects(projects) {
        projectsContainer.innerHTML = ''; // Vider le conteneur

        projects.forEach(project => {
            // Création de l'élément article pour la carte
            const card = document.createElement('article');
            card.classList.add('project-card');

            card.innerHTML = `
                <div class="card-image">
                    <img src="${project.image}" alt="${project.title}">
                </div>
                <div class="card-content">
                    <span class="card-category">${project.category}</span>
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <a href="project.html?id=${project.id}" class="card-link">En savoir plus</a>
                </div>
            `;

            projectsContainer.appendChild(card);
        });
    }

    // 3. Gestion des filtres
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Gestion de la classe active sur les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

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
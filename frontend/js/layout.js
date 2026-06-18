// js/layout.js — injecte la sidebar + topbar dans chaque page

function buildLayout(pageTitle, activePage) {
  const nav = [
    { section: 'Vue générale', items: [
      { page: 'dashboard.html', icon: '⊞', label: 'Tableau de bord' },
      { page: 'emploi_du_temps.html', icon: '📅', label: 'Emplois du temps' },
      { page: 'cours.html', icon: '📚', label: 'Cours & EC' },
    ]},
    { section: 'Évaluations', items: [
      { page: 'evaluations.html', icon: '✏️', label: 'Suivi des évaluations' },
      { page: 'precedences.html', icon: '🔗', label: 'Précédences' },
      { page: 'avancement.html', icon: '📊', label: 'Statistiques' },
    ]},
    { section: 'Administration', items: [
      { page: 'enseignants.html', icon: '👤', label: 'Enseignants' },
      { page: 'classes.html',     icon: '🎓', label: 'Classes' },
    ]},
  ];

  const navHTML = nav.map(section => `
    <div class="nav-section">${section.section}</div>
    ${section.items.map(item => `
      <a href="${item.page}" class="nav-item ${activePage === item.page ? 'active' : ''}" data-page="${item.page}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join('')}
  `).join('');

  const sidebar = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="brand">ESI · DA Platform</div>
        <div class="sub">Gestion académique 2024–25</div>
      </div>
      <nav class="sidebar-nav">${navHTML}</nav>
      <div class="sidebar-footer">
        <div class="user">Directeur Académique</div>
        <div>ESI — Bobo-Dioulasso</div>
      </div>
    </aside>
  `;

  const topbar = `
    <header class="topbar">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="menu-toggle" onclick="toggleSidebar()" aria-label="Menu">☰</button>
        <span class="topbar-title">${pageTitle}</span>
      </div>
      <div class="topbar-right">
        <span class="topbar-badge">Semestre 2 · L3 Info</span>
      </div>
    </header>
  `;

  // Injection
  document.body.insertAdjacentHTML('afterbegin', sidebar);
  const wrapper = document.querySelector('.main-wrapper');
  if (wrapper) wrapper.insertAdjacentHTML('afterbegin', topbar);

  // Overlay pour fermer la sidebar en cliquant à côté (mobile)
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-backdrop';
  overlay.onclick = closeSidebar;
  document.body.appendChild(overlay);

  // Fermer la sidebar quand on clique un lien (mobile)
  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', closeSidebar);
  });
}

function toggleSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
  document.querySelector('.sidebar-backdrop')?.classList.toggle('open');
}

function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-backdrop')?.classList.remove('open');
}

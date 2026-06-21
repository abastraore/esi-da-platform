
function showToast(msg, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = '0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

function initSidebar() {

  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === current) {
      item.classList.add('active');
    }
  });

  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

function renderTableLoading(tbody, cols) {
  tbody.innerHTML = `<tr class="loading-row"><td colspan="${cols}"><span class="spinner"></span> Chargement...</td></tr>`;
}

function renderTableEmpty(tbody, cols, msg = 'Aucun enregistrement') {
  tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;color:var(--text-muted);padding:30px">${msg}</td></tr>`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(t) {
  if (!t) return '—';
  return t.slice(0, 5); 
}
function gradeBadge(grade) {
  const map = { DR: 'badge-purple', PR: 'badge-blue', MC: 'badge-cyan',
                MA: 'badge-green',  MR: 'badge-orange' };
  return `<span class="badge ${map[grade] || 'badge-gray'}">${grade}</span>`;
}

function seanceBadge(type) {
  const map = { COURS: 'badge-blue', TP: 'badge-green',
                TD: 'badge-orange',  EXAM: 'badge-red' };
  return `<span class="badge ${map[type] || 'badge-gray'}">${type}</span>`;
}

function progressColor(pct) {
  if (pct >= 80) return '#2ea043';
  if (pct >= 50) return '#e3943a';
  return '#f85149';
}

function confirmDelete(msg = 'Supprimer cet élément ?') {
  return window.confirm(msg);
}

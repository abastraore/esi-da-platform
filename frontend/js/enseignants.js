// enseignants.js
let allEns = [];

async function loadEns() {
  const tbody = document.getElementById('ens-tbody');
  renderTableLoading(tbody, 5);
  try {
    allEns = await api.enseignants.getAll();
    document.getElementById('ens-count').textContent = allEns.length + ' enseignants';
    renderEns(allEns);
  } catch (e) { renderTableEmpty(tbody, 5, 'Erreur de chargement'); }
}

function renderEns(list) {
  const tbody = document.getElementById('ens-tbody');
  if (!list.length) { renderTableEmpty(tbody, 5); return; }
  tbody.innerHTML = list.map(e => `
    <tr>
      <td><strong>${e.nom || e.enseignant_name}</strong>
        ${e.prenom ? `<span style="color:var(--text-secondary)"> ${e.prenom}</span>` : ''}
      </td>
      <td>${gradeBadge(e.grade || e.enseignant_grade)}</td>
      <td>${e.module || e.enseignant_module || '—'}</td>
      <td style="font-size:0.75rem;color:var(--text-secondary)">${e.email || '—'}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn-icon" onclick="editEns(${e.id || e.enseignant_id})">modifier</button>
          <button class="btn-icon" onclick="deleteEns(${e.id || e.enseignant_id})">supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

function applyEnsFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const g = document.getElementById('filter-grade').value;
  renderEns(allEns.filter(e => {
    const name  = (e.nom || e.enseignant_name || '').toLowerCase();
    const grade = e.grade || e.enseignant_grade || '';
    return name.includes(q) && (!g || grade === g);
  }));
}

function openNewEnsModal() {
  ['ens-id','ens-nom','ens-prenom','ens-email','ens-module'].forEach(id =>
    document.getElementById(id).value = '');
  document.getElementById('ens-grade').value = '';
  document.getElementById('modal-ens-title').textContent = 'Nouvel enseignant';
  openModal('modal-ens');
}

async function editEns(id) {
  const e = await api.enseignants.get(id);
  document.getElementById('ens-id').value     = e.id || e.enseignant_id;
  document.getElementById('ens-nom').value    = e.nom || e.enseignant_name;
  document.getElementById('ens-prenom').value = e.prenom || '';
  document.getElementById('ens-grade').value  = e.grade || e.enseignant_grade;
  document.getElementById('ens-module').value = e.module || e.enseignant_module || '';
  document.getElementById('ens-email').value  = e.email || '';
  document.getElementById('modal-ens-title').textContent = "Modifier l'enseignant";
  openModal('modal-ens');
}

async function saveEns() {
  const id   = document.getElementById('ens-id').value;
  const data = {
    nom:    document.getElementById('ens-nom').value.trim(),
    prenom: document.getElementById('ens-prenom').value.trim(),
    grade:  document.getElementById('ens-grade').value,
    module: document.getElementById('ens-module').value.trim() || null,
    email:  document.getElementById('ens-email').value.trim()  || null,
  };
  if (!data.nom || !data.grade) { showToast('Nom et grade obligatoires', 'error'); return; }
  try {
    if (id) { await api.enseignants.update(id, data); showToast('Enseignant modifié', 'success'); }
    else    { await api.enseignants.create(data);     showToast('Enseignant ajouté', 'success'); }
    closeModal('modal-ens');
    loadEns();
  } catch (e) {}
}

async function deleteEns(id) {
  if (!confirmDelete('Supprimer cet enseignant ?')) return;
  try { await api.enseignants.remove(id); showToast('Supprimé', 'success'); loadEns(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search')?.addEventListener('input', applyEnsFilters);
  document.getElementById('filter-grade')?.addEventListener('change', applyEnsFilters);
  loadEns();
});

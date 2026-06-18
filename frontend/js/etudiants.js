// etudiants.js
let allEtudiants = [];

async function loadEtudiants() {
  const tbody = document.getElementById('etud-tbody');
  renderTableLoading(tbody, 5);
  try {
    allEtudiants = await api.get('/api/etudiants');
    document.getElementById('etud-count').textContent = allEtudiants.length + ' étudiants';
    renderEtudiants(allEtudiants);
  } catch (e) { renderTableEmpty(tbody, 5, 'Erreur de chargement'); }
}

function renderEtudiants(list) {
  const tbody = document.getElementById('etud-tbody');
  if (!list.length) { renderTableEmpty(tbody, 5); return; }
  tbody.innerHTML = list.map(e => `
    <tr>
      <td><strong>${e.nom || '—'}</strong> ${e.prenom ? `<span style="color:var(--text-secondary)">${e.prenom}</span>` : ''}</td>
      <td style="font-size:0.75rem;color:var(--text-secondary)">${e.matricule || '—'}</td>
      <td>${e.classe || '—'}</td>
      <td style="font-size:0.75rem;color:var(--text-secondary)">${e.email || '—'}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn-icon" onclick="editEtudiant(${e.id})">modfier</button>
          <button class="btn-icon" onclick="deleteEtudiant(${e.id})">supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

function applyEtudFilter() {
  const q = document.getElementById('search')?.value.toLowerCase() || '';
  renderEtudiants(allEtudiants.filter(e =>
    (e.nom || '').toLowerCase().includes(q) ||
    (e.prenom || '').toLowerCase().includes(q) ||
    (e.matricule || '').toLowerCase().includes(q)
  ));
}

async function loadEtudSelects() {
  const cls = await api.classes.getAll();
  const sel = document.getElementById('etud-classe');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Classe —</option>';
  cls.forEach(c => {
    sel.innerHTML += `<option value="${c.classe_id || c.id}">${c.classe_option} ${c.classe_level || ''}</option>`;
  });
}

function openNewEtudModal() {
  ['etud-id','etud-nom','etud-prenom','etud-matricule','etud-email'].forEach(id =>
    document.getElementById(id) && (document.getElementById(id).value = ''));
  document.getElementById('etud-classe') && (document.getElementById('etud-classe').value = '');
  document.getElementById('modal-etud-title').textContent = 'Nouvel étudiant';
  openModal('modal-etud');
}

async function editEtudiant(id) {
  try {
    const e = await api.get(`/api/etudiants/${id}`);
    document.getElementById('etud-id').value        = e.id;
    document.getElementById('etud-nom').value       = e.nom || '';
    document.getElementById('etud-prenom').value    = e.prenom || '';
    document.getElementById('etud-matricule').value = e.matricule || '';
    document.getElementById('etud-email').value     = e.email || '';
    document.getElementById('etud-classe').value    = e.classe_id || '';
    document.getElementById('modal-etud-title').textContent = "Modifier l'étudiant";
    openModal('modal-etud');
  } catch (e) {}
}

async function saveEtudiant() {
  const id   = document.getElementById('etud-id').value;
  const data = {
    nom:        document.getElementById('etud-nom').value.trim(),
    prenom:     document.getElementById('etud-prenom').value.trim(),
    matricule:  document.getElementById('etud-matricule').value.trim() || null,
    email:      document.getElementById('etud-email').value.trim()     || null,
    classe_id:  document.getElementById('etud-classe').value           || null,
  };
  if (!data.nom) { showToast('Nom obligatoire', 'error'); return; }
  try {
    if (id) { await api.put(`/api/etudiants/${id}`, data); showToast('Étudiant modifié', 'success'); }
    else    { await api.post('/api/etudiants', data);       showToast('Étudiant ajouté', 'success'); }
    closeModal('modal-etud');
    loadEtudiants();
  } catch (e) {}
}

async function deleteEtudiant(id) {
  if (!confirmDelete('Supprimer cet étudiant ?')) return;
  try { await api.delete(`/api/etudiants/${id}`); showToast('Supprimé', 'success'); loadEtudiants(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search')?.addEventListener('input', applyEtudFilter);
  loadEtudSelects();
  loadEtudiants();
});

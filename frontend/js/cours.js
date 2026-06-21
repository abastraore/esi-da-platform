let allCours = [];

async function loadCours() {
  const tbody = document.getElementById('cours-tbody');
  renderTableLoading(tbody, 7);
  try {
    allCours = await api.cours.getAll();
    document.getElementById('cours-count').textContent = allCours.length + ' cours';
    renderCours(allCours);
  } catch (e) { renderTableEmpty(tbody, 7, 'Erreur de chargement'); }
}

function renderCours(list) {
  const tbody = document.getElementById('cours-tbody');
  if (!list.length) { renderTableEmpty(tbody, 7); return; }
  tbody.innerHTML = list.map(c => `
    <tr>
      <td><strong>${c.cours_name}</strong></td>
      <td><span class="badge badge-blue">${c.cours_volume}h</span></td>
      <td>${c.enseignant_nom ? c.enseignant_nom + ' ' + (c.enseignant_prenom || '') : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${c.classe || '<span style="color:var(--text-muted)">—</span>'}</td>
      <td style="font-size:0.75rem">${fmtDate(c.cours_debut)}</td>
      <td style="font-size:0.75rem">${fmtDate(c.cours_fin)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn-icon" title="Modifier" onclick="editCours(${c.cours_id})">Modifier</button>
          <button class="btn-icon" title="Supprimer" onclick="deleteCours(${c.cours_id})">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

document.getElementById('search')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderCours(allCours.filter(c => c.cours_name.toLowerCase().includes(q)));
});

async function loadSelects() {
  const [ens, cls] = await Promise.allSettled([api.enseignants.getAll(), api.classes.getAll()]);
  const ensSelect = document.getElementById('cours-prof');
  (ens.value || []).forEach(e => {
    ensSelect.innerHTML += `<option value="${e.id || e.enseignant_id}">${e.nom || e.enseignant_name} ${e.prenom || ''}</option>`;
  });
  const clsSelect = document.getElementById('cours-level');
  (cls.value || []).forEach(c => {
    clsSelect.innerHTML += `<option value="${c.id || c.classe_id}">${c.classe_option} - ${c.classe_level || ''}</option>`;
  });
}

function resetCoursModal() {
  ['cours-id','cours-name','cours-volume','cours-debut','cours-fin'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('cours-prof').value  = '';
  document.getElementById('cours-level').value = '';
  document.getElementById('modal-cours-title').textContent = 'Nouveau cours';
}

async function editCours(id) {
  const c = await api.cours.get(id);
  document.getElementById('cours-id').value     = c.cours_id;
  document.getElementById('cours-name').value   = c.cours_name;
  document.getElementById('cours-volume').value = c.cours_volume;
  document.getElementById('cours-debut').value  = c.cours_debut?.split('T')[0];
  document.getElementById('cours-fin').value    = c.cours_fin?.split('T')[0];
  document.getElementById('cours-prof').value   = c.cours_prof  || '';
  document.getElementById('cours-level').value  = c.cours_level || '';
  document.getElementById('modal-cours-title').textContent = 'Modifier le cours';
  openModal('modal-cours');
}

async function saveCours() {
  const id   = document.getElementById('cours-id').value;
  const data = {
    cours_name:   document.getElementById('cours-name').value.trim(),
    cours_volume: parseInt(document.getElementById('cours-volume').value),
    cours_debut:  document.getElementById('cours-debut').value,
    cours_fin:    document.getElementById('cours-fin').value,
    cours_prof:   document.getElementById('cours-prof').value  || null,
    cours_level:  document.getElementById('cours-level').value || null,
  };
  if (!data.cours_name || !data.cours_volume || !data.cours_debut || !data.cours_fin) {
    showToast('Remplis les champs obligatoires', 'error'); return;
  }
  try {
    if (id) { await api.cours.update(id, data); showToast('Cours modifié', 'success'); }
    else    { await api.cours.create(data);      showToast('Cours créé', 'success'); }
    closeModal('modal-cours');
    resetCoursModal();
    loadCours();
  } catch (e) {}
}

async function deleteCours(id) {
  if (!confirmDelete('Supprimer ce cours ?')) return;
  try { await api.cours.remove(id); showToast('Cours supprimé', 'success'); loadCours(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => { loadSelects(); loadCours(); });

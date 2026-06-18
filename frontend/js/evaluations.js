// evaluations.js
const TYPE_BADGE = {
  devoir: 'badge-blue', tp: 'badge-green',
  interrogation: 'badge-orange', examen: 'badge-red',
};
let allEvals = [];

async function loadEvals() {
  const tbody = document.getElementById('eval-tbody');
  renderTableLoading(tbody, 6);
  try {
    allEvals = await api.evaluations.getAll();
    updateEvalStats(allEvals);
    renderEvals(allEvals);
  } catch (e) { renderTableEmpty(tbody, 6, 'Erreur de chargement'); }
}

function updateEvalStats(list) {
  const today   = new Date();
  const passees = list.filter(e => new Date(e.date_evaluation) <= today).length;
  document.getElementById('s-total').textContent   = list.length;
  document.getElementById('s-passees').textContent = passees;
  document.getElementById('s-avenir').textContent  = list.length - passees;
  document.getElementById('eval-count').textContent = list.length + ' évaluations';
}

function renderEvals(list) {
  const tbody = document.getElementById('eval-tbody');
  if (!list.length) { renderTableEmpty(tbody, 6); return; }
  const today = new Date();
  tbody.innerHTML = list.map(e => {
    const passed = new Date(e.date_evaluation) <= today;
    const statut = passed
      ? '<span class="badge badge-green">Passée</span>'
      : '<span class="badge badge-orange">À venir</span>';
    return `
      <tr>
        <td><strong>${e.cours_name || `Cours #${e.cours_id}`}</strong></td>
        <td><span class="badge ${TYPE_BADGE[e.type_eval] || 'badge-gray'}">${e.type_eval}</span></td>
        <td>${fmtDate(e.date_evaluation)}</td>
        <td><span class="badge badge-purple">Coef. ${e.coefficient}</span></td>
        <td>${statut}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn-icon" onclick="editEval(${e.id})">modifier</button>
            <button class="btn-icon" onclick="deleteEval(${e.id})">supprimer</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function applyEvalFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const t = document.getElementById('filter-type').value;
  renderEvals(allEvals.filter(e => {
    const name = (e.cours_name || '').toLowerCase();
    return name.includes(q) && (!t || e.type_eval === t);
  }));
}

async function loadEvalCoursSelect() {
  const cours = await api.cours.getAll();
  const sel   = document.getElementById('eval-cours');
  sel.innerHTML = '<option value="">— Sélectionner un cours —</option>';
  cours.forEach(c => {
    sel.innerHTML += `<option value="${c.cours_id}">${c.cours_name}</option>`;
  });
}

function openNewEvalModal() {
  document.getElementById('eval-id').value   = '';
  document.getElementById('eval-cours').value = '';
  document.getElementById('eval-type').value = 'devoir';
  document.getElementById('eval-coef').value = '';
  document.getElementById('eval-date').value = '';
  document.getElementById('modal-eval-title').textContent = 'Nouvelle évaluation';
  openModal('modal-eval');
}

async function editEval(id) {
  const e = await api.evaluations.get(id);
  document.getElementById('eval-id').value    = e.id;
  document.getElementById('eval-cours').value = e.cours_id || '';
  document.getElementById('eval-type').value  = e.type_eval;
  document.getElementById('eval-coef').value  = e.coefficient;
  document.getElementById('eval-date').value  = e.date_evaluation?.split('T')[0];
  document.getElementById('modal-eval-title').textContent = "Modifier l'évaluation";
  openModal('modal-eval');
}

async function saveEval() {
  const id   = document.getElementById('eval-id').value;
  const data = {
    cours_id:        document.getElementById('eval-cours').value || null,
    type_eval:       document.getElementById('eval-type').value,
    coefficient:     parseInt(document.getElementById('eval-coef').value),
    date_evaluation: document.getElementById('eval-date').value,
  };
  if (!data.date_evaluation || !data.coefficient) {
    showToast('Date et coefficient obligatoires', 'error'); return;
  }
  try {
    if (id) { await api.evaluations.update(id, data); showToast('Évaluation modifiée', 'success'); }
    else    { await api.evaluations.create(data);     showToast('Évaluation ajoutée', 'success'); }
    closeModal('modal-eval');
    loadEvals();
  } catch (e) {}
}

async function deleteEval(id) {
  if (!confirmDelete('Supprimer cette évaluation ?')) return;
  try { await api.evaluations.remove(id); showToast('Supprimée', 'success'); loadEvals(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search')?.addEventListener('input', applyEvalFilters);
  document.getElementById('filter-type')?.addEventListener('change', applyEvalFilters);
  loadEvalCoursSelect();
  loadEvals();
});

// js/precedences.js
let allPrecs = [];

async function loadPrecs() {
  const tbody = document.getElementById('prec-tbody');
  renderTableLoading(tbody, 3);
  try {
    allPrecs = await api.get('/api/precedences');
    renderPrecs(allPrecs);
  } catch (e) { renderTableEmpty(tbody, 3, 'Erreur'); }
}

function renderPrecs(list) {
  const tbody = document.getElementById('prec-tbody');
  if (!list.length) { renderTableEmpty(tbody, 3); return; }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><strong>${p.cours_name || '—'}</strong><br><small>${p.code || ''}</small></td>
      <td>→</td>
      <td>${p.prereq_name || '—'}<br><small>${p.prereq_code || ''}</small></td>
      <td>
        <button class="btn-icon" onclick="deletePrec(${p.ec_id})">supprimer</button>
      </td>
    </tr>`).join('');
}

async function loadPrecSelects() {
  try {
    const elements = await api.get('/api/elements');
    const coursSelect = document.getElementById('prec-cours');
    const prereqSelect = document.getElementById('prec-prereq');
    const opts = elements.map(e =>
      `<option value="${e.id}">${e.libelle} (${e.code})</option>`).join('');
    if (coursSelect) coursSelect.innerHTML = '<option value="">— Cours —</option>' + opts;
    if (prereqSelect) prereqSelect.innerHTML = '<option value="">— Prérequis —</option>' + opts;
  } catch(e) {}
}

function openNewPrec() {
  document.getElementById('prec-id').value = '';
  document.getElementById('prec-cours').value = '';
  document.getElementById('prec-prereq').value = '';
  openModal('modal-prec');
}

async function savePrec() {
  const data = {
    ec_id:     document.getElementById('prec-cours').value  || null,
    prereq_id: document.getElementById('prec-prereq').value || null,
  };
  if (!data.ec_id || !data.prereq_id) {
    showToast('Cours et prérequis obligatoires', 'error'); return;
  }
  if (data.ec_id === data.prereq_id) {
    showToast('Un cours ne peut pas être son propre prérequis', 'error'); return;
  }
  try {
    await api.post('/api/precedences', data);
    showToast('Précédence ajoutée', 'success');
    closeModal('modal-prec');
    loadPrecs();
  } catch (e) {}
}

async function deletePrec(ecId) {
  if (!confirmDelete('Supprimer cette précédence ?')) return;
  try {
    await api.delete('/api/precedences/' + ecId);
    showToast('Supprimée', 'success');
    loadPrecs();
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  loadPrecSelects();
  loadPrecs();
});

// classes.js
const OPT_BADGE = { TC1:'badge-blue', TC2:'badge-cyan', ISI:'badge-green', IRS:'badge-purple' };
let allCls = [];

async function loadCls() {
  const tbody = document.getElementById('cls-tbody');
  renderTableLoading(tbody, 3);
  try {
    allCls = await api.classes.getAll();
    document.getElementById('cls-count').textContent = allCls.length + ' classes';
    renderCls(allCls);
  } catch (e) { renderTableEmpty(tbody, 3, 'Erreur'); }
}

function renderCls(list) {
  const tbody = document.getElementById('cls-tbody');
  if (!list.length) { renderTableEmpty(tbody, 3); return; }
  tbody.innerHTML = list.map(c => `
    <tr>
      <td><strong>${c.niveau || c.libelle || '—'}</strong></td>
      <td><span class="badge ${OPT_BADGE[c.option] || 'badge-gray'}">${c.option}</span></td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn-icon"  onclick="editCls(${c.classe_id || c.id})"><Modifier/button>
          <button class="btn-icon" onclick="deleteCls(${c.classe_id || c.id})">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}

function openNewClsModal() {
  document.getElementById('cls-id').value     = '';
  document.getElementById('cls-level').value  = '';
  document.getElementById('cls-option').value = '';
  document.getElementById('modal-cls-title').textContent = 'Nouvelle classe';
  openModal('modal-cls');
}

async function editCls(id) {
  const c = await api.classes.get(id);
  document.getElementById('cls-id').value     = c.classe_id || c.id;
  document.getElementById('cls-level').value  = c.niveau || c.libelle;
  document.getElementById('cls-option').value = c.option;
  document.getElementById('modal-cls-title').textContent = 'Modifier la classe';
  openModal('modal-cls');
}

async function saveCls() {
  const id   = document.getElementById('cls-id').value;
  const data = {
    niveau:  document.getElementById('cls-level').value.trim(),
    option:  document.getElementById('cls-option').value,
    libelle: document.getElementById('cls-level').value.trim() + '-' + document.getElementById('cls-option').value,
};
  if (!data.niveau || !data.option) {
    showToast('Niveau et option obligatoires', 'error'); return;
  }
  try {
    if (id) { await api.classes.update(id, data); showToast('Classe modifiée', 'success'); }
    else    { await api.classes.create(data);     showToast('Classe ajoutée', 'success'); }
    closeModal('modal-cls');
    loadCls();
  } catch (e) {}
}

async function deleteCls(id) {
  if (!confirmDelete('Supprimer cette classe ?')) return;
  try { await api.classes.remove(id); showToast('Supprimée', 'success'); loadCls(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filter-opt')?.addEventListener('change', e => {
    const opt = e.target.value;
    renderCls(opt ? allCls.filter(c => c.option === opt) : allCls);
  });
  loadCls();
});

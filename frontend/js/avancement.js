// avancement.js
const AV_COLORS = ['#58a6ff','#2ea043','#e3943a','#f85149','#a371f7','#56d364','#ffa657','#79c0ff'];
let allAv = [];

async function loadAv() {
  try {
    allAv = await api.avancement.getAll();
    updateAvStats(allAv);
    renderAvCards(allAv);
  } catch (e) { console.error(e); }
}

function updateAvStats(list) {
  if (!list.length) return;
  const pcts  = list.map(a => parseFloat(a.pourcentage) || 0);
  const moy   = Math.round(pcts.reduce((s, p) => s + p, 0) / list.length);
  const done  = pcts.filter(p => p >= 100).length;
  const zero  = pcts.filter(p => p === 0).length;
  document.getElementById('s-moy').textContent      = moy + '%';
  document.getElementById('s-termines').textContent = done;
  document.getElementById('s-encours').textContent  = list.length - done - zero;
  document.getElementById('s-zero').textContent     = zero;
}

function renderAvCards(list) {
  const grid = document.getElementById('av-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">📊</div><p>Aucune donnée</p></div>`;
    return;
  }
  grid.innerHTML = list.map((a, i) => {
    const pct   = parseFloat(a.pourcentage) || 0;
    const color = AV_COLORS[i % AV_COLORS.length];
    return `
      <div class="avancement-card">
        <div class="av-header">
          <div class="av-cours">${a.cours_name || `Cours #${a.cours_id}`}</div>
          <div class="av-pct" style="color:${color}">${pct.toFixed(0)}%</div>
        </div>
        <div class="progress" style="height:8px;margin-bottom:8px">
          <div class="progress-bar" style="width:${Math.min(pct, 100)}%;background:${color}"></div>
        </div>
        <div class="av-meta">${a.heures_realisees || 0}h réalisées / ${a.heures_prevues || 0}h prévues</div>
        <div style="margin-top:10px;display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="editAv(${a.id})">✏️ Modifier</button>
          <button class="btn btn-danger btn-sm" onclick="deleteAv(${a.id})">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// Recalcul du % en temps réel
function updateAvPreview() {
  const prev = parseInt(document.getElementById('av-prevues').value)   || 0;
  const real = parseInt(document.getElementById('av-realisees').value) || 0;
  document.getElementById('av-preview').textContent =
    prev > 0 ? `→ ${Math.round(real / prev * 100)}% d'avancement` : '';
}

async function loadAvCoursSelect() {
  const cours = await api.cours.getAll();
  const sel   = document.getElementById('av-cours');
  sel.innerHTML = '<option value="">— Sélectionner un cours —</option>';
  cours.forEach(c => {
    sel.innerHTML += `<option value="${c.cours_id}">${c.cours_name}</option>`;
  });
}

function openNewAvModal() {
  document.getElementById('av-id').value        = '';
  document.getElementById('av-cours').value     = '';
  document.getElementById('av-prevues').value   = '';
  document.getElementById('av-realisees').value = '';
  document.getElementById('av-preview').textContent = '';
  document.getElementById('modal-av-title').textContent = "Mettre à jour l'avancement";
  openModal('modal-av');
}

async function editAv(id) {
  const a = await api.avancement.get(id);
  document.getElementById('av-id').value        = a.id;
  document.getElementById('av-cours').value     = a.cours_id || '';
  document.getElementById('av-prevues').value   = a.heures_prevues || '';
  document.getElementById('av-realisees').value = a.heures_realisees || '';
  document.getElementById('modal-av-title').textContent = "Modifier l'avancement";
  updateAvPreview();
  openModal('modal-av');
}

async function saveAv() {
  const id   = document.getElementById('av-id').value;
  const prev = parseInt(document.getElementById('av-prevues').value)   || 0;
  const real = parseInt(document.getElementById('av-realisees').value) || 0;
  const data = {
    cours_id:         document.getElementById('av-cours').value || null,
    heures_prevues:   prev,
    heures_realisees: real,
    pourcentage:      prev > 0 ? parseFloat((real / prev * 100).toFixed(2)) : 0,
  };
  if (!data.heures_prevues) { showToast('Heures prévues obligatoires', 'error'); return; }
  try {
    if (id) { await api.avancement.update(id, data); showToast('Mis à jour', 'success'); }
    else    { await api.avancement.create(data);      showToast('Ajouté', 'success'); }
    closeModal('modal-av');
    loadAv();
  } catch (e) {}
}

async function deleteAv(id) {
  if (!confirmDelete('Supprimer cet avancement ?')) return;
  try { await api.avancement.remove(id); showToast('Supprimé', 'success'); loadAv(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('av-prevues')?.addEventListener('input', updateAvPreview);
  document.getElementById('av-realisees')?.addEventListener('input', updateAvPreview);
  loadAvCoursSelect();
  loadAv();
});

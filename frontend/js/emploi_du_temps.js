// emploi_du_temps.js
let allSeances = [];
let currentWeekOffset = 0;
const DAYS  = ['Lun','Mar','Mer','Jeu','Ven'];
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00',
               '13:00','14:00','15:00','16:00','17:00','18:00'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1 + offset * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function changeWeek(dir) {
  currentWeekOffset += dir;
  renderWeek();
}

function renderWeek() {
  const dates = getWeekDates(currentWeekOffset);
  const today = new Date().toISOString().split('T')[0];
  const fmt   = d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  document.getElementById('week-label').textContent =
    `Semaine du ${fmt(dates[0])} au ${fmt(dates[4])} ${dates[0].getFullYear()}`;

  let html = `<div class="day-cols">
    <div></div>
    ${dates.map((d, i) => {
      const iso = d.toISOString().split('T')[0];
      return `<div class="day-header ${iso === today ? 'today' : ''}">
        ${DAYS[i]}<br><small>${d.getDate()}/${d.getMonth() + 1}</small>
      </div>`;
    }).join('')}
  </div>`;

  html += HOURS.map(h => {
    let row = `<div class="day-cols" style="margin-top:3px">
      <div class="time-label">${h}</div>`;
    dates.forEach(d => {
      const iso    = d.toISOString().split('T')[0];
      const seance = allSeances.find(s =>
        s.date_seance?.startsWith(iso) && s.heure_debut?.slice(0, 5) === h
      );
      if (seance) {
        const type = (seance.type_seance || 'COURS').toLowerCase();
        const sid  = seance.id || seance.id_table;
        row += `<div class="slot ${type}" onclick="editSeance(${sid})">
          <div class="slot-name">${seance.cours || seance.cours_name || '—'}</div>
          <div class="slot-meta">${seance.salle || ''}</div>
          <div class="slot-meta">${seance.enseignant_nom || ''} ${seanceBadge(seance.type_seance || 'COURS')}</div>
        </div>`;
      } else {
        row += `<div class="slot empty"></div>`;
      }
    });
    row += `</div>`;
    return row;
  }).join('');

  document.getElementById('edt-view').innerHTML = html;
}

async function loadSeances() {
  const classeId = document.getElementById('filter-classe')?.value || null;
  try {
    allSeances = await api.seances.getAll(classeId);
    document.getElementById('seances-count').textContent = allSeances.length + ' séances';
    renderWeek();
    renderSeancesTable();
  } catch (e) { console.error(e); }
}

function renderSeancesTable() {
  const tbody = document.getElementById('seances-tbody');
  if (!allSeances.length) { renderTableEmpty(tbody, 7); return; }
  tbody.innerHTML = allSeances.map(s => `
    <tr>
      <td><strong>${s.cours || s.cours_name || '—'}</strong></td>
      <td>${fmtDate(s.date_seance)}</td>
      <td style="font-family:var(--font-mono);font-size:0.75rem">
        ${fmtTime(s.heure_debut)} – ${fmtTime(s.heure_fin)}
      </td>
      <td>${s.salle || '—'}</td>
      <td>${seanceBadge(s.type_seance || 'COURS')}</td>
      <td>${s.enseignant_nom ? s.enseignant_nom + ' ' + (s.enseignant_prenom || '') : '—'}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn-icon" onclick="editSeance(${s.id || s.id_table})">✏️</button>
          <button class="btn-icon" onclick="deleteSeance(${s.id || s.id_table})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

async function loadEdtSelects() {
  const [cours, cls, ens] = await Promise.allSettled([
    api.get('/api/elements'), api.classes.getAll(), api.enseignants.getAll()
  ]);
  const clsFilter = document.getElementById('filter-classe');
  const clsSelect = document.getElementById('seance-classe');
  (cls.value || []).forEach(c => {
    const opt = `<option value="${c.id}">${c.option} - ${c.niveau || ''}</option>`;
    if (clsFilter) clsFilter.innerHTML += opt;
    if (clsSelect) clsSelect.innerHTML += opt;
  });
  const coursSelect = document.getElementById('seance-cours');
  if (coursSelect) {
    coursSelect.innerHTML = '<option value="">— Cours —</option>';
    (cours.value || []).forEach(c => {
      coursSelect.innerHTML += `<option value="${c.id}">${c.libelle} (${c.code})</option>`;
    });
  }
  const ensSelect = document.getElementById('seance-ens');
  if (ensSelect) {
    ensSelect.innerHTML = '<option value="">— Enseignant —</option>';
    (ens.value || []).forEach(e => {
      ensSelect.innerHTML += `<option value="${e.id || e.enseignant_id}">${e.nom || e.enseignant_name} ${e.prenom || ''}</option>`;
    });
  }
}

function openNewSeance() {
  document.getElementById('seance-id').value    = '';
  document.getElementById('seance-date').value  = '';
  document.getElementById('seance-salle').value = '';
  document.getElementById('seance-debut').value = '';
  document.getElementById('seance-fin').value   = '';
  document.getElementById('seance-cours').value = '';
  document.getElementById('seance-classe').value= '';
  document.getElementById('seance-ens').value   = '';
  document.getElementById('seance-type').value  = 'COURS';
  document.getElementById('modal-seance-title').textContent = 'Nouvelle séance';
  openModal('modal-seance');
}

async function editSeance(id) {
  const s = await api.seances.get(id);
  document.getElementById('seance-id').value     = s.id || s.id_table;
  document.getElementById('seance-cours').value  = s.ec_id || s.cours_id || '';
  document.getElementById('seance-classe').value = s.classe_id || '';
  document.getElementById('seance-ens').value    = s.enseignant_id || '';
  document.getElementById('seance-type').value   = s.type_seance || 'COURS';
  document.getElementById('seance-date').value   = s.date_seance?.split('T')[0];
  document.getElementById('seance-salle').value  = s.salle || '';
  document.getElementById('seance-debut').value  = s.heure_debut?.slice(0, 5);
  document.getElementById('seance-fin').value    = s.heure_fin?.slice(0, 5);
  document.getElementById('modal-seance-title').textContent = 'Modifier la séance';
  openModal('modal-seance');
}

async function saveSeance() {
  const id   = document.getElementById('seance-id').value;
  const data = {
    ec_id:         document.getElementById('seance-cours').value  || null,
    cours_id:      document.getElementById('seance-cours').value  || null,
    classe_id:     document.getElementById('seance-classe').value || null,
    enseignant_id: document.getElementById('seance-ens').value    || null,
    type_seance:   document.getElementById('seance-type').value,
    date_seance:   document.getElementById('seance-date').value,
    salle:         document.getElementById('seance-salle').value.trim() || null,
    heure_debut:   document.getElementById('seance-debut').value,
    heure_fin:     document.getElementById('seance-fin').value,
  };
  if (!data.date_seance || !data.heure_debut || !data.heure_fin) {
    showToast('Date et horaires obligatoires', 'error'); return;
  }
  try {
    if (id) { await api.seances.update(id, data); showToast('Séance modifiée', 'success'); }
    else    { await api.seances.create(data);      showToast('Séance créée', 'success'); }
    closeModal('modal-seance');
    loadSeances();
  } catch (e) {}
}

async function deleteSeance(id) {
  if (!confirmDelete('Supprimer cette séance ?')) return;
  try { await api.seances.remove(id); showToast('Supprimée', 'success'); loadSeances(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filter-classe')?.addEventListener('change', loadSeances);
  loadEdtSelects();
  loadSeances();
  renderWeek();
});


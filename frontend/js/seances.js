// seances.js — page dédiée à la liste des séances
let allSeancesList = [];

async function loadSeancesList() {
  const tbody = document.getElementById('seances-tbody');
  renderTableLoading(tbody, 7);
  try {
    allSeancesList = await api.seances.getAll();
    document.getElementById('seances-count').textContent = allSeancesList.length + ' séances';
    renderSeancesList(allSeancesList);
  } catch (e) { renderTableEmpty(tbody, 7, 'Erreur de chargement'); }
}

function renderSeancesList(list) {
  const tbody = document.getElementById('seances-tbody');
  if (!list.length) { renderTableEmpty(tbody, 7); return; }
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.cours || s.cours_name || '—'}</strong></td>
      <td>${s.classe || '—'}</td>
      <td>${fmtDate(s.date_seance)}</td>
      <td style="font-family:var(--font-mono);font-size:0.75rem">
        ${fmtTime(s.heure_debut)} – ${fmtTime(s.heure_fin)}
      </td>
      <td>${s.salle || '—'}</td>
      <td>${seanceBadge(s.type_seance || 'COURS')}</td>
      <td>${s.enseignant_nom ? s.enseignant_nom + ' ' + (s.enseignant_prenom || '') : '—'}</td>
    </tr>`).join('');
}

function applySeancesFilter() {
  const q = document.getElementById('search')?.value.toLowerCase() || '';
  renderSeancesList(allSeancesList.filter(s =>
    (s.cours || s.cours_name || '').toLowerCase().includes(q)
  ));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search')?.addEventListener('input', applySeancesFilter);
  loadSeancesList();
});

// dashboard.js
const COLORS = ['#58a6ff','#2ea043','#e3943a','#f85149','#a371f7','#56d364','#ffa657','#79c0ff'];

async function loadDashboard() {
  try {
    const [cours, enseignants, evaluations, avancement, seances] = await Promise.allSettled([
      api.cours.getAll(),
      api.enseignants.getAll(),
      api.evaluations.getAll(),
      api.avancement.getAll(),
      api.seances.getAll(),
    ]);

    const coursData = cours.value || [];
    const ensData   = enseignants.value || [];
    const evalData  = evaluations.value || [];
    const avancData = avancement.value || [];
    const seancesData = seances.value || [];

    // ── Stats ──────────────────────────────────────────────────────────
    document.getElementById('stat-cours').textContent = coursData.length;
    document.getElementById('stat-ens').textContent   = ensData.length;
    document.getElementById('stat-eval').textContent  = evalData.length;

    const actifs = coursData.filter(c => new Date(c.cours_fin) >= new Date()).length;
    document.getElementById('stat-ec').textContent     = actifs;
    document.getElementById('stat-ec-sub').textContent = `${coursData.length - actifs} terminé(s)`;

    const evalPassees = evalData.filter(e => new Date(e.date_evaluation) <= new Date()).length;
    document.getElementById('stat-eval-sub').textContent = evalData.length
      ? `${Math.round(evalPassees / evalData.length * 100)}% taux de complétion` : '';

    // ── Séances du jour ────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const todaySeances = seancesData.filter(s => s.date_seance?.startsWith(today));
    const seancesEl = document.getElementById('seances-today');

    if (todaySeances.length === 0) {
      seancesEl.innerHTML = `<div class="empty-state"><div class="icon">📅</div><p>Aucune séance aujourd'hui</p></div>`;
    } else {
      seancesEl.innerHTML = todaySeances.map(s => `
        <div class="edt-row">
          <div class="edt-time">${fmtTime(s.heure_debut)}<br>${fmtTime(s.heure_fin)}</div>
          <div class="edt-slot ${(s.type_seance||'COURS').toLowerCase() === 'tp' ? 'has-tp' : 'has-cours'}">
            <div class="edt-slot-name">${s.cours || s.cours_name || '—'}</div>
            <div class="edt-slot-info">
              ${s.salle || '—'} &nbsp;·&nbsp;
              ${s.enseignant_nom || ''} ${s.enseignant_prenom || ''}
              &nbsp;${seanceBadge(s.type_seance || 'COURS')}
            </div>
          </div>
        </div>
      `).join('');
    }

    // ── Avancement ─────────────────────────────────────────────────────
    const avList = document.getElementById('avancement-list');
    if (!avancData.length) {
      avList.innerHTML = `<div class="empty-state"><p>Aucune donnée d'avancement</p></div>`;
    } else {
      avList.innerHTML = avancData.slice(0, 6).map((a, i) => {
        const pct   = parseFloat(a.pourcentage) || (a.heures_prevues
          ? Math.round(a.heures_realisees / a.heures_prevues * 100) : 0);
        const color = COLORS[i % COLORS.length];
        return `
          <div class="avancement-item">
            <div class="avancement-dot" style="background:${color}"></div>
            <div class="avancement-name">${a.cours_name || `Cours #${a.cours_id}`}</div>
            <div class="avancement-bar">
              <div class="progress">
                <div class="progress-bar" style="width:${Math.min(pct,100)}%;background:${color}"></div>
              </div>
            </div>
            <div class="avancement-pct">${pct}%</div>
          </div>`;
      }).join('');
    }

    // ── Tableau cours récents ──────────────────────────────────────────
    const tbody = document.getElementById('cours-table');
    if (!coursData.length) {
      renderTableEmpty(tbody, 5, 'Aucun cours enregistré');
    } else {
      tbody.innerHTML = coursData.slice(0, 6).map(c => `
        <tr>
          <td><strong>${c.cours_name}</strong></td>
          <td><span class="badge badge-blue">${c.cours_volume}h</span></td>
          <td>${c.enseignant_nom ? c.enseignant_nom + ' ' + (c.enseignant_prenom || '') : '—'}</td>
          <td>${c.classe || '—'}</td>
          <td style="font-size:0.75rem;color:var(--text-secondary)">
            ${fmtDate(c.cours_debut)} → ${fmtDate(c.cours_fin)}
          </td>
        </tr>`).join('');
    }

  } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', loadDashboard);

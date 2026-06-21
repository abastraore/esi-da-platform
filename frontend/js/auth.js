async function login() {
  const login    = document.getElementById('login-input').value.trim();
  const password = document.getElementById('password-input').value;
  const errEl    = document.getElementById('login-error');

  if (!login || !password) {
    errEl.textContent = 'Identifiant et mot de passe requis.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Connexion...';
  errEl.style.display = 'none';

  try {
    const res = await fetch(API_BASE + '/api/auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ login, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Identifiants incorrects');

    sessionStorage.setItem('esi_user',  JSON.stringify(data.user || { login }));
    sessionStorage.setItem('esi_token', data.token || 'ok');

    window.location.href = 'dashboard.html';

  } catch (err) {
    errEl.textContent    = err.message;
    errEl.style.display  = 'block';
    btn.disabled         = false;
    btn.textContent      = 'Se connecter';
  }
}

function logout() {
  sessionStorage.removeItem('esi_user');
  sessionStorage.removeItem('esi_token');
  window.location.href = 'admin.html';
}

function requireAuth() {
  const token = sessionStorage.getItem('esi_token');
  if (!token) window.location.href = 'admin.html';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('password-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });
  document.getElementById('login-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('password-input')?.focus();
  });
});

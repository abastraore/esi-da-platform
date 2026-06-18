// admin.js — page de connexion
// La logique est dans auth.js, ce fichier gère l'UI de la page login

document.addEventListener('DOMContentLoaded', () => {
  // Si déjà connecté, rediriger directement
  if (sessionStorage.getItem('esi_token')) {
    window.location.href = 'dashboard.html';
  }
});

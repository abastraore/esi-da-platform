# 🚀 Guide de déploiement — ESI DA Platform
**Stack : GitHub + Render (backend PHP) + Supabase (PostgreSQL) + GitHub Pages (frontend)**

---

## Vue d'ensemble

```
[Frontend HTML/JS]          [Backend PHP]         [Base de données]
 GitHub Pages          →     Render               →   Supabase
 (gratuit)                   (gratuit)                (gratuit)
```

---

## ÉTAPE 1 — Préparer GitHub

### 1.1 Créer le dépôt

1. Va sur [github.com](https://github.com) → **New repository**
2. Nom : `esi-da-platform`
3. Visibilité : **Public** (nécessaire pour GitHub Pages gratuit)
4. Ne pas initialiser avec README (tu vas pousser le code existant)
5. Clique **Create repository**

### 1.2 Pousser le code

Dans ton terminal, depuis le dossier `projet_tutore_final` :

```bash
cd projet_tutore_final

# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit — ESI DA Platform"

# Lier à GitHub et pousser
git remote add origin https://github.com/TON-USERNAME/esi-da-platform.git
git branch -M main
git push -u origin main
```

> Remplace `TON-USERNAME` par ton vrai nom d'utilisateur GitHub.

---

## ÉTAPE 2 — Configurer Supabase (Base de données)

### 2.1 Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Nom : `esi-da-platform`
3. Choisis un mot de passe fort pour la base (note-le bien)
4. Région : **Europe West** (Frankfurt) — la plus proche de Bobo
5. Clique **Create new project** (attend ~2 min)

### 2.2 Récupérer les identifiants de connexion

Dans ton projet Supabase :
- Va dans **Settings** → **Database**
- Section **Connection parameters** (mode **Transaction** ou **Session**)
- Note ces valeurs :
  - **Host** : `db.XXXXXXXXXXXX.supabase.co`
  - **Database name** : `postgres`
  - **Port** : `5432`
  - **User** : `postgres`
  - **Password** : celui que tu as défini à l'étape 2.1

### 2.3 Créer les tables

1. Dans Supabase, va dans **SQL Editor**
2. Clique **New query**
3. Copie-colle tout le contenu du fichier `backend/config/database.sql`
4. Clique **Run** (▶)

Tu devrais voir `Success. No rows returned` pour chaque commande.

> **Compte admin par défaut :**
> - Login : `admin`
> - Mot de passe : `admin1234`
>
> ⚠️ Change ce mot de passe en production via SQL :
> ```sql
> UPDATE USERS SET password = '$2y$10$...' WHERE login = 'admin';
> ```
> (Génère le hash avec `password_hash('nouveau_mdp', PASSWORD_BCRYPT)` en PHP)

---

## ÉTAPE 3 — Déployer le backend sur Render

### 3.1 Créer le service

1. Va sur [render.com](https://render.com) → **New** → **Web Service**
2. Connecte ton compte GitHub si pas encore fait
3. Sélectionne le dépôt `esi-da-platform`
4. Configure :

| Champ | Valeur |
|-------|--------|
| **Name** | `esi-da-platform-backend` |
| **Region** | Frankfurt (EU) |
| **Branch** | `main` |
| **Root Directory** | *(laisser vide)* |
| **Runtime** | **PHP** |
| **Build Command** | *(laisser vide)* |
| **Start Command** | `php -S 0.0.0.0:$PORT -t backend backend/router.php` |

### 3.2 Ajouter les variables d'environnement

Dans la section **Environment Variables**, ajoute :

| Clé | Valeur |
|-----|--------|
| `DB_HOST` | `db.XXXXXXXXXXXX.supabase.co` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | ton mot de passe Supabase |
| `FRONTEND_URL` | `https://TON-USERNAME.github.io` |

5. Clique **Create Web Service**

> Render va déployer automatiquement. Ça prend 2–5 minutes la première fois.

### 3.3 Vérifier que le backend fonctionne

Une fois déployé, note l'URL de ton service (ex: `https://esi-da-platform-backend.onrender.com`).

Teste dans le navigateur :
```
https://esi-da-platform-backend.onrender.com/api
```
Tu dois voir : `{"status":"ok","message":"ESI DA Platform API opérationnelle"}`

Test complet :
```
https://esi-da-platform-backend.onrender.com/api/cours
```
Tu dois voir une liste JSON des cours.

---

## ÉTAPE 4 — Configurer le frontend

### 4.1 Mettre à jour l'URL du backend

Dans le fichier `frontend/js/config.js`, remplace l'URL par celle de ton service Render :

```javascript
window.API_BASE_URL = 'https://esi-da-platform-backend.onrender.com';
```

Puis push :
```bash
git add frontend/js/config.js
git commit -m "Set production API URL"
git push
```

### 4.2 Activer GitHub Pages

1. Dans ton dépôt GitHub → **Settings** → **Pages**
2. Source : **Deploy from a branch**
3. Branch : `main` / Folder : `/ (root)`
4. Clique **Save**

GitHub va générer une URL du type :
```
https://TON-USERNAME.github.io/esi-da-platform/
```

### 4.3 Accéder au frontend

Ouvre :
```
https://TON-USERNAME.github.io/esi-da-platform/projet_tutore/frontend/pages/dashboard.html
```

---

## ÉTAPE 5 — Vérification finale

Checklist :

- [ ] `https://TON-USERNAME.github.io/esi-da-platform/` répond
- [ ] `https://esi-da-platform-backend.onrender.com/api` répond `{"status":"ok"}`
- [ ] `https://esi-da-platform-backend.onrender.com/api/cours` retourne des données
- [ ] Le dashboard affiche les statistiques correctement
- [ ] La connexion admin fonctionne (login: `admin`, mdp: `admin1234`)

---

## Résumé des URLs finales

| Service | URL |
|---------|-----|
| Frontend | `https://TON-USERNAME.github.io/esi-da-platform/projet_tutore/frontend/pages/dashboard.html` |
| Backend API | `https://esi-da-platform-backend.onrender.com/api` |
| Base de données | Supabase (connexion interne backend uniquement) |

---

## Problèmes courants

### ❌ "Connexion BDD échouée"
→ Vérifie les variables d'environnement sur Render (DB_HOST, DB_PASSWORD)
→ Vérifie que le SQL a bien été exécuté dans Supabase

### ❌ "Network Error" ou CORS sur le frontend
→ Vérifie que `FRONTEND_URL` dans Render correspond exactement à l'URL GitHub Pages
→ Vérifie l'URL dans `frontend/js/config.js`

### ❌ Le service Render "dort" (cold start ~30s)
→ Render en plan gratuit met le service en veille après 15 min d'inactivité
→ Solution : utilise [UptimeRobot](https://uptimerobot.com) pour pinger `/api` toutes les 10 min

### ❌ Erreur 502 sur Render
→ Vérifie les logs Render (onglet **Logs** dans le dashboard)
→ Vérifie que le Start Command est bien : `php -S 0.0.0.0:$PORT -t backend backend/router.php`

---

## Modifications apportées au projet

| Fichier | Modification |
|---------|-------------|
| `backend/config/database.php` | Support `DATABASE_URL`, variables d'env système, SSL Supabase |
| `backend/config/database.sql` | Ajout colonne `role` dans USERS, mot de passe hashé |
| `backend/index.php` | Route `/api` de santé, CORS configurable via `FRONTEND_URL` |
| `backend/router.php` | **Nouveau** — router pour serveur PHP intégré (Render) |
| `frontend/js/api.js` | URL backend configurable via `window.API_BASE_URL` |
| `frontend/js/config.js` | **Nouveau** — fichier de config URL pour la production |
| `frontend/pages/*.html` | Ajout de `config.js` avant `api.js` |
| `render.yaml` | **Nouveau** — configuration déploiement Render |
| `.gitignore` | **Nouveau** — exclut `.env` et fichiers sensibles |
| `backend/.env.example` | **Nouveau** — template de configuration |

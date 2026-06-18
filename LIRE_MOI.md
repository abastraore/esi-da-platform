# ESI DA Platform — Guide d'installation

## 1. Placer le dossier dans XAMPP

Copie le dossier **`projet_tutore`** entier dans :
```
C:/xampp/htdocs/projet_tutore/
```

La structure doit ressembler à ceci :
```
htdocs/
└── projet_tutore/
    ├── backend/
    │   ├── index.php
    │   ├── .htaccess
    │   ├── .env          ← configurer ici
    │   ├── config/
    │   └── routes/
    └── frontend/
        ├── css/
        ├── js/
        └── pages/
```

## 2. Configurer la base de données

Ouvre le fichier **`backend/.env`** et modifie :
```
DB_USER=postgres         ← ton utilisateur PostgreSQL
DB_PASSWORD=             ← ton mot de passe PostgreSQL
DB_NAME=projet_tutore    ← nom de ta base (créer si elle n'existe pas)
```

## 3. Créer la base de données

Dans pgAdmin ou psql, exécute le fichier :
```
backend/config/database.sql
```

## 4. Activer mod_rewrite dans XAMPP

- Ouvre `C:/xampp/apache/conf/httpd.conf`
- Trouve la ligne : `#LoadModule rewrite_module modules/mod_rewrite.so`
- Enlève le `#` devant
- Redémarre Apache dans XAMPP

## 5. Lancer l'application

- Démarre **Apache** et **PostgreSQL** dans XAMPP
- Ouvre le navigateur et va sur :
```
http://localhost/projet_tutore/frontend/pages/dashboard.html
```

## Test de l'API

Pour vérifier que le backend répond, ouvre :
```
http://localhost/projet_tutore/backend/api/cours
```
Tu dois voir du JSON (même vide `[]`).


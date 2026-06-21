
DROP TABLE IF EXISTS AVANCEMENT_COURS    CASCADE;
DROP TABLE IF EXISTS EVALUATION          CASCADE;
DROP TABLE IF EXISTS EMPLOI_DU_TEMPS     CASCADE;
DROP TABLE IF EXISTS SEANCE              CASCADE;
DROP TABLE IF EXISTS COURS               CASCADE;
DROP TABLE IF EXISTS ELEMENT_CONSTITUTIF CASCADE;
DROP TABLE IF EXISTS ETUDIANT            CASCADE;
DROP TABLE IF EXISTS CLASSES             CASCADE;
DROP TABLE IF EXISTS ENSEIGNANT          CASCADE;
DROP TABLE IF EXISTS USERS               CASCADE;

CREATE TABLE USERS (
    id         SERIAL PRIMARY KEY,
    login      VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'admin',
    CONSTRAINT chk_role CHECK (role IN ('admin','enseignant','etudiant'))
);

CREATE TABLE ENSEIGNANT (
    id                 SERIAL PRIMARY KEY,
    nom                VARCHAR(100) NOT NULL,
    prenom             VARCHAR(100) NOT NULL,
    email              VARCHAR(150) UNIQUE,
    module             VARCHAR(100),
    grade              VARCHAR(5)   NOT NULL,
    CONSTRAINT chk_grade CHECK (grade IN ('DR','PR','MC','MA','MR'))
);

CREATE TABLE CLASSES (
    id       SERIAL PRIMARY KEY,
    libelle  VARCHAR(20)  NOT NULL,
    niveau   VARCHAR(10)  NOT NULL,
    option   VARCHAR(10)  NOT NULL,
    CONSTRAINT chk_option CHECK (option IN ('TC1','TC2','ISI','IRS'))
);

CREATE TABLE ETUDIANT (
    id         SERIAL PRIMARY KEY,
    matricule  VARCHAR(20)  NOT NULL UNIQUE,
    nom        VARCHAR(100) NOT NULL,
    prenom     VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE,
    classe_id  INTEGER REFERENCES CLASSES(id) ON DELETE SET NULL
);
CREATE TABLE COURS (
    cours_id      SERIAL PRIMARY KEY,
    cours_name    VARCHAR(100) NOT NULL,
    cours_volume  INTEGER      NOT NULL,
    cours_debut   DATE         NOT NULL,
    cours_fin     DATE         NOT NULL,
    cours_prof    INTEGER REFERENCES ENSEIGNANT(id) ON DELETE SET NULL,
    cours_level   INTEGER REFERENCES CLASSES(id)    ON DELETE CASCADE
);


CREATE TABLE ELEMENT_CONSTITUTIF (
    id            SERIAL PRIMARY KEY,
    code          VARCHAR(20)  NOT NULL UNIQUE,
    libelle       VARCHAR(100) NOT NULL,
    cours_id      INTEGER REFERENCES COURS(cours_id)          ON DELETE CASCADE,
    enseignant_id INTEGER REFERENCES ENSEIGNANT(id)           ON DELETE SET NULL,
    credits_ects  INTEGER DEFAULT 3,
    prerequis_id  INTEGER REFERENCES ELEMENT_CONSTITUTIF(id)  ON DELETE SET NULL
);


CREATE TABLE SEANCE (
    id            SERIAL PRIMARY KEY,
    ec_id         INTEGER REFERENCES ELEMENT_CONSTITUTIF(id) ON DELETE CASCADE,
    enseignant_id INTEGER REFERENCES ENSEIGNANT(id)          ON DELETE SET NULL,
    classe_id     INTEGER REFERENCES CLASSES(id)             ON DELETE CASCADE,
    salle         VARCHAR(30),
    date_seance   DATE NOT NULL,
    heure_debut   TIME NOT NULL,
    heure_fin     TIME NOT NULL,
    type_seance   VARCHAR(20) DEFAULT 'COURS',
    CONSTRAINT chk_horaires    CHECK (heure_debut < heure_fin),
    CONSTRAINT chk_type_seance CHECK (type_seance IN ('COURS','TP','TD'))
);


CREATE TABLE EVALUATION (
    id               SERIAL PRIMARY KEY,
    cours_id         INTEGER REFERENCES COURS(cours_id) ON DELETE CASCADE,
    type_eval        VARCHAR(20) NOT NULL,
    date_evaluation  DATE        NOT NULL,
    coefficient      INTEGER     NOT NULL,
    note_moyenne     DECIMAL(4,2),
    statut           VARCHAR(20) DEFAULT 'a_venir',
    CONSTRAINT chk_type_eval   CHECK (type_eval IN ('devoir','tp','interrogation','examen')),
    CONSTRAINT chk_statut_eval CHECK (statut    IN ('a_venir','planifie','termine'))
);


CREATE TABLE AVANCEMENT_COURS (
    id                SERIAL PRIMARY KEY,
    cours_id          INTEGER REFERENCES COURS(cours_id) ON DELETE CASCADE,
    heures_prevues    INTEGER,
    heures_realisees  INTEGER DEFAULT 0,
    pourcentage       DECIMAL(5,2) GENERATED ALWAYS AS (
                          CASE WHEN heures_prevues > 0
                               THEN ROUND((heures_realisees::DECIMAL / heures_prevues) * 100, 2)
                               ELSE 0
                          END
                      ) STORED
);

INSERT INTO ENSEIGNANT (nom, prenom, email, module, grade) VALUES
('Traoré',    'Moussa',   'traore@esi.bf',    'Algorithmique',    'PR'),
('Ouédraogo', 'Fatima',   'ouedraogo@esi.bf', 'Bases de données', 'MC'),
('Kaboré',    'Ibrahim',  'kabore@esi.bf',    'Mathématiques',    'MA'),
('Sawadogo',  'Aminata',  'sawadogo@esi.bf',  'Réseaux',          'MC'),
('Zongo',     'Pascal',   'zongo@esi.bf',     'Systèmes',         'MA');

INSERT INTO CLASSES (libelle, niveau, option) VALUES
('TC1-A', 'Licence', 'TC1'),
('TC2-A', 'Licence', 'TC2'),
('ISI-L3','Licence', 'ISI'),
('IRS-L3','Licence', 'IRS');

INSERT INTO ETUDIANT (matricule, nom, prenom, email, classe_id) VALUES
('ESI2024001', 'Kompaoré', 'Jean',     'jean.k@esi.bf',   2),
('ESI2024002', 'Nikiema',  'Marie',    'marie.n@esi.bf',  2),
('ESI2024003', 'Barro',    'Issouf',   'issouf.b@esi.bf', 2),
('ESI2024004', 'Diallo',   'Aïcha',    'aicha.d@esi.bf',  3),
('ESI2024005', 'Ouoba',    'Théodore', 'theo.o@esi.bf',   3);

INSERT INTO COURS (cours_name, cours_volume, cours_debut, cours_fin, cours_prof, cours_level) VALUES
('Algorithmique avancée',    45, '2025-01-06', '2025-06-20', 1, 2),
('Bases de données',         40, '2025-01-06', '2025-06-20', 2, 2),
('Mathématiques discrètes',  30, '2025-01-06', '2025-06-20', 3, 2),
('Réseaux informatiques',    35, '2025-01-06', '2025-06-20', 4, 3),
('Systèmes d''exploitation', 40, '2025-01-06', '2025-06-20', 5, 3);

INSERT INTO ELEMENT_CONSTITUTIF (code, libelle, cours_id, enseignant_id, credits_ects) VALUES
('INFO201', 'Algorithmique avancée',    1, 1, 4),
('BD201',   'Bases de données',         2, 2, 4),
('MAT201',  'Mathématiques discrètes',  3, 3, 3),
('RES301',  'Réseaux informatiques',    4, 4, 3),
('SYS301',  'Systèmes d''exploitation', 5, 5, 3);

INSERT INTO SEANCE (ec_id, enseignant_id, classe_id, salle, date_seance, heure_debut, heure_fin, type_seance) VALUES
(1, 1, 2, 'Salle 8',  '2025-06-10', '08:00', '10:00', 'COURS'),
(2, 2, 2, 'TP 3',     '2025-06-10', '14:00', '16:00', 'TP'),
(3, 3, 2, 'Amphi A',  '2025-06-11', '08:00', '10:00', 'COURS'),
(4, 4, 3, 'Salle 12', '2025-06-11', '10:00', '12:00', 'COURS'),
(5, 5, 3, 'Salle 5',  '2025-06-12', '14:00', '16:00', 'TD');

INSERT INTO EVALUATION (cours_id, type_eval, date_evaluation, coefficient, statut) VALUES
(1, 'examen',        '2025-06-20', 2, 'planifie'),
(2, 'tp',            '2025-06-12', 1, 'a_venir'),
(3, 'interrogation', '2025-06-15', 1, 'a_venir'),
(4, 'examen',        '2025-06-18', 2, 'planifie'),
(5, 'devoir',        '2025-06-08', 1, 'termine');

INSERT INTO AVANCEMENT_COURS (cours_id, heures_prevues, heures_realisees) VALUES
(1, 45, 30),
(2, 40, 28),
(3, 30, 25),
(4, 35, 20),
(5, 40, 36);

INSERT INTO USERS (login, password, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

# 🏨 PSAH - API Backend du Portail de Services d'un Hôtel à Paris

## 🎯 Introduction

Le backend PSAH est une API REST moderne développée pour servir le portail web d'un hôtel situé à Paris, visant à fournir toutes les données nécessaires pour mettre en avant ses services, ses chambres, ainsi que les informations essentielles à destination de ses futurs clients.

* **Public visé** : développeurs frontend et intégrateurs souhaitant consommer les données de l'hôtel
* **Objectif** : fournir une API robuste, performante et bien documentée pour alimenter l'interface utilisateur du portail hôtelier

## 🌟 Portée fonctionnelle

L'API backend couvre les fonctionnalités principales suivantes :

* 🛏️ Gestion des chambres et suites (détails, disponibilités, tarifs)
* 🍽️ Gestion des services disponibles (spa, restaurant, transport, etc.)
* 📍 Informations sur la localisation et les contacts
* 🔐 Authentification et gestion des utilisateurs (plusieurs profils disponibles)
* 📊 Statistiques et reporting pour l'administration et les gestionnaires
* 💰 Gestion des tarifs et facturation
* 🚕 Services de transport et navettes
* 🧹 Planification du nettoyage et de la maintenance
* 🌐 Support multilingue pour les contenus

## 🛠️ Stack technique

Le projet est développé avec les outils suivants :

* 📘 **Node.js** (environnement d'exécution JavaScript)
* 📝 **ESModule** (système de modules JavaScript moderne)
* 🚀 **Express.js** (framework web minimaliste)
* 💾 **Prisma** (ORM moderne pour l'accès à la base de données)
* 🧪 **Jest** (framework de test en ESModule)
* 📚 **Swagger/OpenAPI** (documentation interactive de l'API)

## 🔧 Prérequis

Avant de démarrer, vous devez avoir installé sur votre machine :

* **Node.js** (v16 ou plus recommandé)
* **npm** (v7 ou plus)
* Une base de données compatible avec Prisma (PostgreSQL)

## 🚀 Lancement en local

1. Clonez le dépôt :

```bash
git clone https://github.com/mickael234/projet-psah.git
cd projet-psah
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez votre fichier `.env` :

```
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/psah_db"

# Sécurité
JWT_SECRET="votre_clé_secrète_très_sécurisée"

# Configuration serveur
PORT=3000
```

4. Initialisez la base de données avec Prisma :

```bash
npx prisma migrate dev
```

5. Lancez le serveur :

```bash
node src/server.js
```

Le serveur sera accessible à l'adresse : http://localhost:3000

La documentation Swagger est disponible à l'adresse : http://localhost:3000/api-docs/

## 🧪 Tests

Les tests sont écrits avec Jest en utilisant les ESModules. Pour lancer l'ensemble des tests, utilisez la commande suivante :

```bash
node --experimental-vm-modules node_modules/.bin/jest
```

Pour exécuter un test spécifique :

```bash
node --experimental-vm-modules node_modules/.bin/jest tests/unit/auth.test.js
```

## 📁 Structure du projet

```
projet-psah/
├── prisma/
│   ├── schema.prisma       # Schéma de la base de données
│   └── migrations/         # Migrations de la base de données
├── src/
│   ├── controllers/        # Contrôleurs REST pour chaque ressource
│   ├── middleware/         # Middlewares (auth, validation, etc.)
│   ├── models/             # Modèles et logique métier
│   ├── routes/             # Définition des routes de l'API
│   ├── services/           # Services et logique métier complexe
│   ├── utils/              # Utilitaires et fonctions d'aide
│   ├── config/             # Configuration de l'application
│   ├── swagger/            # Documentation Swagger
│   └── server.js           # Point d'entrée de l'application
├── tests/
│   ├── models/             # Tests pour les modèles
│   ├── controllers/        # Tests pour les contrôleurs
│   ├── middleware/         # Tests pour les middlewares
│   └── routes/             # Tests pour les routes
├── __mocks__/              # Mocks pour les tests Jest
├── uploads/                # Dossier pour les fichiers uploadés (images, etc.)
├── .env                    # Variables d'environnement (à créer)
├── jest.config.js          # Configuration de Jest pour les tests
├── jest.setup.js           # Configuration initiale pour les tests
├── jest.teardown.js        # Nettoyage après les tests
├── jsdoc.conf.json         # Configuration pour la génération de documentation
├── eslint.config.js        # Configuration ESLint
├── package.json
└── README.md
```

## 🧑‍💻 Profils d'utilisateurs et fonctionnalités principales

L'API prend en charge différents profils d'utilisateurs avec des fonctionnalités spécifiques :

### Super Administrateur (Développeurs de solutions)
* Accès complet à toutes les fonctionnalités techniques et administratives
* Gestion de l'infrastructure technique et des déploiements
* Accès aux journaux et aux outils de surveillance

### Administrateur Général (Super Admin - Gestion Hôtelière)
* Gestion globale de la plateforme
* Supervision des finances et paiements
* Gestion des tarifs et disponibilités
* Génération de rapports d'activité

### Responsable Hébergement
* Gestion des réservations et opérations quotidiennes
* Validation des paiements
* Supervision des équipes de nettoyage et maintenance

### Réceptionniste / Support Client
* Gestion des demandes clients via différents canaux
* Enregistrement des arrivées et départs
* Modification des réservations sous conditions

### Propriétaire / Investisseur
* Accès aux statistiques et revenus
* Gestion des propriétés

### Personnel de Maintenance & Ménage
* Réception de notifications pour les interventions
* Mise à jour du statut des chambres
* Gestion des fournitures

### Client (Locataire)
* Réservation et paiement des hébergements
* Accès à l'historique des réservations
* Contact avec le support client
* Évaluations et avis

### Chauffeur / Personnel de Transport
* Gestion des demandes de transport
* Planification des trajets

### Comptabilité & Facturation
* Surveillance des paiements et gestion des factures
* Gestion des remboursements et litiges
* Génération de rapports financiers

## 📡 Points d'API 

Veuillez consulter la documentation Swagger disponible après le lancement du serveur.

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.
# Guide de déploiement sur Vercel

Ce guide vous explique comment déployer l'application Event-Link sur Vercel.

## Prérequis

- Un compte Vercel (gratuit) : [https://vercel.com](https://vercel.com)
- Un compte GitHub/GitLab/Bitbucket pour le dépôt de code
- Le backend API doit être déployé et accessible

## Variables d'environnement requises

Avant de déployer, vous devez configurer les variables d'environnement suivantes dans Vercel :

### Obligatoire

- `VITE_API_BASE_URL` : URL de base de votre API backend (ex: `https://api.yourapp.com`)

### Optionnelles

- `VITE_CLOUDINARY_CLOUD_NAME` : Nom de votre cloud Cloudinary (valeur par défaut: `dhzibf7tu`)
- `VITE_CLOUDINARY_UPLOAD_PRESET` : Preset d'upload Cloudinary (valeur par défaut: `eventlink`)
- `VITE_GOOGLE_CLIENT_ID` : Client ID Google OAuth (si vous utilisez Google Auth côté frontend)

## Déploiement via l'interface Vercel

### Étape 1 : Préparer le dépôt

1. Assurez-vous que votre code est poussé sur GitHub/GitLab/Bitbucket
2. Vérifiez que le fichier `vercel.json` est présent à la racine du projet

### Étape 2 : Importer le projet sur Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur **"Add New..."** > **"Project"**
3. Importez votre dépôt GitHub/GitLab/Bitbucket
4. Vercel détectera automatiquement que c'est un projet Vite

### Étape 3 : Configurer les variables d'environnement

1. Dans la page de configuration du projet, allez dans **"Environment Variables"**
2. Ajoutez les variables suivantes :
   - `VITE_API_BASE_URL` = URL de votre API backend
   - (Optionnel) `VITE_CLOUDINARY_CLOUD_NAME`
   - (Optionnel) `VITE_CLOUDINARY_UPLOAD_PRESET`
   - (Optionnel) `VITE_GOOGLE_CLIENT_ID`

3. Sélectionnez les environnements (Production, Preview, Development) pour chaque variable

### Étape 4 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances (`npm install`)
   - Builder le projet (`npm run build`)
   - Déployer les fichiers statiques

3. Une fois le déploiement terminé, vous obtiendrez une URL de production (ex: `https://event-link.vercel.app`)

## Déploiement via CLI Vercel

### Étape 1 : Installer Vercel CLI

```bash
npm i -g vercel
```

### Étape 2 : Se connecter

```bash
vercel login
```

### Étape 3 : Déployer

```bash
# Déploiement en preview
vercel

# Déploiement en production
vercel --prod
```

### Étape 4 : Configurer les variables d'environnement

```bash
# Ajouter une variable
vercel env add VITE_API_BASE_URL

# Lister les variables
vercel env ls

# Supprimer une variable
vercel env rm VITE_API_BASE_URL
```

## Configuration automatique

Le fichier `vercel.json` configure automatiquement :
- Le framework : Vite
- Le répertoire de build : `dist`
- Les rewrites pour le routing SPA (toutes les routes pointent vers `index.html`)

## Vérification post-déploiement

1. Vérifiez que l'application se charge correctement
2. Testez la connexion à l'API backend
3. Vérifiez que les routes fonctionnent (notamment les routes protégées `/dashboard/*`)
4. Testez l'upload d'images si Cloudinary est configuré

## Mises à jour

À chaque push sur la branche principale :
- Vercel déploie automatiquement une nouvelle version
- Les pull requests créent des preview deployments

## Support

Pour plus d'informations, consultez la [documentation Vercel](https://vercel.com/docs).





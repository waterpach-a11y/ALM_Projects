# 📧 Guide Pas à Pas : Configuration de l'envoi d'emails

Ce guide vous explique comment configurer SendGrid pour envoyer les rapports hebdomadaires par email.

---

## 📋 Prérequis

- Un compte Firebase actif
- Firebase CLI installé (`npm install -g firebase-tools`)
- Être connecté à Firebase (`firebase login`)

---

## Étape 1 : Créer un compte SendGrid

### 1.1 Aller sur SendGrid

1. Ouvrez votre navigateur et allez sur : **https://sendgrid.com**
2. Cliquez sur **"Start for free"** ou **"Sign Up"**

### 1.2 Créer le compte

1. Remplissez le formulaire :
   - **Email** : votre adresse email
   - **Password** : un mot de passe sécurisé
   - **First Name** et **Last Name**
   - Acceptez les conditions d'utilisation
2. Cliquez sur **"Create Account"**

### 1.3 Vérifier votre email

1. Vérifiez votre boîte email
2. Cliquez sur le lien de vérification envoyé par SendGrid
3. Complétez le formulaire de vérification (nom d'entreprise, etc.)

---

## Étape 2 : Vérifier un expéditeur (Sender)

### 2.1 Accéder à la section Sender Authentication

1. Dans SendGrid, allez dans le menu de gauche
2. Cliquez sur **"Settings"** (⚙️)
3. Cliquez sur **"Sender Authentication"**

### 2.2 Vérifier un Single Sender

1. Cliquez sur **"Verify a Single Sender"**
2. Remplissez le formulaire :
   - **From Email Address** : `noreply@votredomaine.com` (ou votre email)
   - **From Name** : `ALM Project Management`
   - **Reply To** : votre email personnel
   - **Company Address** : votre adresse
   - **City, State, Country, Zip Code**
3. Cliquez sur **"Create"**

### 2.3 Vérifier l'email

1. Vérifiez votre boîte email
2. Ouvrez l'email de SendGrid
3. Cliquez sur **"Verify Single Sender"**
4. ✅ L'expéditeur est maintenant vérifié

---

## Étape 3 : Créer une API Key

### 3.1 Accéder à la section API Keys

1. Dans SendGrid, allez dans **"Settings"** (⚙️)
2. Cliquez sur **"API Keys"**

### 3.2 Créer une nouvelle clé

1. Cliquez sur **"Create API Key"** (bouton en haut à droite)
2. Donnez un nom : **"ALM Project Reports"**
3. Sélectionnez les permissions :
   - **Option 1 (Recommandé)** : **"Full Access"** (pour simplifier)
   - **Option 2 (Sécurisé)** : **"Restricted Access"** puis cochez uniquement **"Mail Send"**
4. Cliquez sur **"Create & View"**

### 3.3 Copier la clé API

⚠️ **IMPORTANT** : La clé API ne sera affichée qu'une seule fois !

1. **Copiez immédiatement** la clé API (elle commence par `SG.`)
2. Collez-la dans un fichier texte temporaire pour ne pas la perdre
3. Exemple : `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Étape 4 : Configurer Firebase Functions

> ⚠️ **Note** : Firebase a déprécié `functions.config()` qui sera supprimé après le 31/12/2025.
> Le code supporte les deux méthodes (ancienne et nouvelle) pour une transition en douceur.

### 4.1 Ouvrir le terminal

1. Ouvrez PowerShell (Windows) ou Terminal (Mac/Linux)
2. Naviguez vers le dossier de votre projet :
   ```bash
   cd C:\Users\rtvcm\Desktop\Projets\Developpement_Projets\ALM_Projects
   ```

### 4.2 Vérifier la connexion Firebase

```bash
firebase login
```

Si vous n'êtes pas connecté, suivez les instructions à l'écran.

### 4.3 Méthode Recommandée : Utiliser le script automatique

Le plus simple est d'utiliser le script qui configure tout automatiquement :

```bash
cd functions
node scripts/set-env.js
```

Le script vous guidera étape par étape et configurera :
- ✅ Les secrets Firebase (nouvelle méthode)
- ✅ functions.config() (méthode legacy, pour compatibilité)
- ✅ Le fichier .env.local (pour le développement local)

### 4.4 Méthode Alternative : Configuration manuelle

#### Option A : Nouvelle méthode (Secrets Firebase - Recommandé)

```bash
# Configurer la clé API SendGrid
echo "SG.xxxxxxxxxxxxxxxx..." | firebase functions:secrets:set SENDGRID_API_KEY

# Configurer l'email expéditeur
echo "noreply@votredomaine.com" | firebase functions:secrets:set SENDGRID_FROM_EMAIL
```

#### Option B : Méthode legacy (functions.config() - Fonctionne jusqu'au 31/12/2025)

```bash
# Configurer la clé API SendGrid
firebase functions:config:set sendgrid.api_key="SG.xxxxxxxxxxxxxxxx..."

# Configurer l'email expéditeur
firebase functions:config:set sendgrid.from_email="noreply@votredomaine.com"

# Vérifier la configuration
firebase functions:config:get
```

### 4.5 Pour le développement local

Créez un fichier `functions/.env.local` :

```bash
cd functions
echo SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx... > .env.local
echo SENDGRID_FROM_EMAIL=noreply@votredomaine.com >> .env.local
```

> 💡 **Note** : Le code vérifie automatiquement les deux méthodes, vous pouvez utiliser celle qui vous convient !

---

## Étape 5 : Installer les dépendances et déployer

### 5.1 Installer les dépendances

```bash
cd functions
npm install
cd ..
```

### 5.2 Compiler TypeScript

```bash
cd functions
npm run build
cd ..
```

### 5.3 Déployer les fonctions

```bash
firebase deploy --only functions
```

⏳ Cette étape peut prendre 2-5 minutes.

Vous devriez voir :
```
✔  functions[sendWeeklyReports] Successful create operation.
✔  functions[sendWeeklyReportsManual] Successful create operation.
```

---

## Étape 6 : Tester l'envoi d'emails

### Option A : Test depuis Firebase CLI (Recommandé)

1. Ouvrez un nouveau terminal
2. Lancez le shell Firebase :
   ```bash
   firebase functions:shell
   ```
3. Appelez la fonction manuelle :
   ```javascript
   sendWeeklyReportsManual()
   ```
4. Appuyez sur Entrée
5. Vous devriez voir :
   ```javascript
   {
     success: true,
     totalRecipients: 2,
     results: [
       { email: 'user1@example.com', reportsCount: 1, success: true },
       { email: 'user2@example.com', reportsCount: 2, success: true }
     ]
   }
   ```
6. Vérifiez les boîtes email des destinataires !

### Option B : Test depuis l'application web

1. Ouvrez votre application dans le navigateur
2. Ouvrez la console développeur (F12)
3. Collez ce code :
   ```javascript
   import { getFunctions, httpsCallable } from 'firebase/functions';
   const functions = getFunctions();
   const sendReports = httpsCallable(functions, 'sendWeeklyReportsManual');
   sendReports().then(result => {
     console.log('✅ Rapports envoyés:', result.data);
   }).catch(error => {
     console.error('❌ Erreur:', error);
   });
   ```

---

## Étape 7 : Vérifier les logs

Pour voir les logs d'envoi d'emails :

```bash
firebase functions:log
```

Ou depuis la console Firebase :
1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. Allez dans **Functions** > **Logs**

---

## ✅ Vérification finale

### Checklist

- [ ] Compte SendGrid créé et vérifié
- [ ] Expéditeur vérifié dans SendGrid
- [ ] API Key créée et copiée
- [ ] Configuration Firebase effectuée (`firebase functions:config:set`)
- [ ] Dépendances installées (`npm install`)
- [ ] Fonctions déployées (`firebase deploy --only functions`)
- [ ] Test manuel réussi
- [ ] Emails reçus dans les boîtes de réception

---

## 🎯 Planification automatique

Les rapports sont automatiquement envoyés **chaque lundi à 9h00 (heure de Paris)**.

Pour modifier la planification :

1. Ouvrez `functions/src/reports.ts`
2. Trouvez la ligne 255 :
   ```typescript
   export const sendWeeklyReports = functions.pubsub
     .schedule('every monday 09:00')
     .timeZone('Europe/Paris')
   ```
3. Modifiez selon vos besoins :
   - `'every monday 09:00'` → `'every tuesday 10:00'` (mardi 10h)
   - `'Europe/Paris'` → `'America/New_York'` (fuseau horaire)
4. Redéployez : `firebase deploy --only functions`

---

## 🐛 Dépannage

### Problème : "SendGrid API key not configured"

**Solution** :
1. Vérifiez la configuration : `firebase functions:config:get`
2. Si vide, reconfigurez : `firebase functions:config:set sendgrid.api_key="VOTRE_CLE"`
3. Redéployez : `firebase deploy --only functions`

### Problème : "API key is invalid"

**Solution** :
1. Vérifiez que vous avez copié la clé complète (commence par `SG.`)
2. Vérifiez qu'il n'y a pas d'espaces avant/après
3. Recréez une nouvelle API Key dans SendGrid si nécessaire

### Problème : "The from address does not match a verified Sender Identity"

**Solution** :
1. Vérifiez que l'email expéditeur est bien vérifié dans SendGrid
2. Vérifiez la configuration : `firebase functions:config:get sendgrid.from_email`
3. Utilisez exactement le même email que celui vérifié dans SendGrid

### Problème : Les emails arrivent en spam

**Solution** :
1. Vérifiez que l'expéditeur est bien vérifié
2. Utilisez un domaine personnalisé si possible
3. Configurez SPF et DKIM dans SendGrid (Settings > Sender Authentication)

### Problème : "Rate limit exceeded"

**Solution** :
- Le plan gratuit de SendGrid limite à 100 emails/jour
- Attendez le lendemain ou passez à un plan payant

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `firebase functions:log`
2. Consultez la documentation SendGrid : https://docs.sendgrid.com
3. Vérifiez la console Firebase : https://console.firebase.google.com

---

## 🎉 Félicitations !

Votre système d'envoi d'emails est maintenant configuré ! Les rapports hebdomadaires seront automatiquement envoyés chaque lundi à 9h00.


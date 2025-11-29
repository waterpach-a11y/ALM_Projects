# 🚀 Déploiement et Test - Guide Complet

## ⚠️ Erreur "Page not found"

Cette erreur signifie que la fonction **n'a pas encore été déployée** en production.

---

## ✅ Solution : Déployer la Fonction

### Étape 1 : Sortir du Shell Firebase (si vous y êtes)

Appuyez sur **Ctrl+D** ou tapez `.exit`

### Étape 2 : Compiler le Code

Dans PowerShell normal :

```powershell
cd functions
npm run build
```

**Vérifiez qu'il n'y a pas d'erreurs de compilation.**

### Étape 3 : Déployer les Fonctions

```powershell
cd ..
firebase deploy --only functions
```

⏳ **Cela peut prendre 2-5 minutes.**

Vous devriez voir :
```
✔  functions[sendWeeklyReportsTest] Successful create operation.
✔  functions[sendWeeklyReportsManual] Successful create operation.
✔  functions[sendWeeklyReports] Successful create operation.
```

### Étape 4 : Obtenir l'URL de la Fonction

Après le déploiement, Firebase affichera les URLs. Vous pouvez aussi les trouver dans la console Firebase.

L'URL devrait être :
```
https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest
```

**Note** : Ajoutez `https://` au début de l'URL !

---

## 🧪 Tester la Fonction

### Option 1 : Via le Navigateur (Le Plus Simple)

Ouvrez cette URL dans votre navigateur :

```
https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest
```

**Important** : N'oubliez pas le `https://` au début !

### Option 2 : Via cURL (PowerShell)

```powershell
Invoke-WebRequest -Uri "https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest" -Method GET
```

### Option 3 : Via l'Application Web

1. Connectez-vous en tant qu'admin
2. Ouvrez la console (F12)
3. Collez ce code :

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const sendReports = httpsCallable(functions, 'sendWeeklyReportsManual');
sendReports().then(result => {
  console.log('✅ Succès:', result.data);
  alert('Rapports envoyés !');
}).catch(error => {
  console.error('❌ Erreur:', error);
});
```

---

## 🔍 Vérifier que la Fonction est Déployée

### Méthode 1 : Console Firebase

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet `almproject-30c6f`
3. Allez dans **Functions**
4. Vous devriez voir `sendWeeklyReportsTest` dans la liste

### Méthode 2 : Firebase CLI

```powershell
firebase functions:list
```

Vous devriez voir `sendWeeklyReportsTest` dans la liste.

---

## 📋 Checklist de Déploiement

- [ ] Sorti du shell Firebase (Ctrl+D)
- [ ] Code compilé (`npm run build` dans functions/)
- [ ] Aucune erreur de compilation
- [ ] Fonctions déployées (`firebase deploy --only functions`)
- [ ] Déploiement réussi (pas d'erreurs)
- [ ] URL testée avec `https://` au début
- [ ] Résultat JSON reçu ou email reçu

---

## ❌ Si le Déploiement Échoue

### Erreur de compilation

```powershell
cd functions
npm run build
```

Vérifiez les erreurs et corrigez-les.

### Erreur "SendGrid API key not configured"

Configurez d'abord la clé API :

```powershell
cd functions
node scripts/set-env.js
```

Puis redéployez.

### Erreur de permissions

Vérifiez que vous êtes connecté :

```powershell
firebase login
```

---

## 🎯 Résultat Attendu

Après le déploiement et le test, vous devriez :

1. ✅ Voir un JSON avec `success: true`
2. ✅ Recevoir un email dans `h_ouedraogo@outlook.fr`
3. ✅ L'email contient les métriques de vos projets

---

## 💡 Astuce : Tester en Local d'Abord

Avant de déployer en production, testez en local :

```powershell
firebase emulators:start --only functions
```

Puis ouvrez :
```
http://localhost:5001/almproject-30c6f/us-central1/sendWeeklyReportsTest
```

C'est plus rapide pour tester !


# 🧪 Test Simple - Envoi d'Emails

## ⚠️ Problème Résolu

L'erreur que vous avez vue était due à :
1. **Clé API mal formatée** : La clé doit commencer par `SG.`
2. **Authentification requise** : La fonction callable nécessite d'être admin

## ✅ Solution : Utiliser la Fonction de Test

Une nouvelle fonction `sendWeeklyReportsTest` a été créée qui **ne nécessite pas d'authentification** pour faciliter les tests.

---

## 🚀 Méthode 1 : Test depuis le Navigateur (Le Plus Simple)

### Étape 1 : Compiler et déployer

```powershell
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Étape 2 : Ouvrir dans le navigateur

Ouvrez cette URL dans votre navigateur :

```
http://localhost:5001/almproject-30c6f/us-central1/sendWeeklyReportsTest
```

**OU** si vous testez en production :

```
https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest
```

### Étape 3 : Vérifier le résultat

Vous devriez voir un JSON avec le résultat :
```json
{
  "success": true,
  "totalRecipients": 1,
  "results": [
    {
      "email": "h_ouedraogo@outlook.fr",
      "reportsCount": 1,
      "success": true
    }
  ]
}
```

### Étape 4 : Vérifier l'email

Ouvrez la boîte email `h_ouedraogo@outlook.fr` et cherchez l'email de rapport.

---

## 🚀 Méthode 2 : Test depuis Firebase Shell

### ⚠️ Important : Le Shell Firebase est un REPL JavaScript

Le shell Firebase (`firebase functions:shell`) est un **environnement JavaScript**, pas PowerShell. Vous ne pouvez pas y exécuter des commandes shell.

### Étape 1 : Sortir du shell (si vous y êtes)

Appuyez sur **Ctrl+D** ou tapez `.exit`

### Étape 2 : Compiler et déployer (dans PowerShell normal)

```powershell
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Étape 3 : Revenir dans le shell

```powershell
firebase functions:shell
```

### Étape 4 : Tester la fonction HTTP

Dans le shell, vous pouvez tester la fonction HTTP de test :

```javascript
// Note: Dans le shell, vous testez les fonctions, pas les commandes shell
// Pour tester la fonction HTTP, utilisez plutôt l'URL directement (Méthode 1)
```

**Recommandation** : Utilisez plutôt la **Méthode 1** (URL HTTP) qui est plus simple.

---

## 🚀 Méthode 3 : Test depuis l'Application Web

### Étape 1 : Se connecter en tant qu'admin

Connectez-vous à votre application avec un compte admin.

### Étape 2 : Ouvrir la console (F12)

Appuyez sur **F12** pour ouvrir les outils de développement.

### Étape 3 : Exécuter le code

Collez ce code dans la console :

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const sendReports = httpsCallable(functions, 'sendWeeklyReportsManual');
sendReports().then(result => {
  console.log('✅ Succès:', result.data);
  alert('Rapports envoyés ! Vérifiez vos emails.');
}).catch(error => {
  console.error('❌ Erreur:', error);
  alert('Erreur: ' + error.message);
});
```

---

## 🔧 Corriger la Clé API SendGrid

Si vous voyez l'erreur **"API key does not start with 'SG.'"** :

### Vérifier la configuration

```powershell
firebase functions:config:get
```

### Reconfigurer correctement

```powershell
cd functions
node scripts/set-env.js
```

**Important** : Quand on vous demande la clé API, collez-la **complète** et **sans espaces**, elle doit commencer par `SG.`

Exemple de clé valide :
```
SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
```

---

## 📋 Checklist de Test

- [ ] Clé API SendGrid configurée (commence par `SG.`)
- [ ] Email expéditeur vérifié dans SendGrid
- [ ] Fonctions compilées (`npm run build`)
- [ ] Fonctions déployées (`firebase deploy --only functions`)
- [ ] Au moins un projet dans Firestore avec un owner
- [ ] Le owner a un email valide dans la collection `users`
- [ ] Test exécuté (URL ou application web)
- [ ] Email reçu dans la boîte de réception

---

## 🎯 Résultat Attendu

Si tout fonctionne, vous devriez :
1. ✅ Voir `success: true` dans la réponse
2. ✅ Recevoir un email avec le sujet "📊 Weekly Project Report"
3. ✅ L'email contient les métriques de vos projets

---

## ❌ Si ça ne marche toujours pas

1. **Vérifiez les logs** :
   ```powershell
   firebase functions:log
   ```

2. **Vérifiez la clé API** :
   - Doit commencer par `SG.`
   - Doit être complète (environ 70 caractères)
   - Pas d'espaces avant/après

3. **Vérifiez l'email expéditeur** :
   - Doit être vérifié dans SendGrid
   - Doit correspondre exactement à celui configuré

4. **Vérifiez les projets** :
   - Au moins un projet doit exister
   - Le projet doit avoir un `owner` ou `ownerId`
   - L'utilisateur owner doit avoir un email dans `users`

---

## 💡 Astuce

Pour tester rapidement sans déployer, utilisez les emulators :

```powershell
firebase emulators:start --only functions
```

Puis ouvrez : `http://localhost:5001/almproject-30c6f/us-central1/sendWeeklyReportsTest`


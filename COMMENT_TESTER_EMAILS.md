# 🧪 Comment Tester l'Envoi d'Emails

Ce guide vous explique comment tester l'envoi des rapports hebdomadaires par email.

---

## ✅ Prérequis

Avant de tester, assurez-vous que :

- [ ] SendGrid est configuré (clé API et email expéditeur)
- [ ] Les fonctions sont déployées : `firebase deploy --only functions`
- [ ] Vous avez au moins un projet dans Firestore avec un owner (propriétaire)

---

## 🎯 Méthode 1 : Test depuis Firebase CLI (Recommandé)

### Étape 1 : Ouvrir le shell Firebase

```powershell
firebase functions:shell
```

### Étape 2 : Appeler la fonction manuelle

Dans le shell, tapez :

```javascript
sendWeeklyReportsManual()
```

Puis appuyez sur **Entrée**.

### Étape 3 : Vérifier le résultat

Vous devriez voir quelque chose comme :

```javascript
{
  success: true,
  totalRecipients: 2,
  results: [
    { 
      email: 'user1@example.com', 
      reportsCount: 1, 
      success: true 
    },
    { 
      email: 'user2@example.com', 
      reportsCount: 2, 
      success: true 
    }
  ]
}
```

### Étape 4 : Vérifier les emails

1. Ouvrez les boîtes email des destinataires
2. Cherchez un email avec le sujet : **"📊 Weekly Project Report - X Project(s)"**
3. Vérifiez que l'email contient les métriques des projets

---

## 🎯 Méthode 2 : Test depuis l'Application Web

### Étape 1 : Ouvrir la console du navigateur

1. Ouvrez votre application dans le navigateur
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**

### Étape 2 : Exécuter le code

Collez ce code dans la console :

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const sendReports = httpsCallable(functions, 'sendWeeklyReportsManual');
sendReports().then(result => {
  console.log('✅ Rapports envoyés:', result.data);
  alert('Rapports envoyés avec succès ! Vérifiez vos emails.');
}).catch(error => {
  console.error('❌ Erreur:', error);
  alert('Erreur: ' + error.message);
});
```

### Étape 3 : Vérifier les emails

Vérifiez les boîtes email des destinataires.

---

## 🎯 Méthode 3 : Test depuis Postman ou cURL

### Avec cURL

```bash
curl -X POST \
  https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsManual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_FIREBASE"
```

### Avec Postman

1. **Méthode** : POST
2. **URL** : `https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsManual`
3. **Headers** :
   - `Content-Type: application/json`
   - `Authorization: Bearer VOTRE_TOKEN_FIREBASE`
4. **Body** : (vide)

---

## 🎯 Méthode 4 : Test Automatique (Planifié)

Les rapports sont automatiquement envoyés **chaque lundi à 9h00 (heure de Paris)**.

Pour tester la planification :

1. Modifiez temporairement la planification dans `functions/src/reports.ts` :
   ```typescript
   export const sendWeeklyReports = functions.pubsub
     .schedule('every 1 minutes')  // Toutes les minutes pour tester
     .timeZone('Europe/Paris')
   ```

2. Redéployez :
   ```powershell
   firebase deploy --only functions
   ```

3. Attendez 1-2 minutes et vérifiez les emails

4. **Important** : Remettez la planification normale après le test :
   ```typescript
     .schedule('every monday 09:00')  // Retour à la normale
   ```

---

## 🔍 Vérifier les Logs

### Depuis Firebase CLI

```powershell
firebase functions:log
```

### Depuis la Console Firebase

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet
3. Allez dans **Functions** > **Logs**
4. Cherchez les logs de `sendWeeklyReports` ou `sendWeeklyReportsManual`

### Logs à vérifier

Vous devriez voir :
- ✅ `Email sent successfully to user@example.com`
- ✅ `Would send email to user@example.com` (si la clé API n'est pas configurée)

---

## 🐛 Dépannage

### Problème : "SendGrid API key not configured"

**Solution** :
1. Vérifiez la configuration : `firebase functions:config:get`
2. Si vide, reconfigurez :
   ```powershell
   cd functions
   node scripts/set-env.js
   ```
3. Redéployez : `firebase deploy --only functions`

### Problème : "The from address does not match a verified Sender Identity"

**Solution** :
1. Vérifiez que l'email expéditeur est vérifié dans SendGrid
2. Vérifiez la configuration : `firebase functions:config:get sendgrid.from_email`
3. Utilisez exactement le même email que celui vérifié dans SendGrid

### Problème : Aucun email reçu

**Vérifications** :
1. ✅ Vérifiez les logs : `firebase functions:log`
2. ✅ Vérifiez le dossier spam
3. ✅ Vérifiez que le projet a un owner avec un email valide
4. ✅ Vérifiez que SendGrid n'a pas atteint la limite (100 emails/jour en gratuit)

### Problème : "Rate limit exceeded"

**Solution** :
- Le plan gratuit de SendGrid limite à 100 emails/jour
- Attendez le lendemain ou passez à un plan payant

---

## 📊 Vérifier les Données

Pour vérifier que les données sont correctes :

### Vérifier les projets

```powershell
firebase firestore:get projects
```

### Vérifier les users

```powershell
firebase firestore:get users
```

### Vérifier qu'un projet a un owner

Dans Firestore, vérifiez que chaque projet a :
- Un champ `owner` ou `ownerId` avec un ID d'utilisateur
- Un utilisateur correspondant dans la collection `users` avec un email

---

## ✅ Checklist de Test

- [ ] SendGrid configuré (clé API + email expéditeur)
- [ ] Fonctions déployées
- [ ] Au moins un projet dans Firestore
- [ ] Le projet a un owner avec un email valide
- [ ] Test manuel exécuté (`sendWeeklyReportsManual()`)
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Email reçu dans la boîte de réception
- [ ] Email contient les métriques du projet
- [ ] Liens Code et Result fonctionnent (si configurés)

---

## 🎉 Test Réussi !

Si vous recevez l'email avec les métriques de vos projets, c'est que tout fonctionne ! 🎊

Les rapports seront automatiquement envoyés chaque lundi à 9h00.


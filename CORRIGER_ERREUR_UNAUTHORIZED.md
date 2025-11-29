# 🔧 Corriger l'Erreur "Unauthorized" de SendGrid

## ⚠️ Problème

Vous voyez `"success": false, "error": "Unauthorized"` pour tous les destinataires.

Cela signifie que **SendGrid rejette votre clé API**.

---

## ✅ Solutions

### Solution 1 : Vérifier la Clé API dans SendGrid

1. Allez sur https://sendgrid.com
2. Connectez-vous
3. Allez dans **Settings** > **API Keys**
4. Vérifiez que votre clé API existe et est **active**
5. Si elle n'existe plus ou est désactivée, **créez-en une nouvelle**

### Solution 2 : Vérifier les Permissions de la Clé API

1. Dans SendGrid, allez dans **Settings** > **API Keys**
2. Cliquez sur votre clé API
3. Vérifiez que les permissions incluent **"Mail Send"** ou **"Full Access"**
4. Si ce n'est pas le cas, modifiez les permissions ou créez une nouvelle clé avec les bonnes permissions

### Solution 3 : Reconfigurer la Clé API

```powershell
cd functions
node scripts/set-env.js
```

**Important** :
- Collez la clé API **complète** (environ 70 caractères)
- Elle doit commencer par `SG.`
- Pas d'espaces avant/après
- Utilisez la clé la plus récente de SendGrid

### Solution 4 : Vérifier la Configuration Actuelle

```powershell
firebase functions:config:get
```

Vérifiez que :
- `sendgrid.api_key` commence bien par `SG.`
- `sendgrid.from_email` correspond à un email vérifié dans SendGrid

### Solution 5 : Vérifier l'Email Expéditeur

1. Dans SendGrid, allez dans **Settings** > **Sender Authentication**
2. Vérifiez que l'email `h_ouedraogo@outlook.fr` (ou celui configuré) est **vérifié**
3. Si ce n'est pas le cas, vérifiez-le ou utilisez un autre email vérifié

---

## 🔍 Vérifier les Logs Détaillés

Pour voir les détails de l'erreur SendGrid :

```powershell
firebase functions:log --only sendWeeklyReportsTest
```

Cherchez les lignes avec :
- `SendGrid error details:`
- `SendGrid error status:`

---

## 🎯 Étapes de Correction Complètes

### 1. Créer une Nouvelle Clé API dans SendGrid

1. Allez sur https://sendgrid.com
2. **Settings** > **API Keys** > **Create API Key**
3. Nom : "ALM Project Reports"
4. Permissions : **Full Access** (ou au minimum **Mail Send**)
5. **Copiez la clé** (affichée une seule fois !)

### 2. Vérifier l'Email Expéditeur

1. **Settings** > **Sender Authentication** > **Verify a Single Sender**
2. Vérifiez que `h_ouedraogo@outlook.fr` est vérifié
3. Si non, vérifiez-le maintenant

### 3. Reconfigurer Firebase

```powershell
cd functions
node scripts/set-env.js
```

Collez la **nouvelle** clé API.

### 4. Redéployer

```powershell
cd ..
firebase deploy --only functions:sendWeeklyReportsTest
```

### 5. Tester à Nouveau

Ouvrez :
```
https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest
```

---

## 📋 Checklist

- [ ] Clé API SendGrid créée et active
- [ ] Clé API a les permissions "Mail Send" ou "Full Access"
- [ ] Clé API commence par `SG.` et fait ~70 caractères
- [ ] Email expéditeur vérifié dans SendGrid
- [ ] Configuration Firebase mise à jour (`firebase functions:config:get`)
- [ ] Fonction redéployée
- [ ] Test effectué et emails reçus

---

## 💡 Astuce

Si vous continuez à avoir des erreurs "Unauthorized", essayez de :
1. **Créer une nouvelle clé API** dans SendGrid (parfois les anciennes clés peuvent être corrompues)
2. **Attendre quelques minutes** après la création de la clé (parfois il y a un délai de propagation)
3. **Vérifier que vous n'avez pas dépassé la limite** de 100 emails/jour (plan gratuit)

---

Une fois la clé API corrigée, les emails devraient être envoyés avec succès ! 🎉


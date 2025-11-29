# 🔧 Forcer le Déploiement de sendWeeklyReportsTest

## ⚠️ Problème

La fonction `sendWeeklyReportsTest` n'apparaît pas dans le déploiement car Firebase l'a "skipped" (ignorée).

## ✅ Solution : Forcer le Déploiement

### Option 1 : Déployer une fonction spécifique

```powershell
firebase deploy --only functions:sendWeeklyReportsTest
```

### Option 2 : Forcer le déploiement de toutes les fonctions

```powershell
firebase deploy --only functions --force
```

### Option 3 : Modifier légèrement le code pour forcer le déploiement

Ajoutez un commentaire dans `functions/src/reports.ts` ligne 372, puis :

```powershell
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

## 🔑 Corriger la Clé API SendGrid

L'avertissement "API key does not start with 'SG.'" signifie que votre clé API n'est pas correctement formatée.

### Vérifier la configuration actuelle

```powershell
firebase functions:config:get
```

### Reconfigurer avec la bonne clé

```powershell
cd functions
node scripts/set-env.js
```

**Important** : Quand on vous demande la clé API, collez-la **complète** et **sans espaces**. Elle doit :
- Commencer par `SG.`
- Faire environ 70 caractères
- Ne pas avoir d'espaces avant/après

Exemple de clé valide :
```
SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdefghijklmnop
```

### Vérifier après configuration

```powershell
firebase functions:config:get
```

Vous devriez voir :
```json
{
  "sendgrid": {
    "api_key": "SG.xxxxxxxxxxxxxxxx...",
    "from_email": "h_ouedraogo@outlook.fr"
  }
}
```

---

## 🚀 Déploiement Complet

Une fois la clé API corrigée :

```powershell
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Cette fois, `sendWeeklyReportsTest` devrait apparaître dans la liste.

---

## 🧪 Tester Après Déploiement

Une fois déployé, testez avec :

```
https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest
```

**N'oubliez pas le `https://` au début !**


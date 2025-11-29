# ⚡ Instructions Rapides - Test Email

## 🚨 Vous êtes dans le Shell Firebase ?

**Sortez d'abord** : Appuyez sur **Ctrl+D** ou tapez `.exit`

---

## ✅ Étapes Rapides (Dans PowerShell Normal)

### 1. Compiler le code

```powershell
cd functions
npm run build
cd ..
```

### 2. Déployer les fonctions

```powershell
firebase deploy --only functions
```

### 3. Tester (2 options)

#### Option A : Via URL (Le Plus Simple) ⭐

Ouvrez dans votre navigateur :
```
http://localhost:5001/almproject-30c6f/us-central1/sendWeeklyReportsTest
```

**OU** si vous testez en production :
```
https://us-central1-almproject-30c6f.cloudfunctions.net/sendWeeklyReportsTest
```

#### Option B : Via Shell Firebase

```powershell
firebase functions:shell
```

Puis dans le shell, vous pouvez tester d'autres fonctions, mais pour `sendWeeklyReportsTest`, utilisez l'URL (Option A).

---

## 🔧 Si la Clé API n'est pas Configurée

```powershell
cd functions
node scripts/set-env.js
```

Collez votre clé API SendGrid (doit commencer par `SG.`)

---

## ✅ Résultat Attendu

1. Vous voyez un JSON avec `success: true`
2. Vous recevez un email dans `h_ouedraogo@outlook.fr`
3. L'email contient les métriques de vos projets

---

## ❌ Si ça ne marche pas

1. **Vérifiez les logs** :
   ```powershell
   firebase functions:log
   ```

2. **Vérifiez la configuration** :
   ```powershell
   firebase functions:config:get
   ```

3. **Vérifiez que la clé API commence par `SG.`**

---

C'est tout ! 🎉


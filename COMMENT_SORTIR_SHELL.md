# 🚪 Comment Sortir du Shell Firebase

## ⚠️ Vous êtes dans le Shell Firebase (REPL JavaScript)

Le shell Firebase (`firebase functions:shell`) est un **environnement JavaScript**, pas un shell PowerShell. Vous ne pouvez pas y exécuter des commandes shell comme `cd`, `npm`, etc.

---

## ✅ Solution : Sortir du Shell

### Méthode 1 : Ctrl+D (Recommandé)

Appuyez simplement sur **Ctrl+D**

### Méthode 2 : .exit

Tapez :
```
.exit
```

Puis appuyez sur **Entrée**

### Méthode 3 : Ctrl+C deux fois

Appuyez sur **Ctrl+C** deux fois rapidement

---

## 🔄 Ensuite : Exécuter les Commandes dans PowerShell

Une fois sorti du shell Firebase, vous êtes de retour dans PowerShell normal.

### Compiler le code

```powershell
cd functions
npm run build
cd ..
```

### Déployer

```powershell
firebase deploy --only functions
```

### Revenir dans le shell pour tester

```powershell
firebase functions:shell
```

Puis dans le shell, vous pouvez tester avec :
```javascript
sendWeeklyReportsTest()
```

---

## 📝 Résumé

1. **Sortir du shell** : `Ctrl+D` ou `.exit`
2. **Compiler** : `cd functions` → `npm run build` → `cd ..`
3. **Déployer** : `firebase deploy --only functions`
4. **Tester** : Ouvrir l'URL HTTP ou revenir dans le shell

---

## 🎯 Alternative : Tester sans Shell

Au lieu d'utiliser le shell, testez directement via l'URL HTTP :

```
http://localhost:5001/almproject-30c6f/us-central1/sendWeeklyReportsTest
```

C'est plus simple et ne nécessite pas de shell !


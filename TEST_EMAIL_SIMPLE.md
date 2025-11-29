# ⚡ Test Rapide - Envoi d'Emails

## 🚀 Méthode la Plus Simple (2 minutes)

### 1. Ouvrir le shell Firebase

```powershell
firebase functions:shell
```

### 2. Taper la commande

```javascript
sendWeeklyReportsManual()
```

Appuyez sur **Entrée**.

### 3. Vérifier le résultat

Vous devriez voir :
```javascript
{ success: true, totalRecipients: X, results: [...] }
```

### 4. Vérifier vos emails

Ouvrez la boîte email du propriétaire du projet et cherchez :
- **Sujet** : "📊 Weekly Project Report - X Project(s)"
- **Expéditeur** : L'email que vous avez configuré dans SendGrid

---

## ✅ C'est tout !

Si vous voyez `success: true` et que vous recevez l'email, **ça fonctionne !** 🎉

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

3. **Vérifiez que SendGrid est configuré** :
   - Clé API présente
   - Email expéditeur vérifié dans SendGrid

---

Pour plus de détails, consultez **`COMMENT_TESTER_EMAILS.md`**


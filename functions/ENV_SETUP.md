# 🔄 Migration vers les Variables d'Environnement

Firebase a déprécié `functions.config()` qui sera supprimé après le **31 décembre 2025**.

## ✅ Solution : Utiliser les Variables d'Environnement

Le code a été mis à jour pour supporter **les deux méthodes** :
- ✅ **Nouveau** : `process.env.SENDGRID_API_KEY` (recommandé)
- ⚠️ **Legacy** : `functions.config().sendgrid.api_key` (fonctionne jusqu'au 31/12/2025)

---

## 🚀 Configuration Rapide (Nouvelle Méthode)

### Option 1 : Utiliser le script automatique

```bash
cd functions
node scripts/set-env.js
```

### Option 2 : Configuration manuelle avec Firebase Secrets

```bash
# Configurer les secrets Firebase (recommandé)
echo "VOTRE_CLE_API" | firebase functions:secrets:set SENDGRID_API_KEY
echo "noreply@votredomaine.com" | firebase functions:secrets:set SENDGRID_FROM_EMAIL

# Déployer avec les secrets
firebase deploy --only functions
```

### Option 3 : Utiliser functions.config() (temporaire)

Si vous avez déjà configuré avec `functions.config()`, cela fonctionne encore jusqu'au 31/12/2025 :

```bash
firebase functions:config:set sendgrid.api_key="VOTRE_CLE"
firebase functions:config:set sendgrid.from_email="noreply@votredomaine.com"
firebase deploy --only functions
```

---

## 📝 Pour le Développement Local

Créez un fichier `functions/.env.local` :

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx...
SENDGRID_FROM_EMAIL=noreply@votredomaine.com
```

Ce fichier sera automatiquement utilisé par les emulators Firebase.

---

## 🔍 Vérification

Le code vérifie automatiquement dans cet ordre :
1. `process.env.SENDGRID_API_KEY` (nouveau)
2. `functions.config().sendgrid.api_key` (legacy)

Vous pouvez utiliser l'une ou l'autre méthode, ou les deux en même temps !

---

## ⚠️ Important

- Les fichiers `.env` sont déjà dans `.gitignore` (ne seront pas commités)
- Ne partagez jamais vos clés API publiquement
- Utilisez les secrets Firebase pour la production


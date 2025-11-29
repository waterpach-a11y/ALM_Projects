# ⚡ Configuration Rapide - SendGrid

## 🎯 Méthode la Plus Simple (Recommandée)

```bash
cd functions
node scripts/set-env.js
```

Le script vous demande :
1. Votre clé API SendGrid
2. Votre email expéditeur

Et configure automatiquement tout ce qu'il faut !

---

## 📋 Ce que fait le script

✅ Configure les secrets Firebase (nouvelle méthode)  
✅ Configure functions.config() (méthode legacy, pour compatibilité)  
✅ Crée le fichier .env.local (pour le développement local)

---

## 🚀 Après la configuration

```bash
# Déployer les fonctions
firebase deploy --only functions

# Tester
firebase functions:shell
# Puis tapez : sendWeeklyReportsManual()
```

---

## ⚠️ Problème avec la clé API vide ?

Si vous voyez `firebase functions:config:set sendgrid.api_key=` sans valeur :

1. Relancez le script : `node scripts/set-env.js`
2. Ou configurez manuellement :
   ```bash
   firebase functions:config:set sendgrid.api_key="VOTRE_CLE_COMPLETE"
   ```

---

## 📚 Documentation Complète

- Guide détaillé : `GUIDE_CONFIGURATION_EMAIL.md` (à la racine)
- Migration : `ENV_SETUP.md`
- Setup technique : `EMAIL_SETUP.md`


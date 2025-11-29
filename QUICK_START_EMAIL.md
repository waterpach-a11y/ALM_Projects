# 🚀 Démarrage Rapide : Configuration Email (5 minutes)

## ⚡ Résumé Express

```bash
# 1. Créer compte SendGrid → https://sendgrid.com
# 2. Vérifier expéditeur → Settings > Sender Authentication
# 3. Créer API Key → Settings > API Keys
# 4. Configurer Firebase :
firebase functions:config:set sendgrid.api_key="VOTRE_CLE_API"
firebase functions:config:set sendgrid.from_email="noreply@votredomaine.com"
# 5. Déployer :
cd functions && npm install && npm run build && cd ..
firebase deploy --only functions
# 6. Tester :
firebase functions:shell
# Puis dans le shell : sendWeeklyReportsManual()
```

---

## 📝 Étapes Détaillées

### 1️⃣ SendGrid (2 minutes)

1. **Créer compte** : https://sendgrid.com → Sign Up
2. **Vérifier expéditeur** :
   - Settings → Sender Authentication → Verify a Single Sender
   - Remplir le formulaire et vérifier l'email
3. **Créer API Key** :
   - Settings → API Keys → Create API Key
   - Nom : "ALM Reports"
   - Permissions : Full Access
   - **COPIER LA CLÉ** (affichée une seule fois !)

### 2️⃣ Firebase (1 minute)

```bash
# Configurer la clé API
firebase functions:config:set sendgrid.api_key="SG.xxxxxxxxxxxxxxxx..."

# Configurer l'email expéditeur
firebase functions:config:set sendgrid.from_email="noreply@votredomaine.com"

# Vérifier
firebase functions:config:get
```

### 3️⃣ Déployer (2 minutes)

```bash
# Installer les dépendances
cd functions
npm install

# Compiler
npm run build

# Revenir à la racine
cd ..

# Déployer
firebase deploy --only functions
```

### 4️⃣ Tester (30 secondes)

```bash
# Option 1 : Firebase Shell
firebase functions:shell
sendWeeklyReportsManual()

# Option 2 : Console navigateur (F12)
# Voir GUIDE_CONFIGURATION_EMAIL.md pour le code
```

---

## ✅ Checklist

- [ ] Compte SendGrid créé
- [ ] Expéditeur vérifié
- [ ] API Key créée et copiée
- [ ] Firebase configuré (`firebase functions:config:set`)
- [ ] Fonctions déployées (`firebase deploy --only functions`)
- [ ] Test réussi

---

## 📚 Documentation Complète

Pour plus de détails, consultez **`GUIDE_CONFIGURATION_EMAIL.md`**


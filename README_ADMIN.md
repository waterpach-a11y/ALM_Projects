# 🔐 Comment Attribuer le Rôle Admin

## 🚀 Méthode Rapide : Via Firebase Console (Recommandé)

### Étapes :

1. **Allez sur [Firebase Console](https://console.firebase.google.com/)**
2. **Sélectionnez votre projet** (`almproject-30c6f`)
3. **Allez dans Authentication** > **Users**
4. **Trouvez votre utilisateur** dans la liste (votre email)
5. **Cliquez sur les 3 points (⋮)** à droite de votre utilisateur
6. **Sélectionnez "Edit user"** ou **"Modifier l'utilisateur"**
7. **Faites défiler jusqu'à "Custom Claims"**
8. **Cliquez sur "Add custom claim"**
9. **Ajoutez :**
   - **Claim name:** `roles`
   - **Claim value:** `["admin"]` (avec les crochets et guillemets)
10. **Cliquez sur "Save"**

### ⚠️ Important :
- **Déconnectez-vous** de l'application
- **Reconnectez-vous** pour que le nouveau token soit chargé
- Vous devriez maintenant voir les boutons "Create User" et "Invite User"

---

## 🛠️ Méthode Alternative : Via Script Node.js

### Prérequis :

1. **Télécharger la clé de service account :**
   - Allez dans Firebase Console > **Project Settings** > **Service Accounts**
   - Cliquez sur **"Generate New Private Key"**
   - Téléchargez le fichier JSON
   - Renommez-le en `serviceAccountKey.json`
   - Placez-le dans le dossier `functions/`

2. **Installer les dépendances :**
   ```bash
   cd functions
   npm install firebase-admin
   ```

3. **Exécuter le script :**
   ```bash
   node scripts/setAdmin.js votre-email@example.com
   ```

### Exemple :
```bash
node scripts/setAdmin.js admin@example.com
```

---

## 📱 Méthode via l'Interface (Si vous avez déjà un admin)

Si quelqu'un a déjà le rôle admin :

1. L'admin va sur la page **"Users & Roles"**
2. Trouve votre email dans la liste
3. Clique sur **"Make Admin"** à côté de votre email
4. Confirme l'action
5. **Déconnectez-vous et reconnectez-vous**

---

## ✅ Vérifier que ça fonctionne

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** avec votre compte
3. Allez sur la page **"Users & Roles"**
4. Vous devriez voir :
   - Les boutons **"Create User"** et **"Invite User"** en haut à droite
   - Un badge **"admin"** rouge à côté de votre email
   - La possibilité de modifier les rôles des autres utilisateurs

---

## 🔍 Dépannage

### Je ne vois toujours pas les boutons après avoir ajouté le rôle admin

1. **Vérifiez que vous êtes bien déconnecté et reconnecté**
2. **Videz le cache du navigateur** (Ctrl+Shift+Delete)
3. **Vérifiez dans la console du navigateur** (F12) s'il y a des erreurs
4. **Vérifiez dans Firebase Console** que le Custom Claim est bien présent :
   - Authentication > Users > Votre utilisateur > Custom Claims
   - Devrait afficher : `{ "roles": ["admin"] }`

### Erreur "Permission denied" lors de la création d'utilisateur

- Vérifiez que votre token contient bien le rôle admin
- Ouvrez la console du navigateur (F12)
- Exécutez : `firebase.auth().currentUser.getIdTokenResult().then(r => console.log(r.claims))`
- Vous devriez voir `roles: ["admin"]`

---

## 📝 Note Technique

Les Custom Claims sont stockés dans le **token JWT** de Firebase Auth. Ce token est mis en cache par le navigateur. C'est pourquoi il est **essentiel de se déconnecter et se reconnecter** après avoir modifié les rôles.


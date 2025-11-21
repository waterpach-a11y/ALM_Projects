# Configuration du Rôle Admin

## Méthode 1 : Via Firebase Console (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Users**
4. Trouvez votre utilisateur dans la liste
5. Cliquez sur les **3 points** à droite de l'utilisateur
6. Sélectionnez **"Edit user"** ou **"Modifier l'utilisateur"**
7. Dans les **Custom Claims**, ajoutez :
   ```json
   {
     "roles": ["admin"]
   }
   ```
8. Sauvegardez

## Méthode 2 : Via Firebase Functions (Code)

Si vous avez déjà un admin, il peut vous donner le rôle via l'interface :
1. L'admin va sur la page "Users & Roles"
2. Clique sur "Make Admin" à côté de votre email
3. Confirme l'action

## Méthode 3 : Via Firebase CLI

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter
firebase login

# Utiliser le script Node.js suivant
node scripts/setAdmin.js <USER_EMAIL>
```

Créez un fichier `scripts/setAdmin.js` :
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

admin.auth().getUserByEmail(email)
  .then(user => {
    return admin.auth().setCustomUserClaims(user.uid, { roles: ['admin'] });
  })
  .then(() => {
    console.log(`User ${email} is now admin`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
```

## Méthode 4 : Via Firebase Admin SDK (Script temporaire)

Créez un fichier `scripts/setAdmin.js` dans la racine du projet :

```javascript
const admin = require('firebase-admin');

// Initialiser avec votre service account
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { roles: ['admin'] });
    
    // Mettre à jour aussi dans Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      roles: ['admin']
    }, { merge: true });
    
    console.log(`✅ ${email} is now admin!`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Utilisation: node scripts/setAdmin.js user@example.com
const email = process.argv[2];
if (email) {
  setAdmin(email);
} else {
  console.log('Usage: node scripts/setAdmin.js <email>');
}
```

## Vérifier que le rôle est bien attribué

1. Déconnectez-vous et reconnectez-vous (important pour rafraîchir le token)
2. Allez sur la page "Users & Roles"
3. Vous devriez voir les boutons "Create User" et "Invite User"
4. Votre email devrait avoir un badge "admin" rouge

## Important

- Après avoir modifié les rôles, **déconnectez-vous et reconnectez-vous** pour que les changements prennent effet
- Les Custom Claims sont dans le token JWT, qui est mis en cache. Une nouvelle connexion est nécessaire.


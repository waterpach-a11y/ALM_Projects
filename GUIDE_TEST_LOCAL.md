# 🧪 Guide pour Tester l'Application en Local

Ce guide vous explique comment tester l'application ALM en local sur votre machine.

## 📋 Prérequis

- Node.js installé (version 18 ou supérieure)
- npm installé
- Firebase CLI installé (`npm install -g firebase-tools`)
- Compte Firebase configuré

## 🚀 Démarrage Rapide

### Option 1 : Application Frontend Seule (Recommandé pour débuter)

Cette option démarre uniquement l'interface web qui se connecte à Firebase en production.

1. **Installer les dépendances** (si pas déjà fait) :
   ```powershell
   cd web
   npm install
   ```

2. **Démarrer le serveur de développement** :
   ```powershell
   npm run dev
   ```

3. **Ouvrir l'application** :
   - L'application sera disponible sur : **http://localhost:5173**
   - Ouvrez cette URL dans votre navigateur

4. **Se connecter** :
   - Utilisez vos identifiants Firebase pour vous connecter
   - L'application se connectera directement à votre projet Firebase en production

### Option 2 : Application Complète avec Emulators Firebase (Avancé)

Cette option démarre l'application avec des emulators Firebase locaux pour tester sans affecter la production.

#### Étape 1 : Démarrer les Emulators Firebase

```powershell
# Depuis la racine du projet
firebase emulators:start --only functions,firestore,auth,storage
```

Les emulators seront disponibles sur :
- **Functions** : http://localhost:5001
- **Firestore** : http://localhost:8080
- **Auth** : http://localhost:9099
- **Storage** : http://localhost:9199
- **UI Emulator** : http://localhost:4000

#### Étape 2 : Configurer Firebase pour utiliser les Emulators

Modifiez `web/src/firebase.ts` pour utiliser les emulators :

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  // ... votre config
};

export const app = initializeApp(firebaseConfig);

// Connecter aux emulators en développement
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
```

#### Étape 3 : Démarrer l'Application Frontend

Dans un **nouveau terminal** :

```powershell
cd web
npm run dev
```

## 🔍 Vérification

### Vérifier que le serveur fonctionne

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Vous devriez voir la page de connexion
3. Vérifiez la console du navigateur (F12) pour les erreurs

### Vérifier les logs

- **Frontend** : Les logs apparaissent dans le terminal où vous avez lancé `npm run dev`
- **Emulators** : Les logs apparaissent dans le terminal où vous avez lancé `firebase emulators:start`

## 🛠️ Commandes Utiles

### Arrêter le serveur

Dans le terminal où le serveur tourne, appuyez sur **Ctrl+C**

### Rebuild l'application

```powershell
cd web
npm run build
```

Cela créera une version optimisée dans `web/dist/`

### Nettoyer et réinstaller

```powershell
cd web
Remove-Item -Recurse -Force node_modules
npm install
```

## 🐛 Dépannage

### Erreur "Port already in use"

Si le port 5173 est déjà utilisé :

1. Arrêtez l'autre application qui utilise ce port
2. Ou modifiez le port dans `web/vite.config.ts` :
   ```typescript
   server: {
     port: 3000  // Changez le port
   }
   ```

### Erreur de connexion Firebase

- Vérifiez que votre configuration Firebase dans `web/src/firebase.ts` est correcte
- Vérifiez que vous êtes connecté à Firebase : `firebase login`
- Vérifiez que votre projet Firebase est actif

### Erreur "Module not found"

Réinstallez les dépendances :

```powershell
cd web
npm install
```

### Les changements ne s'appliquent pas

1. Arrêtez le serveur (Ctrl+C)
2. Videz le cache du navigateur (Ctrl+Shift+R)
3. Redémarrez le serveur

## 📝 Notes Importantes

- **Mode Développement** : L'application en local utilise le mode développement de Vite avec hot-reload
- **Données** : En mode production (Option 1), vous travaillez avec vos vraies données Firebase
- **Sécurité** : Les emulators Firebase sont uniquement pour le développement local
- **Performance** : Le mode développement est plus lent que la production mais permet le hot-reload

## 🎯 Prochaines Étapes

Une fois l'application démarrée :

1. ✅ Testez la connexion
2. ✅ Testez la création de projet
3. ✅ Testez le clonage de projet (vérifiez que les statuts sont réinitialisés)
4. ✅ Testez les fonctionnalités principales

## 💡 Astuce

Pour tester rapidement sans affecter la production, utilisez l'**Option 2** avec les emulators Firebase. Cela vous permet de tester toutes les fonctionnalités sans risque.


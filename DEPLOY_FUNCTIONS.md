# 🚀 Déployer les Firebase Functions

L'erreur "FirebaseError: internal" signifie que les fonctions Firebase ne sont pas déployées.

## Étapes pour déployer les fonctions

1. **Ouvrir un terminal** dans le dossier du projet

2. **Aller dans le dossier functions :**
   ```bash
   cd functions
   ```

3. **Compiler les fonctions :**
   ```bash
   npm run build
   ```

4. **Déployer les fonctions :**
   ```bash
   npm run deploy
   ```
   ou
   ```bash
   firebase deploy --only functions
   ```

5. **Attendre que le déploiement se termine** (peut prendre 2-5 minutes)

6. **Vérifier dans Firebase Console :**
   - Allez sur [Firebase Console](https://console.firebase.google.com/)
   - Sélectionnez votre projet
   - Allez dans **Functions**
   - Vous devriez voir les fonctions `createUser` et `inviteUser` listées

## ⚠️ Important

- Les fonctions doivent être déployées **une fois** après chaque modification du code
- Après le déploiement, les fonctions seront disponibles pour tous les utilisateurs
- Le déploiement peut prendre quelques minutes

## 🔍 Vérifier que les fonctions sont déployées

Dans la console du navigateur (F12), vous pouvez tester :
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const test = httpsCallable(functions, 'createUser');
console.log(test); // Devrait afficher la fonction, pas undefined
```

## 📝 Note

Si vous utilisez Firebase Emulators en local, vous n'avez pas besoin de déployer. Mais pour la production, vous devez déployer les fonctions.


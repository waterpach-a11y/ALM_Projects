# Configuration de l'envoi d'emails avec SendGrid

> 📖 **Pour un guide détaillé pas à pas, consultez `GUIDE_CONFIGURATION_EMAIL.md` à la racine du projet.**

Ce guide explique comment configurer SendGrid pour envoyer les rapports hebdomadaires par email.

## Étape 1 : Créer un compte SendGrid

1. Allez sur [https://sendgrid.com](https://sendgrid.com)
2. Créez un compte gratuit (100 emails/jour gratuits)
3. Vérifiez votre email et complétez la configuration

## Étape 2 : Créer une API Key

1. Connectez-vous à votre compte SendGrid
2. Allez dans **Settings** > **API Keys**
3. Cliquez sur **Create API Key**
4. Donnez un nom (ex: "ALM Project Reports")
5. Sélectionnez **Full Access** ou **Restricted Access** avec les permissions Mail Send
6. Copiez la clé API (vous ne pourrez plus la voir après)

## Étape 3 : Vérifier un expéditeur (Sender)

1. Allez dans **Settings** > **Sender Authentication**
2. Cliquez sur **Verify a Single Sender**
3. Remplissez le formulaire avec :
   - Email : l'adresse qui enverra les emails (ex: noreply@votredomaine.com)
   - Nom : nom d'affichage
   - Adresse, ville, pays, etc.
4. Vérifiez l'email en cliquant sur le lien dans l'email de confirmation

## Étape 4 : Configurer les variables d'environnement Firebase

Exécutez les commandes suivantes pour configurer SendGrid dans Firebase Functions :

```bash
# Configurer la clé API SendGrid
firebase functions:config:set sendgrid.api_key="VOTRE_CLE_API_SENDGRID"

# Configurer l'email expéditeur (optionnel, par défaut: noreply@almproject.com)
firebase functions:config:set sendgrid.from_email="noreply@votredomaine.com"

# Vérifier la configuration
firebase functions:config:get
```

## Étape 5 : Déployer les fonctions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Test manuel

Pour tester l'envoi d'emails manuellement :

1. Dans l'application, allez sur la page "Users & Roles" (réservée aux admins)
2. Utilisez la console du navigateur pour appeler la fonction :
   ```javascript
   const functions = getFunctions();
   const sendReports = httpsCallable(functions, 'sendWeeklyReportsManual');
   sendReports().then(result => console.log(result));
   ```

Ou utilisez Firebase CLI :
```bash
firebase functions:shell
# Puis dans le shell :
sendWeeklyReportsManual()
```

## Planification automatique

Les rapports sont automatiquement envoyés chaque lundi à 9h00 (heure de Paris).

Pour modifier la planification, éditez `functions/src/reports.ts` :
```typescript
export const sendWeeklyReports = functions.pubsub
  .schedule('every monday 09:00')  // Modifier ici
  .timeZone('Europe/Paris')          // Modifier le fuseau horaire
  .onRun(async (context) => {
    // ...
  });
```

## Format des emails

Les emails sont envoyés en HTML avec :
- Un en-tête avec gradient
- Une section par projet avec toutes les métriques
- Des liens vers le code et le résultat si disponibles
- Un design responsive et moderne

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez que la clé API est correctement configurée :
   ```bash
   firebase functions:config:get
   ```

2. Vérifiez les logs Firebase :
   ```bash
   firebase functions:log
   ```

3. Vérifiez que l'expéditeur est vérifié dans SendGrid

4. Vérifiez que vous n'avez pas dépassé la limite de 100 emails/jour (plan gratuit)

### Erreur "API key is invalid"

- Vérifiez que vous avez copié la clé API complète
- Vérifiez que la clé API a les permissions "Mail Send"
- Recréez une nouvelle clé API si nécessaire

### Les emails arrivent en spam

- Vérifiez que l'expéditeur est bien vérifié dans SendGrid
- Utilisez un domaine personnalisé si possible
- Configurez SPF et DKIM dans SendGrid

## Alternatives à SendGrid

Si vous préférez utiliser un autre service :

1. **Mailgun** : Remplacez `@sendgrid/mail` par `mailgun-js`
2. **AWS SES** : Utilisez `aws-sdk`
3. **Nodemailer** : Solution générique avec SMTP

Modifiez la fonction `sendEmail()` dans `functions/src/reports.ts` en conséquence.


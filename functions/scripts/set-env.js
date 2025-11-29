/**
 * Script pour configurer les variables d'environnement Firebase Functions
 * Utilise la nouvelle méthode recommandée (secrets) au lieu de functions.config()
 * 
 * Usage: node scripts/set-env.js
 * 
 * Ce script configure les secrets Firebase qui seront utilisés comme variables d'environnement
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('📧 Configuration de SendGrid pour les rapports hebdomadaires');
  console.log('');
  console.log('⚠️  IMPORTANT: Firebase recommande maintenant d\'utiliser des secrets');
  console.log('   au lieu de functions.config() (déprécié après le 31 décembre 2025)');
  console.log('');

  // Vérifier si Firebase CLI est installé
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Firebase CLI n\'est pas installé.');
    console.log('   Installez-le avec: npm install -g firebase-tools');
    process.exit(1);
  }

  // Demander la clé API SendGrid
  console.log('1. Créez une API Key dans SendGrid:');
  console.log('   - Allez sur https://sendgrid.com');
  console.log('   - Settings > API Keys > Create API Key');
  console.log('   - Donnez un nom et sélectionnez \'Full Access\' ou \'Restricted Access\' avec Mail Send');
  console.log('');
  const sendgridApiKey = await question('Entrez votre clé API SendGrid: ');

  if (!sendgridApiKey || sendgridApiKey.trim() === '') {
    console.error('❌ La clé API ne peut pas être vide');
    process.exit(1);
  }

  // Demander l'email expéditeur
  console.log('');
  console.log('2. Vérifiez un expéditeur dans SendGrid:');
  console.log('   - Settings > Sender Authentication > Verify a Single Sender');
  console.log('');
  let fromEmail = await question('Entrez l\'email expéditeur (ex: noreply@votredomaine.com): ');

  if (!fromEmail || fromEmail.trim() === '') {
    fromEmail = 'noreply@almproject.com';
    console.log(`   Utilisation de l'email par défaut: ${fromEmail}`);
  }

  console.log('');
  console.log('🔧 Configuration des secrets Firebase...');
  console.log('');

  try {
    // Méthode 1: Utiliser les secrets Firebase (recommandé)
    console.log('📝 Méthode recommandée: Secrets Firebase');
    console.log('   Configuration des secrets...');
    
    // Créer les secrets
    try {
      execSync(`echo "${sendgridApiKey.trim()}" | firebase functions:secrets:set SENDGRID_API_KEY`, { stdio: 'inherit' });
      console.log('✅ Secret SENDGRID_API_KEY configuré');
    } catch (error) {
      console.log('⚠️  Note: Les secrets Firebase nécessitent Firebase CLI v12+');
      console.log('   Utilisation de la méthode alternative...');
    }

    try {
      execSync(`echo "${fromEmail.trim()}" | firebase functions:secrets:set SENDGRID_FROM_EMAIL`, { stdio: 'inherit' });
      console.log('✅ Secret SENDGRID_FROM_EMAIL configuré');
    } catch (error) {
      console.log('⚠️  Note: Les secrets Firebase nécessitent Firebase CLI v12+');
    }

    // Méthode 2: Fallback vers functions.config() (pour compatibilité)
    console.log('');
    console.log('📝 Méthode alternative: functions.config() (déprécié mais fonctionnel jusqu\'au 31/12/2025)');
    execSync(`firebase functions:config:set sendgrid.api_key="${sendgridApiKey.trim()}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set sendgrid.from_email="${fromEmail.trim()}"`, { stdio: 'inherit' });
    console.log('✅ Configuration functions.config() effectuée');

    // Méthode 3: Créer un fichier .env.local pour le développement local
    console.log('');
    console.log('📝 Création du fichier .env.local pour le développement local...');
    const fs = require('fs');
    const envContent = `# Configuration locale pour le développement
# Ce fichier est utilisé uniquement en local (firebase emulators)

SENDGRID_API_KEY=${sendgridApiKey.trim()}
SENDGRID_FROM_EMAIL=${fromEmail.trim()}
`;
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Fichier .env.local créé');

    console.log('');
    console.log('✅ Configuration terminée!');
    console.log('');
    console.log('📋 Vérification de la configuration:');
    console.log('');
    
    try {
      execSync('firebase functions:config:get', { stdio: 'inherit' });
    } catch (error) {
      // Ignore si la commande échoue
    }

    console.log('');
    console.log('🚀 Prochaines étapes:');
    console.log('   1. Déployez les fonctions: firebase deploy --only functions');
    console.log('   2. Testez manuellement avec: firebase functions:shell');
    console.log('   3. Les rapports seront envoyés automatiquement chaque lundi à 9h00');
    console.log('');
    console.log('💡 Note: Pour utiliser les secrets Firebase en production,');
    console.log('   vous devrez mettre à jour votre code pour utiliser process.env');
    console.log('   (déjà fait dans functions/src/reports.ts)');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }

  rl.close();
}

main().catch(console.error);


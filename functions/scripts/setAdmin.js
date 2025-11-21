/**
 * Script pour attribuer le rôle admin à un utilisateur
 * 
 * Usage (depuis le dossier functions):
 *   node scripts/setAdmin.js <USER_EMAIL>
 * 
 * Prérequis:
 *   1. Installer Firebase Admin SDK: npm install firebase-admin (déjà fait dans functions)
 *   2. Télécharger la clé de service account depuis Firebase Console
 *   3. Placer le fichier JSON dans le dossier functions/ avec le nom serviceAccountKey.json
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Vérifier si la clé de service account existe
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.log('\n📋 Instructions:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the file as "serviceAccountKey.json" in the functions/ folder');
  process.exit(1);
}

// Initialiser Firebase Admin
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setAdmin(email) {
  try {
    console.log(`🔍 Looking for user: ${email}...`);
    
    // Trouver l'utilisateur par email
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`✅ User found: ${user.uid}`);
    console.log(`📧 Email: ${user.email}`);
    
    // Définir le rôle admin dans Custom Claims
    await admin.auth().setCustomUserClaims(user.uid, { roles: ['admin'] });
    console.log('✅ Custom Claims updated: roles = ["admin"]');
    
    // Mettre à jour aussi dans Firestore
    await db.collection('users').doc(user.uid).set({
      roles: ['admin']
    }, { merge: true });
    console.log('✅ Firestore updated: roles = ["admin"]');
    
    console.log('\n🎉 SUCCESS!');
    console.log(`\n📝 Next steps:`);
    console.log(`1. User ${email} must LOGOUT and LOGIN again`);
    console.log(`2. The new token will include the admin role`);
    console.log(`3. User will be able to access admin pages`);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: User with email ${email} not found`);
      console.log('\n💡 Make sure the user has registered at least once');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Récupérer l'email depuis les arguments
const email = process.argv[2];

if (!email) {
  console.log('📋 Usage: node scripts/setAdmin.js <USER_EMAIL>');
  console.log('\nExample:');
  console.log('  node scripts/setAdmin.js admin@example.com');
  process.exit(1);
}

setAdmin(email).then(() => {
  process.exit(0);
});


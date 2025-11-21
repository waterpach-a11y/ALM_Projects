import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

function requireAuth(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
}

function isAdmin(context: functions.https.CallableContext): boolean {
  const token = context.auth?.token as any;
  const roles = (token?.roles as string[]) || [];
  return roles.includes('admin');
}

export const createUser = functions.region('us-central1').https.onCall(async (data, context) => {
  requireAuth(context);

  // Temporarily allow all authenticated users to create users
  // TODO: Restrict to admin only after initial setup
  // if (!isAdmin(context)) {
  //   throw new functions.https.HttpsError('permission-denied', 'Admin role required');
  // }

  const { email, password, displayName, roles } = data as {
    email: string;
    password: string;
    displayName?: string;
    roles?: string[];
  };

  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and password are required');
  }

  // Create user in Firebase Auth
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: displayName || undefined,
    emailVerified: false,
  });

  // Set initial roles
  const initialRoles = roles && roles.length > 0 ? roles : ['user'];
  await admin.auth().setCustomUserClaims(userRecord.uid, { roles: initialRoles });

  // Create user document in Firestore
  const db = admin.firestore();
  await db.collection('users').doc(userRecord.uid).set({
    email,
    displayName: displayName || '',
    roles: initialRoles,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    userId: userRecord.uid,
    email: userRecord.email,
  };
});

export const importExistingUser = functions.region('us-central1').https.onCall(async (data, context) => {
  requireAuth(context);

  // Optionally restrict to admins only later using isAdmin(context)
  const { email, roles } = data as { email: string; roles?: string[] };

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  const db = admin.firestore();

  try {
    // 1) Find user in Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    // 2) Determine final roles
    const finalRoles = roles && roles.length > 0 ? roles : ['user'];

    // 3) Create or update the Firestore user document
    const userRef = db.collection('users').doc(userRecord.uid);
    const existingDoc = await userRef.get();

    if (existingDoc.exists) {
      await userRef.update({
        roles: finalRoles,
        displayName: userRecord.displayName || existingDoc.data()?.displayName || '',
        email: userRecord.email,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await userRef.set({
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        roles: finalRoles,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 4) Sync custom claims with Firestore roles
    await admin.auth().setCustomUserClaims(userRecord.uid, { roles: finalRoles });

    return {
      success: true,
      userId: userRecord.uid,
      email: userRecord.email,
      roles: finalRoles,
      imported: !existingDoc.exists,
    };
  } catch (error: any) {
    console.error('Error importing existing user:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to import user');
  }
});

export const inviteUser = functions.region('us-central1').https.onCall(async (data, context) => {
  requireAuth(context);

  // Temporarily allow all authenticated users to invite users
  // TODO: Restrict to admin only after initial setup
  // if (!isAdmin(context)) {
  //   throw new functions.https.HttpsError('permission-denied', 'Admin role required');
  // }

  const { email, displayName, roles } = data as {
    email: string;
    displayName?: string;
    roles?: string[];
  };

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';

  // Create user in Firebase Auth
  const userRecord = await admin.auth().createUser({
    email,
    displayName: displayName || undefined,
    emailVerified: false,
    password: tempPassword,
  });

  // Set initial roles
  const initialRoles = roles && roles.length > 0 ? roles : ['user'];
  await admin.auth().setCustomUserClaims(userRecord.uid, { roles: initialRoles });

  // Create user document in Firestore
  const db = admin.firestore();
  await db.collection('users').doc(userRecord.uid).set({
    email,
    displayName: displayName || '',
    roles: initialRoles,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Send invitation email with temp password
  // For now, return the temp password (in production, send via email)

  return {
    success: true,
    userId: userRecord.uid,
    email: userRecord.email,
    tempPassword, // Remove this in production and send via email
  };
});


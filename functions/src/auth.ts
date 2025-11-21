import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const authOnCreateUser = functions.auth.user().onCreate(async (user) => {
  const userDoc = {
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? null,
    roles: ['user'],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  };

  const db = admin.firestore();
  await db.collection('users').doc(user.uid).set(userDoc, { merge: true });

  await admin.auth().setCustomUserClaims(user.uid, { roles: ['user'] });
});

export const setUserRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const token = context.auth.token as any;
  const roles = token.roles as string[] | undefined;
  if (!roles || !roles.includes('admin')) {
    throw new functions.https.HttpsError('permission-denied', 'Admin role required');
  }

  const { userId, roles: newRoles } = data as { userId: string; roles: string[] };
  if (!userId || !Array.isArray(newRoles) || newRoles.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid roles payload');
  }

  const allowedRoles = ['admin', 'project-manager', 'project-lead', 'tester', 'validator', 'developer', 'user'];
  const invalid = newRoles.filter((r) => !allowedRoles.includes(r));
  if (invalid.length > 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role(s) provided');
  }

  await admin.auth().setCustomUserClaims(userId, { roles: newRoles });

  const db = admin.firestore();
  await db.collection('users').doc(userId).set({ roles: newRoles }, { merge: true });

  return { success: true, userId, roles: newRoles };
});

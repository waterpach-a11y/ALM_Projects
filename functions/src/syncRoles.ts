import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Synchronise les rôles de Firestore vers les Custom Claims de Firebase Auth
 * Utile pour corriger les utilisateurs qui ont le rôle admin dans Firestore
 * mais pas dans les Custom Claims
 */
export const syncUserRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { userId } = data as { userId?: string };

  const token = context.auth.token as any;
  const callerRoles = (token.roles as string[]) || [];

  // Cas 1: admin appelle sans userId -> synchroniser tous les utilisateurs
  if (!userId && callerRoles.includes('admin')) {
    try {
      const db = admin.firestore();
      const usersSnapshot = await db.collection('users').get();

      const results: Array<{ userId: string; email?: string; roles: string[] }> = [];

      for (const userDoc of usersSnapshot.docs) {
        const targetUserId = userDoc.id;
        const userData = userDoc.data();
        const roles = (userData?.roles as string[]) || ['user'];

        await admin.auth().setCustomUserClaims(targetUserId, { roles });

        results.push({
          userId: targetUserId,
          email: (userData?.email as string) || undefined,
          roles,
        });
      }

      return {
        success: true,
        userId: 'ALL',
        roles: [],
        message: `Roles synchronized successfully for ${results.length} users. They must logout and login again.`,
      };
    } catch (error: any) {
      console.error('Error syncing roles for all users:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Failed to sync roles for all users');
    }
  }

  // Cas 2: synchronisation d'un utilisateur spécifique (ou de soi-même)
  const targetUserId = userId || context.auth.uid;

  // Si l'utilisateur essaie de synchroniser un autre utilisateur, vérifier qu'il est admin
  if (userId && userId !== context.auth.uid && !callerRoles.includes('admin')) {
    throw new functions.https.HttpsError('permission-denied', 'Admin role required to sync other users');
  }

  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(targetUserId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User document not found in Firestore');
    }

    const userData = userDoc.data();
    const roles = (userData?.roles as string[]) || ['user'];

    await admin.auth().setCustomUserClaims(targetUserId, { roles });

    return {
      success: true,
      userId: targetUserId,
      roles,
      message: 'Roles synchronized successfully. User must logout and login again.',
    };
  } catch (error: any) {
    console.error('Error syncing roles:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to sync roles');
  }
});

/**
 * Synchronise tous les utilisateurs qui ont le rôle admin dans Firestore
 * mais pas dans les Custom Claims
 */
export const syncAllAdminRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  // Vérifier que l'utilisateur est admin (dans Custom Claims)
  const token = context.auth.token as any;
  const roles = (token.roles as string[]) || [];
  if (!roles.includes('admin')) {
    throw new functions.https.HttpsError('permission-denied', 'Admin role required');
  }

  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const results: Array<{ userId: string; email: string; synced: boolean; error?: string }> = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const firestoreRoles = (userData?.roles as string[]) || [];
      
      // Vérifier si l'utilisateur a le rôle admin dans Firestore
      if (firestoreRoles.includes('admin')) {
        try {
          // Récupérer les Custom Claims actuels
          const userRecord = await admin.auth().getUser(userId);
          const currentClaims = (userRecord.customClaims as any) || {};
          const currentRoles = (currentClaims.roles as string[]) || [];
          
          // Si les rôles sont différents, synchroniser
          if (JSON.stringify(firestoreRoles.sort()) !== JSON.stringify(currentRoles.sort())) {
            await admin.auth().setCustomUserClaims(userId, { roles: firestoreRoles });
            results.push({
              userId,
              email: userData.email || 'unknown',
              synced: true,
            });
          } else {
            results.push({
              userId,
              email: userData.email || 'unknown',
              synced: false,
            });
          }
        } catch (error: any) {
          results.push({
            userId,
            email: userData.email || 'unknown',
            synced: false,
            error: error.message,
          });
        }
      }
    }
    
    return {
      success: true,
      synced: results.filter(r => r.synced).length,
      total: results.length,
      results,
    };
  } catch (error: any) {
    console.error('Error syncing all admin roles:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to sync roles');
  }
});


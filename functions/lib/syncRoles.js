"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAllAdminRoles = exports.syncUserRoles = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.syncUserRoles = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const { userId } = data;
    const token = context.auth.token;
    const callerRoles = token.roles || [];
    if (!userId && callerRoles.includes('admin')) {
        try {
            const db = admin.firestore();
            const usersSnapshot = await db.collection('users').get();
            const results = [];
            for (const userDoc of usersSnapshot.docs) {
                const targetUserId = userDoc.id;
                const userData = userDoc.data();
                const roles = userData?.roles || ['user'];
                await admin.auth().setCustomUserClaims(targetUserId, { roles });
                results.push({
                    userId: targetUserId,
                    email: userData?.email || undefined,
                    roles,
                });
            }
            return {
                success: true,
                userId: 'ALL',
                roles: [],
                message: `Roles synchronized successfully for ${results.length} users. They must logout and login again.`,
            };
        }
        catch (error) {
            console.error('Error syncing roles for all users:', error);
            throw new functions.https.HttpsError('internal', error.message || 'Failed to sync roles for all users');
        }
    }
    const targetUserId = userId || context.auth.uid;
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
        const roles = userData?.roles || ['user'];
        await admin.auth().setCustomUserClaims(targetUserId, { roles });
        return {
            success: true,
            userId: targetUserId,
            roles,
            message: 'Roles synchronized successfully. User must logout and login again.',
        };
    }
    catch (error) {
        console.error('Error syncing roles:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to sync roles');
    }
});
exports.syncAllAdminRoles = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const token = context.auth.token;
    const roles = token.roles || [];
    if (!roles.includes('admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Admin role required');
    }
    try {
        const db = admin.firestore();
        const usersSnapshot = await db.collection('users').get();
        const results = [];
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            const firestoreRoles = userData?.roles || [];
            if (firestoreRoles.includes('admin')) {
                try {
                    const userRecord = await admin.auth().getUser(userId);
                    const currentClaims = userRecord.customClaims || {};
                    const currentRoles = currentClaims.roles || [];
                    if (JSON.stringify(firestoreRoles.sort()) !== JSON.stringify(currentRoles.sort())) {
                        await admin.auth().setCustomUserClaims(userId, { roles: firestoreRoles });
                        results.push({
                            userId,
                            email: userData.email || 'unknown',
                            synced: true,
                        });
                    }
                    else {
                        results.push({
                            userId,
                            email: userData.email || 'unknown',
                            synced: false,
                        });
                    }
                }
                catch (error) {
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
    }
    catch (error) {
        console.error('Error syncing all admin roles:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to sync roles');
    }
});
//# sourceMappingURL=syncRoles.js.map
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
exports.setUserRoles = exports.authOnCreateUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.authOnCreateUser = functions.auth.user().onCreate(async (user) => {
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
exports.setUserRoles = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const token = context.auth.token;
    const roles = token.roles;
    if (!roles || !roles.includes('admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Admin role required');
    }
    const { userId, roles: newRoles } = data;
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
//# sourceMappingURL=auth.js.map
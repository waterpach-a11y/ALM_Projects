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
exports.inviteUser = exports.importExistingUser = exports.createUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
function requireAuth(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
}
function isAdmin(context) {
    const token = context.auth?.token;
    const roles = token?.roles || [];
    return roles.includes('admin');
}
exports.createUser = functions.region('us-central1').https.onCall(async (data, context) => {
    requireAuth(context);
    const { email, password, displayName, roles } = data;
    if (!email || !password) {
        throw new functions.https.HttpsError('invalid-argument', 'Email and password are required');
    }
    const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: displayName || undefined,
        emailVerified: false,
    });
    const initialRoles = roles && roles.length > 0 ? roles : ['user'];
    await admin.auth().setCustomUserClaims(userRecord.uid, { roles: initialRoles });
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
exports.importExistingUser = functions.region('us-central1').https.onCall(async (data, context) => {
    requireAuth(context);
    const { email, roles } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    const db = admin.firestore();
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const finalRoles = roles && roles.length > 0 ? roles : ['user'];
        const userRef = db.collection('users').doc(userRecord.uid);
        const existingDoc = await userRef.get();
        if (existingDoc.exists) {
            await userRef.update({
                roles: finalRoles,
                displayName: userRecord.displayName || existingDoc.data()?.displayName || '',
                email: userRecord.email,
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            await userRef.set({
                email: userRecord.email,
                displayName: userRecord.displayName || '',
                roles: finalRoles,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        await admin.auth().setCustomUserClaims(userRecord.uid, { roles: finalRoles });
        return {
            success: true,
            userId: userRecord.uid,
            email: userRecord.email,
            roles: finalRoles,
            imported: !existingDoc.exists,
        };
    }
    catch (error) {
        console.error('Error importing existing user:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to import user');
    }
});
exports.inviteUser = functions.region('us-central1').https.onCall(async (data, context) => {
    requireAuth(context);
    const { email, displayName, roles } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
    const userRecord = await admin.auth().createUser({
        email,
        displayName: displayName || undefined,
        emailVerified: false,
        password: tempPassword,
    });
    const initialRoles = roles && roles.length > 0 ? roles : ['user'];
    await admin.auth().setCustomUserClaims(userRecord.uid, { roles: initialRoles });
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
        tempPassword,
    };
});
//# sourceMappingURL=users.js.map
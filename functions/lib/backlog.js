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
exports.createTask = exports.createStory = exports.createEpic = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
function getDb() {
    return admin.firestore();
}
function requireAuth(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
}
async function assertProjectMember(projectId, uid) {
    const snap = await getDb().collection('projects').doc(projectId).get();
    if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    const data = snap.data();
    const members = data.members || [];
    if (!members.includes(uid)) {
        throw new functions.https.HttpsError('permission-denied', 'Not a member of this project');
    }
}
exports.createEpic = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId, title, description = '', status = 'todo', priority = 'medium' } = data;
    if (!projectId || !title) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId and title are required');
    }
    await assertProjectMember(projectId, context.auth.uid);
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await getDb()
        .collection('projects')
        .doc(projectId)
        .collection('epics')
        .add({ title, description, status, priority, createdAt: now, updatedAt: now });
    const snap = await ref.get();
    return { epicId: ref.id, epic: { id: ref.id, ...snap.data() } };
});
exports.createStory = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId, epicId = null, title, description = '', status = 'todo', storyPoints = 0, assignee = null } = data;
    if (!projectId || !title) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId and title are required');
    }
    await assertProjectMember(projectId, context.auth.uid);
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await getDb()
        .collection('projects')
        .doc(projectId)
        .collection('stories')
        .add({ epicId, title, description, status, storyPoints, assignee, createdAt: now, updatedAt: now });
    const snap = await ref.get();
    return { storyId: ref.id, story: { id: ref.id, ...snap.data() } };
});
exports.createTask = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId, storyId = null, title, description = '', status = 'todo', assignee = null, dueDate = null } = data;
    if (!projectId || !title) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId and title are required');
    }
    await assertProjectMember(projectId, context.auth.uid);
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await getDb()
        .collection('projects')
        .doc(projectId)
        .collection('tasks')
        .add({ storyId, title, description, status, assignee, dueDate, createdAt: now, updatedAt: now });
    const snap = await ref.get();
    return { taskId: ref.id, task: { id: ref.id, ...snap.data() } };
});
//# sourceMappingURL=backlog.js.map
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
exports.updateBug = exports.createBug = void 0;
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
async function getTaskAssignee(projectId, taskId) {
    if (!taskId)
        return null;
    const snap = await getDb()
        .collection('projects')
        .doc(projectId)
        .collection('tasks')
        .doc(taskId)
        .get();
    if (!snap.exists)
        return null;
    const data = snap.data();
    return data.assignee ?? null;
}
exports.createBug = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId, title, severity, stepsToReproduce, linkedTask = null } = data;
    if (!projectId || !title || typeof severity !== 'number') {
        throw new functions.https.HttpsError('invalid-argument', 'projectId, title and severity are required');
    }
    await assertProjectMember(projectId, context.auth.uid);
    const severityLabel = severity > 7 ? 'critical' : 'normal';
    const assignee = await getTaskAssignee(projectId, linkedTask ?? null);
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await getDb()
        .collection('projects')
        .doc(projectId)
        .collection('bugs')
        .add({
        title,
        severity,
        severityLabel,
        stepsToReproduce,
        linkedTask: linkedTask ?? null,
        status: 'open',
        assignee: assignee ?? null,
        createdAt: now,
    });
    const snap = await ref.get();
    return { bugId: ref.id, bug: { id: ref.id, ...snap.data() } };
});
exports.updateBug = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId, bugId, updates } = data;
    if (!projectId || !bugId) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId and bugId are required');
    }
    await assertProjectMember(projectId, context.auth.uid);
    const ref = getDb().collection('projects').doc(projectId).collection('bugs').doc(bugId);
    const snap = await ref.get();
    if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'Bug not found');
    }
    const payload = {};
    if (typeof updates.title === 'string')
        payload.title = updates.title;
    if (typeof updates.stepsToReproduce === 'string')
        payload.stepsToReproduce = updates.stepsToReproduce;
    if (typeof updates.status === 'string')
        payload.status = updates.status;
    if (typeof updates.severity === 'number') {
        payload.severity = updates.severity;
        payload.severityLabel = updates.severity > 7 ? 'critical' : 'normal';
    }
    if (typeof updates.linkedTask === 'string' || updates.linkedTask === null) {
        payload.linkedTask = updates.linkedTask ?? null;
        const newAssignee = await getTaskAssignee(projectId, updates.linkedTask ?? null);
        if (newAssignee) {
            payload.assignee = newAssignee;
        }
    }
    if (typeof updates.assignee === 'string' || updates.assignee === null) {
        payload.assignee = updates.assignee ?? null;
    }
    await ref.update(payload);
    return { success: true, bugId };
});
//# sourceMappingURL=bugs.js.map
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
exports.getProjectDashboard = void 0;
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
exports.getProjectDashboard = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId } = data;
    if (!projectId) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
    }
    await assertProjectMember(projectId, context.auth.uid);
    const storiesSnap = await getDb().collection('projects').doc(projectId).collection('stories').get();
    const storiesByStatus = {};
    storiesSnap.forEach((doc) => {
        const s = doc.data();
        const status = s.status ?? 'unknown';
        storiesByStatus[status] = (storiesByStatus[status] || 0) + 1;
    });
    const bugsSnap = await getDb().collection('projects').doc(projectId).collection('bugs').get();
    let openBugsCount = 0;
    bugsSnap.forEach((doc) => {
        const b = doc.data();
        const status = b.status ?? 'open';
        if (status !== 'closed') {
            openBugsCount += 1;
        }
    });
    const tasksSnap = await getDb().collection('projects').doc(projectId).collection('tasks').get();
    const workloadMap = {};
    tasksSnap.forEach((doc) => {
        const t = doc.data();
        const assignee = t.assignee ?? 'unassigned';
        if (!workloadMap[assignee]) {
            workloadMap[assignee] = { userId: assignee, tasksCount: 0 };
        }
        workloadMap[assignee].tasksCount += 1;
    });
    const workloadByDeveloper = Object.values(workloadMap);
    const risksSnap = await getDb().collection('projects').doc(projectId).collection('risks').get();
    const risksByProbability = { low: 0, medium: 0, high: 0 };
    risksSnap.forEach((doc) => {
        const r = doc.data();
        const p = r.probability ?? 'medium';
        if (p === 'low' || p === 'medium' || p === 'high') {
            risksByProbability[p] += 1;
        }
    });
    return {
        storiesByStatus,
        openBugsCount,
        workloadByDeveloper,
        risksByProbability,
    };
});
//# sourceMappingURL=dashboard.js.map
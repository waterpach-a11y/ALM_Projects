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
exports.importProject = exports.exportProject = exports.cloneProject = exports.assignUserToProject = exports.deleteProject = exports.updateProject = exports.createProject = void 0;
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
function isAdmin(context) {
    const token = context.auth?.token;
    const roles = token?.roles || [];
    return roles.includes('admin');
}
function isManager(context) {
    const token = context.auth?.token;
    const roles = token?.roles || [];
    return roles.includes('project-manager');
}
exports.createProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    if (!isAdmin(context) && !isManager(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Admin or project-manager required');
    }
    const { name, description = '', workflowId = null, members, ownerId } = data;
    if (!name || typeof name !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Project name is required');
    }
    const token = context.auth.token;
    const roles = token.roles || [];
    const userIsAdmin = roles.includes('admin');
    const owner = (userIsAdmin && ownerId) ? ownerId : context.auth.uid;
    const finalMembers = Array.isArray(members) && members.length > 0 ? members.slice() : [owner];
    if (!finalMembers.includes(owner)) {
        finalMembers.push(owner);
    }
    const membersMap = {};
    for (const uid of finalMembers) {
        membersMap[uid] = true;
    }
    const now = admin.firestore.FieldValue.serverTimestamp();
    const projectRef = await getDb().collection('projects').add({
        name,
        description,
        owner,
        members: membersMap,
        workflowId: workflowId ?? null,
        createdAt: now,
        updatedAt: now,
    });
    const snapshot = await projectRef.get();
    return { projectId: projectRef.id, project: { id: projectRef.id, ...snapshot.data() } };
});
exports.updateProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId, updates } = data;
    if (!projectId || typeof projectId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
    }
    const ref = getDb().collection('projects').doc(projectId);
    const snap = await ref.get();
    if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    const project = snap.data();
    const uid = context.auth.uid;
    const isOwner = project.owner === uid;
    if (!isAdmin(context) && !isOwner) {
        throw new functions.https.HttpsError('permission-denied', 'Only owner or admin can update project');
    }
    const payload = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (typeof updates.name === 'string')
        payload.name = updates.name;
    if (typeof updates.description === 'string')
        payload.description = updates.description;
    if (typeof updates.workflowId === 'string' || updates.workflowId === null) {
        payload.workflowId = updates.workflowId ?? null;
    }
    if (Array.isArray(updates.members)) {
        const members = updates.members.slice();
        if (!members.includes(project.owner)) {
            members.push(project.owner);
        }
        const membersMap = {};
        for (const uid of members) {
            membersMap[uid] = true;
        }
        payload.members = membersMap;
    }
    await ref.update(payload);
    return { success: true, projectId };
});
exports.deleteProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId } = data;
    if (!projectId || typeof projectId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
    }
    const ref = getDb().collection('projects').doc(projectId);
    const snap = await ref.get();
    if (!snap.exists) {
        throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    const project = snap.data();
    const uid = context.auth.uid;
    const isOwner = project.owner === uid;
    if (!isAdmin(context) && !isOwner) {
        throw new functions.https.HttpsError('permission-denied', 'Only owner or admin can delete project');
    }
    const subcollections = ['epics', 'stories', 'tasks', 'requirements', 'sprints', 'bugs', 'risks', 'documents'];
    for (const subcollection of subcollections) {
        const subcollectionRef = ref.collection(subcollection);
        const subcollectionSnap = await subcollectionRef.get();
        const deletePromises = subcollectionSnap.docs.map((doc) => doc.ref.delete());
        await Promise.all(deletePromises);
    }
    await ref.delete();
    return { success: true };
});
exports.assignUserToProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    if (!isAdmin(context) && !isManager(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Admin or project-manager required');
    }
    const { projectId, userId } = data;
    if (!projectId || !userId) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId and userId are required');
    }
    const projectRef = getDb().collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    const projectData = projectSnap.data();
    let membersMap = {};
    if (Array.isArray(projectData.members)) {
        for (const uid of projectData.members) {
            membersMap[uid] = true;
        }
    }
    else if (typeof projectData.members === 'object' && projectData.members !== null) {
        membersMap = { ...projectData.members };
    }
    if (!membersMap[userId]) {
        membersMap[userId] = true;
        await projectRef.update({ members: membersMap });
    }
    return { success: true, projectId, members: membersMap };
});
exports.cloneProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { sourceProjectId, name, ownerId } = data;
    if (!sourceProjectId || !name || !ownerId) {
        throw new functions.https.HttpsError('invalid-argument', 'sourceProjectId, name and ownerId are required');
    }
    const db = getDb();
    const sourceRef = db.collection('projects').doc(sourceProjectId);
    const sourceSnap = await sourceRef.get();
    if (!sourceSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Source project not found');
    }
    const sourceData = sourceSnap.data();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const newProjectData = {
        ...sourceData,
        name,
        owner: ownerId,
        members: { [ownerId]: true },
        createdAt: now,
        updatedAt: now,
    };
    delete newProjectData.id;
    const newProjectRef = await db.collection('projects').add(newProjectData);
    const newProjectId = newProjectRef.id;
    const epicIdMap = new Map();
    const storyIdMap = new Map();
    const taskIdMap = new Map();
    async function cloneSubcollection(subcollection, transform, idRecorder) {
        const snap = await sourceRef.collection(subcollection).get();
        for (const doc of snap.docs) {
            const raw = doc.data();
            let newData = transform({ ...raw }, doc.id);
            newData = {
                ...newData,
                createdAt: now,
                updatedAt: now,
            };
            const newDocRef = newProjectRef.collection(subcollection).doc();
            await newDocRef.set(newData);
            if (idRecorder) {
                idRecorder(doc.id, newDocRef.id);
            }
        }
    }
    await cloneSubcollection('epics', (data) => data, (oldId, newId) => {
        epicIdMap.set(oldId, newId);
    });
    await cloneSubcollection('stories', (data) => {
        if (data.epicId) {
            const mapped = epicIdMap.get(data.epicId);
            data.epicId = mapped ?? null;
        }
        return data;
    }, (oldId, newId) => {
        storyIdMap.set(oldId, newId);
    });
    await cloneSubcollection('tasks', (data) => {
        if (data.storyId) {
            const mapped = storyIdMap.get(data.storyId);
            data.storyId = mapped ?? null;
        }
        return data;
    }, (oldId, newId) => {
        taskIdMap.set(oldId, newId);
    });
    await cloneSubcollection('requirements', (data) => {
        if (data.taskId) {
            const mapped = taskIdMap.get(data.taskId);
            data.taskId = mapped ?? null;
        }
        data.projectId = newProjectId;
        return data;
    });
    await cloneSubcollection('sprints', (data) => {
        if (data.projectId) {
            data.projectId = newProjectId;
        }
        return data;
    });
    await cloneSubcollection('bugs', (data) => {
        if (data.projectId) {
            data.projectId = newProjectId;
        }
        return data;
    });
    await cloneSubcollection('risks', (data) => {
        if (data.projectId) {
            data.projectId = newProjectId;
        }
        return data;
    });
    return { newProjectId };
});
exports.exportProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { projectId } = data;
    if (!projectId) {
        throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
    }
    const db = getDb();
    const projectRef = db.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    const projectData = projectSnap.data();
    async function exportSubcollection(subcollection) {
        const snap = await projectRef.collection(subcollection).get();
        return snap.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
    }
    const [epics, stories, tasks, requirements, sprints, bugs, risks] = await Promise.all([
        exportSubcollection('epics'),
        exportSubcollection('stories'),
        exportSubcollection('tasks'),
        exportSubcollection('requirements'),
        exportSubcollection('sprints'),
        exportSubcollection('bugs'),
        exportSubcollection('risks'),
    ]);
    return {
        project: { id: projectSnap.id, data: projectData },
        epics,
        stories,
        tasks,
        requirements,
        sprints,
        bugs,
        risks,
    };
});
exports.importProject = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { payload, name, ownerId } = data;
    if (!payload || !name || !ownerId) {
        throw new functions.https.HttpsError('invalid-argument', 'payload, name and ownerId are required');
    }
    const db = getDb();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const sourceProjectData = (payload.project?.data || {});
    const newProjectData = {
        ...sourceProjectData,
        name,
        owner: ownerId,
        members: { [ownerId]: true },
        createdAt: now,
        updatedAt: now,
    };
    delete newProjectData.id;
    const newProjectRef = await db.collection('projects').add(newProjectData);
    const newProjectId = newProjectRef.id;
    const epicIdMap = new Map();
    const storyIdMap = new Map();
    const taskIdMap = new Map();
    async function importSubcollection(subcollection, items, transform, idRecorder) {
        if (!items || items.length === 0)
            return;
        for (const item of items) {
            let newData = transform({ ...(item.data || {}) }, item.id);
            newData = {
                ...newData,
                createdAt: now,
                updatedAt: now,
            };
            const newDocRef = newProjectRef.collection(subcollection).doc();
            await newDocRef.set(newData);
            if (idRecorder) {
                idRecorder(item.id, newDocRef.id);
            }
        }
    }
    await importSubcollection('epics', payload.epics, (data) => data, (oldId, newId) => {
        epicIdMap.set(oldId, newId);
    });
    await importSubcollection('stories', payload.stories, (data) => {
        if (data.epicId) {
            const mapped = epicIdMap.get(data.epicId);
            data.epicId = mapped ?? null;
        }
        return data;
    }, (oldId, newId) => {
        storyIdMap.set(oldId, newId);
    });
    await importSubcollection('tasks', payload.tasks, (data) => {
        if (data.storyId) {
            const mapped = storyIdMap.get(data.storyId);
            data.storyId = mapped ?? null;
        }
        return data;
    }, (oldId, newId) => {
        taskIdMap.set(oldId, newId);
    });
    await importSubcollection('requirements', payload.requirements, (data) => {
        if (data.taskId) {
            const mapped = taskIdMap.get(data.taskId);
            data.taskId = mapped ?? null;
        }
        data.projectId = newProjectId;
        return data;
    });
    await importSubcollection('sprints', payload.sprints, (data) => {
        data.projectId = newProjectId;
        return data;
    });
    await importSubcollection('bugs', payload.bugs, (data) => {
        data.projectId = newProjectId;
        return data;
    });
    await importSubcollection('risks', payload.risks, (data) => {
        data.projectId = newProjectId;
        return data;
    });
    return { newProjectId };
});
//# sourceMappingURL=projects.js.map
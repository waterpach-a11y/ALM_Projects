import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

function getDb() {
  return admin.firestore();
}

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

function isManager(context: functions.https.CallableContext): boolean {
  const token = context.auth?.token as any;
  const roles = (token?.roles as string[]) || [];
  return roles.includes('project-manager');
}

export const createProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  if (!isAdmin(context) && !isManager(context)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin or project-manager required');
  }

  const { name, description = '', workflowId = null, members, ownerId } = data as {
    name: string;
    description?: string;
    workflowId?: string | null;
    members?: string[];
    ownerId?: string;
  };

  if (!name || typeof name !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Project name is required');
  }

  // Use provided ownerId if user is admin, otherwise use authenticated user
  const token = context.auth!.token as any;
  const roles = (token.roles as string[] | undefined) || [];
  const userIsAdmin = roles.includes('admin');
  
  const owner = (userIsAdmin && ownerId) ? ownerId : context.auth!.uid;
  const finalMembers = Array.isArray(members) && members.length > 0 ? members.slice() : [owner];
  if (!finalMembers.includes(owner)) {
    finalMembers.push(owner);
  }

  const membersMap: Record<string, boolean> = {};
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

export const updateProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId, updates } = data as {
    projectId: string;
    updates: { name?: string; description?: string; workflowId?: string | null; members?: string[] };
  };

  if (!projectId || typeof projectId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
  }

  const ref = getDb().collection('projects').doc(projectId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Project not found');
  }

  const project = snap.data() as any;
  const uid = context.auth!.uid;
  const isOwner = project.owner === uid;

  if (!isAdmin(context) && !isOwner) {
    throw new functions.https.HttpsError('permission-denied', 'Only owner or admin can update project');
  }

  const payload: any = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (typeof updates.name === 'string') payload.name = updates.name;
  if (typeof updates.description === 'string') payload.description = updates.description;
  if (typeof updates.workflowId === 'string' || updates.workflowId === null) {
    payload.workflowId = updates.workflowId ?? null;
  }
  if (Array.isArray(updates.members)) {
    const members = updates.members.slice();
    if (!members.includes(project.owner)) {
      members.push(project.owner);
    }
    const membersMap: Record<string, boolean> = {};
    for (const uid of members) {
      membersMap[uid] = true;
    }
    payload.members = membersMap;
  }

  await ref.update(payload);
  return { success: true, projectId };
});

export const deleteProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId } = data as { projectId: string };
  if (!projectId || typeof projectId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
  }

  const ref = getDb().collection('projects').doc(projectId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Project not found');
  }

  const project = snap.data() as any;
  const uid = context.auth!.uid;
  const isOwner = project.owner === uid;

  if (!isAdmin(context) && !isOwner) {
    throw new functions.https.HttpsError('permission-denied', 'Only owner or admin can delete project');
  }

  await ref.delete();
  // Suppression récursive des sous-collections à ajouter si besoin

  return { success: true };
});

export const assignUserToProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  if (!isAdmin(context) && !isManager(context)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin or project-manager required');
  }

  const { projectId, userId } = data as { projectId: string; userId: string };
  if (!projectId || !userId) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId and userId are required');
  }

  const projectRef = getDb().collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Project not found');
  }

  const projectData = projectSnap.data() as any;

  let membersMap: Record<string, boolean> = {};
  if (Array.isArray(projectData.members)) {
    // Backward compatibility: convert existing array to map
    for (const uid of projectData.members as string[]) {
      membersMap[uid] = true;
    }
  } else if (typeof projectData.members === 'object' && projectData.members !== null) {
    membersMap = { ...(projectData.members as Record<string, boolean>) };
  }

  if (!membersMap[userId]) {
    membersMap[userId] = true;
    await projectRef.update({ members: membersMap });
  }

  return { success: true, projectId, members: membersMap };
});

export const cloneProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { sourceProjectId, name, ownerId } = data as {
    sourceProjectId: string;
    name: string;
    ownerId: string;
  };

  if (!sourceProjectId || !name || !ownerId) {
    throw new functions.https.HttpsError('invalid-argument', 'sourceProjectId, name and ownerId are required');
  }

  const db = getDb();

  const sourceRef = db.collection('projects').doc(sourceProjectId);
  const sourceSnap = await sourceRef.get();
  if (!sourceSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Source project not found');
  }

  const sourceData = sourceSnap.data() as any;

  const now = admin.firestore.FieldValue.serverTimestamp();

  const newProjectData: any = {
    ...sourceData,
    name,
    owner: ownerId,
    members: { [ownerId]: true },
    createdAt: now,
    updatedAt: now,
  };

  // Avoid copying the document id-related fields if any
  delete newProjectData.id;

  const newProjectRef = await db.collection('projects').add(newProjectData);
  const newProjectId = newProjectRef.id;

  // Maps to preserve relationships between epics, stories, tasks, and requirements
  const epicIdMap = new Map<string, string>();
  const storyIdMap = new Map<string, string>();
  const taskIdMap = new Map<string, string>();

  // Helper to clone a whole subcollection with an optional transformer
  async function cloneSubcollection(
    subcollection: string,
    transform: (data: any, oldId: string) => any,
    idRecorder?: (oldId: string, newId: string) => void,
  ) {
    const snap = await sourceRef.collection(subcollection).get();
    for (const doc of snap.docs) {
      const raw = doc.data();
      let newData = transform({ ...raw }, doc.id);
      // Reset timestamps if present
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

  // Clone epics
  await cloneSubcollection(
    'epics',
    (data) => data,
    (oldId, newId) => {
      epicIdMap.set(oldId, newId);
    },
  );

  // Clone stories, remapping epicId
  await cloneSubcollection(
    'stories',
    (data) => {
      if (data.epicId) {
        const mapped = epicIdMap.get(data.epicId);
        data.epicId = mapped ?? null;
      }
      return data;
    },
    (oldId, newId) => {
      storyIdMap.set(oldId, newId);
    },
  );

  // Clone tasks, remapping storyId
  await cloneSubcollection(
    'tasks',
    (data) => {
      if (data.storyId) {
        const mapped = storyIdMap.get(data.storyId);
        data.storyId = mapped ?? null;
      }
      return data;
    },
    (oldId, newId) => {
      taskIdMap.set(oldId, newId);
    },
  );

  // Clone requirements, remapping taskId and projectId
  await cloneSubcollection('requirements', (data) => {
    if (data.taskId) {
      const mapped = taskIdMap.get(data.taskId);
      data.taskId = mapped ?? null;
    }
    data.projectId = newProjectId;
    return data;
  });

  // Clone sprints, updating projectId field if present
  await cloneSubcollection('sprints', (data) => {
    if (data.projectId) {
      data.projectId = newProjectId;
    }
    return data;
  });

  // Clone bugs as-is (no special relationships), but update projectId if present
  await cloneSubcollection('bugs', (data) => {
    if (data.projectId) {
      data.projectId = newProjectId;
    }
    return data;
  });

  // Clone risks as-is, but update projectId if present
  await cloneSubcollection('risks', (data) => {
    if (data.projectId) {
      data.projectId = newProjectId;
    }
    return data;
  });

  return { newProjectId };
});

export const exportProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId } = data as { projectId: string };
  if (!projectId) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
  }

  const db = getDb();
  const projectRef = db.collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Project not found');
  }

  const projectData = projectSnap.data() as any;

  async function exportSubcollection(subcollection: string) {
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

export const importProject = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { payload, name, ownerId } = data as {
    payload: any;
    name: string;
    ownerId: string;
  };

  if (!payload || !name || !ownerId) {
    throw new functions.https.HttpsError('invalid-argument', 'payload, name and ownerId are required');
  }

  const db = getDb();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const sourceProjectData = (payload.project?.data || {}) as any;

  const newProjectData: any = {
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

  const epicIdMap = new Map<string, string>();
  const storyIdMap = new Map<string, string>();
  const taskIdMap = new Map<string, string>();

  async function importSubcollection(
    subcollection: string,
    items: Array<{ id: string; data: any }> | undefined,
    transform: (data: any, oldId: string) => any,
    idRecorder?: (oldId: string, newId: string) => void,
  ) {
    if (!items || items.length === 0) return;
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

  await importSubcollection(
    'epics',
    payload.epics as Array<{ id: string; data: any }> | undefined,
    (data) => data,
    (oldId, newId) => {
      epicIdMap.set(oldId, newId);
    },
  );

  await importSubcollection(
    'stories',
    payload.stories as Array<{ id: string; data: any }> | undefined,
    (data) => {
      if (data.epicId) {
        const mapped = epicIdMap.get(data.epicId);
        data.epicId = mapped ?? null;
      }
      return data;
    },
    (oldId, newId) => {
      storyIdMap.set(oldId, newId);
    },
  );

  await importSubcollection(
    'tasks',
    payload.tasks as Array<{ id: string; data: any }> | undefined,
    (data) => {
      if (data.storyId) {
        const mapped = storyIdMap.get(data.storyId);
        data.storyId = mapped ?? null;
      }
      return data;
    },
    (oldId, newId) => {
      taskIdMap.set(oldId, newId);
    },
  );

  await importSubcollection(
    'requirements',
    payload.requirements as Array<{ id: string; data: any }> | undefined,
    (data) => {
      if (data.taskId) {
        const mapped = taskIdMap.get(data.taskId);
        data.taskId = mapped ?? null;
      }
      data.projectId = newProjectId;
      return data;
    },
  );

  await importSubcollection(
    'sprints',
    payload.sprints as Array<{ id: string; data: any }> | undefined,
    (data) => {
      data.projectId = newProjectId;
      return data;
    },
  );

  await importSubcollection(
    'bugs',
    payload.bugs as Array<{ id: string; data: any }> | undefined,
    (data) => {
      data.projectId = newProjectId;
      return data;
    },
  );

  await importSubcollection(
    'risks',
    payload.risks as Array<{ id: string; data: any }> | undefined,
    (data) => {
      data.projectId = newProjectId;
      return data;
    },
  );

  return { newProjectId };
});

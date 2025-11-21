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

async function assertProjectMember(projectId: string, uid: string) {
  const snap = await getDb().collection('projects').doc(projectId).get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Project not found');
  }
  const data = snap.data() as any;
  const members: string[] = data.members || [];
  if (!members.includes(uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Not a member of this project');
  }
}

async function getTaskAssignee(projectId: string, taskId: string | null): Promise<string | null> {
  if (!taskId) return null;
  const snap = await getDb()
    .collection('projects')
    .doc(projectId)
    .collection('tasks')
    .doc(taskId)
    .get();
  if (!snap.exists) return null;
  const data = snap.data() as any;
  return (data.assignee as string | null) ?? null;
}

export const createBug = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId, title, severity, stepsToReproduce, linkedTask = null } = data as {
    projectId: string;
    title: string;
    severity: number;
    stepsToReproduce: string;
    linkedTask?: string | null;
  };

  if (!projectId || !title || typeof severity !== 'number') {
    throw new functions.https.HttpsError('invalid-argument', 'projectId, title and severity are required');
  }

  await assertProjectMember(projectId, context.auth!.uid);

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

export const updateBug = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId, bugId, updates } = data as {
    projectId: string;
    bugId: string;
    updates: {
      title?: string;
      severity?: number;
      stepsToReproduce?: string;
      linkedTask?: string | null;
      status?: string;
      assignee?: string | null;
    };
  };

  if (!projectId || !bugId) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId and bugId are required');
  }

  await assertProjectMember(projectId, context.auth!.uid);

  const ref = getDb().collection('projects').doc(projectId).collection('bugs').doc(bugId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Bug not found');
  }

  const payload: any = {};
  if (typeof updates.title === 'string') payload.title = updates.title;
  if (typeof updates.stepsToReproduce === 'string') payload.stepsToReproduce = updates.stepsToReproduce;
  if (typeof updates.status === 'string') payload.status = updates.status;

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

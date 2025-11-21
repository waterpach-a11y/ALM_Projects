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

export const createEpic = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId, title, description = '', status = 'todo', priority = 'medium' } = data as {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
  };

  if (!projectId || !title) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId and title are required');
  }

  await assertProjectMember(projectId, context.auth!.uid);

  const now = admin.firestore.FieldValue.serverTimestamp();
  const ref = await getDb()
    .collection('projects')
    .doc(projectId)
    .collection('epics')
    .add({ title, description, status, priority, createdAt: now, updatedAt: now });

  const snap = await ref.get();
  return { epicId: ref.id, epic: { id: ref.id, ...snap.data() } };
});

export const createStory = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId, epicId = null, title, description = '', status = 'todo', storyPoints = 0, assignee = null } =
    data as {
      projectId: string;
      epicId?: string | null;
      title: string;
      description?: string;
      status?: string;
      storyPoints?: number;
      assignee?: string | null;
    };

  if (!projectId || !title) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId and title are required');
  }

  await assertProjectMember(projectId, context.auth!.uid);

  const now = admin.firestore.FieldValue.serverTimestamp();
  const ref = await getDb()
    .collection('projects')
    .doc(projectId)
    .collection('stories')
    .add({ epicId, title, description, status, storyPoints, assignee, createdAt: now, updatedAt: now });

  const snap = await ref.get();
  return { storyId: ref.id, story: { id: ref.id, ...snap.data() } };
});

export const createTask = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId, storyId = null, title, description = '', status = 'todo', assignee = null, dueDate = null } =
    data as {
      projectId: string;
      storyId?: string | null;
      title: string;
      description?: string;
      status?: string;
      assignee?: string | null;
      dueDate?: string | null;
    };

  if (!projectId || !title) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId and title are required');
  }

  await assertProjectMember(projectId, context.auth!.uid);

  const now = admin.firestore.FieldValue.serverTimestamp();
  const ref = await getDb()
    .collection('projects')
    .doc(projectId)
    .collection('tasks')
    .add({ storyId, title, description, status, assignee, dueDate, createdAt: now, updatedAt: now });

  const snap = await ref.get();
  return { taskId: ref.id, task: { id: ref.id, ...snap.data() } };
});

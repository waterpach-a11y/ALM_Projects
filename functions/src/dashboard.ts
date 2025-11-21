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

export const getProjectDashboard = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const { projectId } = data as { projectId: string };
  if (!projectId) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
  }

  await assertProjectMember(projectId, context.auth!.uid);

  // Stories by status
  const storiesSnap = await getDb().collection('projects').doc(projectId).collection('stories').get();
  const storiesByStatus: Record<string, number> = {};
  storiesSnap.forEach((doc) => {
    const s = doc.data() as any;
    const status = (s.status as string) ?? 'unknown';
    storiesByStatus[status] = (storiesByStatus[status] || 0) + 1;
  });

  // Open bugs count
  const bugsSnap = await getDb().collection('projects').doc(projectId).collection('bugs').get();
  let openBugsCount = 0;
  bugsSnap.forEach((doc) => {
    const b = doc.data() as any;
    const status = (b.status as string) ?? 'open';
    if (status !== 'closed') {
      openBugsCount += 1;
    }
  });

  // Workload by developer (tasks grouped by assignee)
  const tasksSnap = await getDb().collection('projects').doc(projectId).collection('tasks').get();
  const workloadMap: Record<string, { userId: string; tasksCount: number }> = {};
  tasksSnap.forEach((doc) => {
    const t = doc.data() as any;
    const assignee = (t.assignee as string | null) ?? 'unassigned';
    if (!workloadMap[assignee]) {
      workloadMap[assignee] = { userId: assignee, tasksCount: 0 };
    }
    workloadMap[assignee].tasksCount += 1;
  });

  const workloadByDeveloper = Object.values(workloadMap);

  // Risks by probability
  const risksSnap = await getDb().collection('projects').doc(projectId).collection('risks').get();
  const risksByProbability = { low: 0, medium: 0, high: 0 };
  risksSnap.forEach((doc) => {
    const r = doc.data() as any;
    const p = (r.probability as string) ?? 'medium';
    if (p === 'low' || p === 'medium' || p === 'high') {
      (risksByProbability as any)[p] += 1;
    }
  });

  return {
    storiesByStatus,
    openBugsCount,
    workloadByDeveloper,
    risksByProbability,
  };
});

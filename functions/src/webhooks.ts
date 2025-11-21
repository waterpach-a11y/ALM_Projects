import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

function getDb() {
  return admin.firestore();
}

function verifySecret(req: functions.https.Request, headerName: string, expectedSecret: string | undefined) {
  const token = req.header(headerName);
  if (!expectedSecret || !token || token !== expectedSecret) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid webhook secret');
  }
}

async function createIntegrationEvent(projectId: string, source: string, payload: unknown) {
  await getDb()
    .collection('projects')
    .doc(projectId)
    .collection('integrationEvents')
    .add({ source, payload, createdAt: admin.firestore.FieldValue.serverTimestamp() });
}

export const gitlabWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const secret = process.env.GITLAB_WEBHOOK_SECRET;
    verifySecret(req, 'x-gitlab-token', secret);

    const body = req.body as any;
    const projectId = body.project_id as string | undefined;
    if (!projectId) {
      res.status(400).send('project_id missing');
      return;
    }

    await createIntegrationEvent(projectId, 'gitlab', body);
    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(403).send('forbidden');
  }
});

export const githubWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    verifySecret(req, 'x-hub-signature-256', secret);

    const body = req.body as any;
    const projectId = body.project?.id as string | undefined;
    if (!projectId) {
      res.status(400).send('project.id missing');
      return;
    }

    await createIntegrationEvent(projectId, 'github', body);
    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(403).send('forbidden');
  }
});

export const slackWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const secret = process.env.SLACK_WEBHOOK_SECRET;
    verifySecret(req, 'x-slack-signature', secret);

    const body = req.body as any;
    const projectId = (body.projectId as string) || body.project_id;
    if (!projectId) {
      res.status(400).send('projectId missing');
      return;
    }

    await createIntegrationEvent(projectId, 'slack', body);
    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(403).send('forbidden');
  }
});

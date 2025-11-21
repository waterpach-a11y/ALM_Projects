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
exports.slackWebhook = exports.githubWebhook = exports.gitlabWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
function getDb() {
    return admin.firestore();
}
function verifySecret(req, headerName, expectedSecret) {
    const token = req.header(headerName);
    if (!expectedSecret || !token || token !== expectedSecret) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid webhook secret');
    }
}
async function createIntegrationEvent(projectId, source, payload) {
    await getDb()
        .collection('projects')
        .doc(projectId)
        .collection('integrationEvents')
        .add({ source, payload, createdAt: admin.firestore.FieldValue.serverTimestamp() });
}
exports.gitlabWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const secret = process.env.GITLAB_WEBHOOK_SECRET;
        verifySecret(req, 'x-gitlab-token', secret);
        const body = req.body;
        const projectId = body.project_id;
        if (!projectId) {
            res.status(400).send('project_id missing');
            return;
        }
        await createIntegrationEvent(projectId, 'gitlab', body);
        res.status(200).send('ok');
    }
    catch (err) {
        console.error(err);
        res.status(403).send('forbidden');
    }
});
exports.githubWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        verifySecret(req, 'x-hub-signature-256', secret);
        const body = req.body;
        const projectId = body.project?.id;
        if (!projectId) {
            res.status(400).send('project.id missing');
            return;
        }
        await createIntegrationEvent(projectId, 'github', body);
        res.status(200).send('ok');
    }
    catch (err) {
        console.error(err);
        res.status(403).send('forbidden');
    }
});
exports.slackWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const secret = process.env.SLACK_WEBHOOK_SECRET;
        verifySecret(req, 'x-slack-signature', secret);
        const body = req.body;
        const projectId = body.projectId || body.project_id;
        if (!projectId) {
            res.status(400).send('projectId missing');
            return;
        }
        await createIntegrationEvent(projectId, 'slack', body);
        res.status(200).send('ok');
    }
    catch (err) {
        console.error(err);
        res.status(403).send('forbidden');
    }
});
//# sourceMappingURL=webhooks.js.map
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { authOnCreateUser, setUserRoles } from './auth';
import { createProject, updateProject, deleteProject, assignUserToProject, cloneProject, exportProject, importProject } from './projects';
import { createEpic, createStory, createTask } from './backlog';
import { createBug, updateBug } from './bugs';
import { getProjectDashboard } from './dashboard';
import { gitlabWebhook, githubWebhook, slackWebhook } from './webhooks';
import { createUser, inviteUser, importExistingUser } from './users';
import { syncUserRoles, syncAllAdminRoles } from './syncRoles';
import { sendWeeklyReports, sendWeeklyReportsManual, sendWeeklyReportsTest } from './reports';

admin.initializeApp();

export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).send({ status: 'ok' });
});

// Auth
export { authOnCreateUser, setUserRoles };

// Projects
export { createProject, updateProject, deleteProject, assignUserToProject, cloneProject, exportProject, importProject };

// Backlog
export { createEpic, createStory, createTask };

// Bugs
export { createBug, updateBug };

// Dashboard
export { getProjectDashboard };

// Users
export { createUser, inviteUser, importExistingUser };

// Role Sync
export { syncUserRoles, syncAllAdminRoles };

// Webhooks
export { gitlabWebhook, githubWebhook, slackWebhook };

// Reports
export { sendWeeklyReports, sendWeeklyReportsManual, sendWeeklyReportsTest };

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
exports.sendWeeklyReportsTest = exports.sendWeeklyReportsManual = exports.sendWeeklyReports = exports.slackWebhook = exports.githubWebhook = exports.gitlabWebhook = exports.syncAllAdminRoles = exports.syncUserRoles = exports.importExistingUser = exports.inviteUser = exports.createUser = exports.getProjectDashboard = exports.updateBug = exports.createBug = exports.createTask = exports.createStory = exports.createEpic = exports.importProject = exports.exportProject = exports.cloneProject = exports.assignUserToProject = exports.deleteProject = exports.updateProject = exports.createProject = exports.setUserRoles = exports.authOnCreateUser = exports.healthCheck = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("./auth");
Object.defineProperty(exports, "authOnCreateUser", { enumerable: true, get: function () { return auth_1.authOnCreateUser; } });
Object.defineProperty(exports, "setUserRoles", { enumerable: true, get: function () { return auth_1.setUserRoles; } });
const projects_1 = require("./projects");
Object.defineProperty(exports, "createProject", { enumerable: true, get: function () { return projects_1.createProject; } });
Object.defineProperty(exports, "updateProject", { enumerable: true, get: function () { return projects_1.updateProject; } });
Object.defineProperty(exports, "deleteProject", { enumerable: true, get: function () { return projects_1.deleteProject; } });
Object.defineProperty(exports, "assignUserToProject", { enumerable: true, get: function () { return projects_1.assignUserToProject; } });
Object.defineProperty(exports, "cloneProject", { enumerable: true, get: function () { return projects_1.cloneProject; } });
Object.defineProperty(exports, "exportProject", { enumerable: true, get: function () { return projects_1.exportProject; } });
Object.defineProperty(exports, "importProject", { enumerable: true, get: function () { return projects_1.importProject; } });
const backlog_1 = require("./backlog");
Object.defineProperty(exports, "createEpic", { enumerable: true, get: function () { return backlog_1.createEpic; } });
Object.defineProperty(exports, "createStory", { enumerable: true, get: function () { return backlog_1.createStory; } });
Object.defineProperty(exports, "createTask", { enumerable: true, get: function () { return backlog_1.createTask; } });
const bugs_1 = require("./bugs");
Object.defineProperty(exports, "createBug", { enumerable: true, get: function () { return bugs_1.createBug; } });
Object.defineProperty(exports, "updateBug", { enumerable: true, get: function () { return bugs_1.updateBug; } });
const dashboard_1 = require("./dashboard");
Object.defineProperty(exports, "getProjectDashboard", { enumerable: true, get: function () { return dashboard_1.getProjectDashboard; } });
const webhooks_1 = require("./webhooks");
Object.defineProperty(exports, "gitlabWebhook", { enumerable: true, get: function () { return webhooks_1.gitlabWebhook; } });
Object.defineProperty(exports, "githubWebhook", { enumerable: true, get: function () { return webhooks_1.githubWebhook; } });
Object.defineProperty(exports, "slackWebhook", { enumerable: true, get: function () { return webhooks_1.slackWebhook; } });
const users_1 = require("./users");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return users_1.createUser; } });
Object.defineProperty(exports, "inviteUser", { enumerable: true, get: function () { return users_1.inviteUser; } });
Object.defineProperty(exports, "importExistingUser", { enumerable: true, get: function () { return users_1.importExistingUser; } });
const syncRoles_1 = require("./syncRoles");
Object.defineProperty(exports, "syncUserRoles", { enumerable: true, get: function () { return syncRoles_1.syncUserRoles; } });
Object.defineProperty(exports, "syncAllAdminRoles", { enumerable: true, get: function () { return syncRoles_1.syncAllAdminRoles; } });
const reports_1 = require("./reports");
Object.defineProperty(exports, "sendWeeklyReports", { enumerable: true, get: function () { return reports_1.sendWeeklyReports; } });
Object.defineProperty(exports, "sendWeeklyReportsManual", { enumerable: true, get: function () { return reports_1.sendWeeklyReportsManual; } });
Object.defineProperty(exports, "sendWeeklyReportsTest", { enumerable: true, get: function () { return reports_1.sendWeeklyReportsTest; } });
admin.initializeApp();
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).send({ status: 'ok' });
});
//# sourceMappingURL=index.js.map
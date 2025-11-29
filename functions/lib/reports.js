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
exports.sendWeeklyReportsTest = exports.sendWeeklyReportsManual = exports.sendWeeklyReports = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const sgMail = require('@sendgrid/mail');
function getDb() {
    return admin.firestore();
}
const sendgridApiKey = process.env.SENDGRID_API_KEY || functions.config().sendgrid?.api_key;
if (sendgridApiKey) {
    const trimmedKey = sendgridApiKey.trim();
    if (trimmedKey.startsWith('SG.') && sgMail && typeof sgMail.setApiKey === 'function') {
        try {
            sgMail.setApiKey(trimmedKey);
            console.log('SendGrid API key configured successfully');
            console.log('API key format check: OK (starts with SG.)');
        }
        catch (error) {
            console.error('Error setting SendGrid API key during initialization:', error);
        }
    }
    else if (trimmedKey && !trimmedKey.startsWith('SG.')) {
        console.error('❌ SendGrid API key does not start with "SG." - Invalid format');
        console.error('The key should start with "SG." (e.g., SG.xxxxxxxxxxxxxxxx...)');
        console.error('Current key preview:', trimmedKey.substring(0, Math.min(10, trimmedKey.length)) + '...');
    }
}
else {
    console.error('❌ SendGrid API key not configured. Emails will not be sent.');
    console.error('Check process.env.SENDGRID_API_KEY or functions.config().sendgrid.api_key');
}
async function sendEmail(to, subject, html) {
    if (!sendgridApiKey) {
        console.warn('SendGrid API key not configured. Email would be sent to:', to);
        console.log('Email subject:', subject);
        console.log('Email HTML length:', html.length);
        throw new Error('SendGrid API key not configured');
    }
    if (!sgMail || typeof sgMail.setApiKey !== 'function') {
        console.error('SendGrid mail module is not properly initialized');
        throw new Error('SendGrid mail module is not properly initialized');
    }
    const trimmedKey = sendgridApiKey.trim();
    if (!trimmedKey.startsWith('SG.')) {
        console.error('SendGrid API key does not start with "SG." - Invalid key format');
        throw new Error('Invalid SendGrid API key format');
    }
    try {
        sgMail.setApiKey(trimmedKey);
    }
    catch (error) {
        console.error('Error setting SendGrid API key:', error);
        throw new Error('Failed to set SendGrid API key');
    }
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || functions.config().sendgrid?.from_email || 'noreply@almproject.com';
    const msg = {
        to,
        from: fromEmail,
        subject,
        html,
    };
    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
    }
    catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        if (error.response) {
            console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
            console.error('SendGrid error status:', error.response.statusCode);
            console.error('SendGrid error headers:', error.response.headers);
        }
        if (error.response?.body) {
            const errorBody = error.response.body;
            if (Array.isArray(errorBody.errors)) {
                const errorMessages = errorBody.errors.map((e) => e.message).join(', ');
                throw new Error(`SendGrid error: ${errorMessages}`);
            }
        }
        throw error;
    }
}
async function generateProjectReport(projectId) {
    try {
        const db = getDb();
        const projectRef = db.collection('projects').doc(projectId);
        const projectSnap = await projectRef.get();
        if (!projectSnap.exists) {
            return null;
        }
        const projectData = projectSnap.data();
        const ownerId = projectData.owner || projectData.ownerId;
        let ownerEmail = '';
        if (ownerId) {
            const ownerDoc = await db.collection('users').doc(ownerId).get();
            ownerEmail = ownerDoc.exists ? (ownerDoc.data()?.email || '') : '';
        }
        let projectManagerEmail;
        const projectManagerId = projectData.projectManager || ownerId;
        if (projectManagerId && projectManagerId !== ownerId) {
            const managerDoc = await db.collection('users').doc(projectManagerId).get();
            projectManagerEmail = managerDoc.exists ? (managerDoc.data()?.email || undefined) : undefined;
        }
        const [epicsSnap, storiesSnap, tasksSnap] = await Promise.all([
            projectRef.collection('epics').get(),
            projectRef.collection('stories').get(),
            projectRef.collection('tasks').get(),
        ]);
        const totalEpics = epicsSnap.size;
        const totalStories = storiesSnap.size;
        const totalTasks = tasksSnap.size;
        let completedTasks = 0;
        let blockedTasks = 0;
        let overdueItems = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        tasksSnap.forEach((taskDoc) => {
            const taskData = taskDoc.data();
            if (taskData.status === 'done') {
                completedTasks++;
            }
            if (taskData.blocked === true) {
                blockedTasks++;
            }
        });
        epicsSnap.forEach((epicDoc) => {
            const epicData = epicDoc.data();
            const status = epicData.status || 'todo';
            const dueDate = epicData.dueDate;
            if (status !== 'done' && dueDate) {
                let date = null;
                if (dueDate?.toDate) {
                    date = dueDate.toDate();
                }
                else if (dueDate instanceof Date) {
                    date = dueDate;
                }
                if (date) {
                    const due = new Date(date);
                    due.setHours(0, 0, 0, 0);
                    if (due < today) {
                        overdueItems++;
                    }
                }
            }
        });
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const healthStatus = completionRate >= 80 ? 'excellent' : completionRate >= 50 ? 'good' : 'needs_attention';
        return {
            projectId,
            projectName: projectData.name || 'Unnamed Project',
            ownerEmail,
            projectManagerEmail,
            overallHealth: completionRate,
            healthStatus,
            totalEpics,
            totalStories,
            totalTasks,
            completedTasks,
            blockedTasks,
            overdueItems,
            completionRate,
            codeLink: projectData.codeLink,
            resultLink: projectData.resultLink,
            projectStatus: projectData.projectStatus || 'planned',
        };
    }
    catch (error) {
        console.error(`Error generating report for project ${projectId}:`, error);
        return null;
    }
}
function formatReportEmail(reports) {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .project { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .metric { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
        .metric-label { font-size: 12px; color: #6c757d; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #212529; margin-top: 5px; }
        .health-excellent { color: #28a745; }
        .health-good { color: #ffc107; }
        .health-needs-attention { color: #dc3545; }
        .links { margin-top: 15px; }
        .links a { display: inline-block; margin-right: 15px; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Weekly Project Report</h1>
        <p>Weekly summary of all your projects - ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
  `;
    reports.forEach((report) => {
        const healthClass = `health-${report.healthStatus.replace('_', '-')}`;
        html += `
      <div class="project">
        <h2>${report.projectName}</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Overall Health</div>
            <div class="metric-value ${healthClass}">${report.completionRate}%</div>
            <div style="font-size: 12px; margin-top: 5px; color: #6c757d;">
              ${report.healthStatus === 'excellent' ? '✓ Excellent' : report.healthStatus === 'good' ? '⚠ Good' : '⚠ Needs Attention'}
            </div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Epics</div>
            <div class="metric-value">${report.totalEpics}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Stories</div>
            <div class="metric-value">${report.totalStories}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Tasks</div>
            <div class="metric-value">${report.totalTasks}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Completed Tasks</div>
            <div class="metric-value" style="color: #28a745;">${report.completedTasks}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Blocked Tasks</div>
            <div class="metric-value" style="color: ${report.blockedTasks > 0 ? '#dc3545' : '#6c757d'};">${report.blockedTasks}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Overdue Items</div>
            <div class="metric-value" style="color: ${report.overdueItems > 0 ? '#dc3545' : '#6c757d'};">${report.overdueItems}</div>
          </div>
        </div>
        ${report.codeLink || report.resultLink ? `
          <div class="links">
            ${report.codeLink ? `<a href="${report.codeLink}" target="_blank">🔗 View Code</a>` : ''}
            ${report.resultLink ? `<a href="${report.resultLink}" target="_blank">🌐 View Result</a>` : ''}
          </div>
        ` : ''}
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
          <strong>Status:</strong> ${report.projectStatus} | 
          <strong>Project ID:</strong> ${report.projectId}
        </div>
      </div>
    `;
    });
    html += `
      <div class="footer">
        <p>This is an automated weekly report from your ALM Project Management System.</p>
        <p>Generated on ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </body>
    </html>
  `;
    return html;
}
exports.sendWeeklyReports = functions.pubsub
    .schedule('every monday 09:00')
    .timeZone('Europe/Paris')
    .onRun(async (context) => {
    await sendReportsToRecipients();
    return null;
});
exports.sendWeeklyReportsManual = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const token = context.auth.token;
    const roles = token.roles || [];
    if (!roles.includes('admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    return await sendReportsToRecipients();
});
async function sendReportsToRecipients() {
    const db = getDb();
    const projectsSnap = await db.collection('projects').get();
    const projects = projectsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    const reportsByRecipient = new Map();
    for (const project of projects) {
        const report = await generateProjectReport(project.id);
        if (!report)
            continue;
        if (report.ownerEmail) {
            if (!reportsByRecipient.has(report.ownerEmail)) {
                reportsByRecipient.set(report.ownerEmail, []);
            }
            reportsByRecipient.get(report.ownerEmail).push(report);
        }
        if (report.projectManagerEmail && report.projectManagerEmail !== report.ownerEmail) {
            if (!reportsByRecipient.has(report.projectManagerEmail)) {
                reportsByRecipient.set(report.projectManagerEmail, []);
            }
            reportsByRecipient.get(report.projectManagerEmail).push(report);
        }
    }
    const results = [];
    for (const [email, reports] of reportsByRecipient.entries()) {
        try {
            const htmlContent = formatReportEmail(reports);
            const subject = `📊 Weekly Project Report - ${reports.length} Project${reports.length > 1 ? 's' : ''}`;
            await sendEmail(email, subject, htmlContent);
            results.push({
                email,
                reportsCount: reports.length,
                success: true,
            });
        }
        catch (error) {
            console.error(`Error sending email to ${email}:`, error);
            results.push({
                email,
                reportsCount: reports.length,
                success: false,
                error: error.message,
            });
        }
    }
    return {
        success: true,
        totalRecipients: results.length,
        results,
    };
}
exports.sendWeeklyReportsTest = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        const result = await sendReportsToRecipients();
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in sendWeeklyReportsTest:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});
//# sourceMappingURL=reports.js.map
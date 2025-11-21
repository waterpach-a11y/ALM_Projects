import React from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDashboard } from './useProjectDashboard';
import { useProjectStore } from '../projects/useProjectStore';
import { useUsers } from '../users/useUsers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { useTraceability } from './useTraceability';
import { TraceabilityTable } from '../../components/traceability/TraceabilityTable';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { isOverdue, getDaysOverdue } from '../../utils/dateUtils';

const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#6366f1',
  review: '#f97316',
  done: '#22c55e',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
};

const DashboardPage: React.FC = () => {
  const { id: projectIdFromUrl } = useParams<{ id: string }>();
  const { currentProjectId } = useProjectStore();
  const projectId = projectIdFromUrl || currentProjectId;
  const { data, isLoading, error } = useProjectDashboard(projectId);
  const { data: traceabilityData, isLoading: traceabilityLoading } = useTraceability(projectId);
  const { data: users } = useUsers();

  if (!projectId) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">Select a project in the header to see the dashboard.</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading dashboard</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">No data for this project.</p>
        </div>
      </Card>
    );
  }

  const {
    totalEpics,
    totalStories,
    totalTasks,
    storiesByStatus,
    tasksByStatus,
    requirementsByPriority,
    openBugsCount,
    blockedTasksCount,
    verifiedRequirementsCount,
    overdueItemsCount,
    workloadByDeveloper,
    completionRate,
    burndownData,
    storiesDone,
    storiesTotal,
  } = data;

  const tasksStatusChartData = Object.entries(tasksByStatus).map(([status, count]) => ({ status, count }));
  const requirementsChartData = Object.entries(requirementsByPriority).map(([priority, count]) => ({
    priority,
    count,
  }));

  // Prepare radar chart data (business value vs complexity)
  const radarData = [
    { subject: 'Epics', value: totalEpics, fullMark: 20 },
    { subject: 'Stories', value: totalStories, fullMark: 50 },
    { subject: 'Tasks', value: totalTasks, fullMark: 100 },
    { subject: 'Completion', value: completionRate, fullMark: 100 },
  ];

  const storiesProgress = storiesTotal > 0 ? Math.round((storiesDone / storiesTotal) * 100) : 0;

  const usersById = (() => {
    const map = new Map<string, string>();
    if (users) {
      for (const u of users) {
        map.set(u.id, u.displayName || u.email || u.id);
      }
    }
    return map;
  })();

  const workloadWithLabels = workloadByDeveloper.map((w) => {
    const label = usersById.get(w.userId) || w.userId || 'Unassigned';
    return { ...w, label };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Dashboard</h1>
        <p className="text-slate-600 font-medium mb-4">Comprehensive overview and real-time metrics</p>
        
        {/* Global Project Health Indicator */}
        {data && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl shadow-md">
              <div className={`w-3 h-3 rounded-full ${
                completionRate >= 80 ? 'bg-emerald-500' : completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
              } animate-pulse`}></div>
              <span className="text-sm font-semibold text-slate-700">Overall Health</span>
              <Badge variant={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'warning' : 'error'} size="sm">
                {completionRate >= 80 ? '✓ Excellent' : completionRate >= 50 ? '⚠ Good' : '⚠ Needs Attention'}
              </Badge>
              <span className="text-sm font-bold text-slate-900 ml-2">{completionRate}%</span>
            </div>
            {blockedTasksCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-2 border-red-300 rounded-xl shadow-md">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-semibold text-red-700">{blockedTasksCount} Blocked Task{blockedTasksCount > 1 ? 's' : ''}</span>
              </div>
            )}
            {verifiedRequirementsCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-md">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-emerald-700">{verifiedRequirementsCount} Verified Requirement{verifiedRequirementsCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards - 3x3 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Total Epics</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">{totalEpics}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Total Stories</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">{totalStories}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-amber-50/50 to-white border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Total Tasks</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">{totalTasks}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-red-50/50 to-white border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Overdue Items</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{overdueItemsCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-orange-50/50 to-white border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Blocked Tasks</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{blockedTasksCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-orange-50/50 to-white border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Open Bugs</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{openBugsCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Verified Requirements</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">{verifiedRequirementsCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-purple-50/50 to-white border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Stories Progress</p>
              <p className="text-2xl font-bold text-slate-900 mb-3">
                {storiesDone} <span className="text-slate-400 font-normal">/ {storiesTotal}</span>
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${storiesProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-slate-50/50 to-white">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Tasks by Status</p>
              <div className="space-y-2">
                {Object.entries(tasksByStatus).slice(0, 3).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant={status === 'done' ? 'success' : status === 'in_progress' ? 'info' : 'default'}>
                      {status}
                    </Badge>
                    <span className="font-bold text-slate-900 text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card hover className="bg-gradient-to-br from-purple-50/50 to-white border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Developers</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{workloadByDeveloper.length}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Active contributors</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Pie Chart - Tasks by Status */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <SectionTitle>Tasks by Status</SectionTitle>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksStatusChartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {tasksStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] ?? '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart - Workload by Developer */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <SectionTitle>Workload by Developer</SectionTitle>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadWithLabels.slice(0, 10)}>
                <XAxis dataKey="label" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tasksCount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Line Chart - Burndown */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <SectionTitle>Burndown Chart</SectionTitle>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ left: -20 }}>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="remaining" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Radar Chart - Project Metrics */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <SectionTitle>Project Metrics Overview</SectionTitle>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Metrics" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Workload Table */}
      <Card className="bg-gradient-to-br from-white to-slate-50/30">
        <SectionTitle>Workload Distribution</SectionTitle>
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableHeaderCell>Developer</TableHeaderCell>
              <TableHeaderCell align="right">Tasks Assigned</TableHeaderCell>
              <TableHeaderCell align="right">Percentage</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {workloadWithLabels.map((w) => {
                const percentage = totalTasks > 0 ? Math.round((w.tasksCount / totalTasks) * 100) : 0;
                return (
                  <TableRow key={w.userId} hover>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-700">
                          {w.label.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{w.label}</span>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-semibold">{w.tasksCount}</span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 w-10 text-right">{percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Traceability Tables */}
      {traceabilityLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : traceabilityData ? (
        <div className="space-y-8 mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Traceability Matrix</h2>
            <p className="text-slate-600 font-medium">
              Track the relationships between Epics, Stories, Tasks, and Requirements
            </p>
          </div>

          {/* Epics → Stories (Aggregated) */}
          <Card className="bg-gradient-to-br from-white to-slate-50/30">
            <SectionTitle>Epics → Stories Traceability</SectionTitle>
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Epic</TableHeaderCell>
                  <TableHeaderCell align="right">Stories Count</TableHeaderCell>
                  <TableHeaderCell align="right">Todo</TableHeaderCell>
                  <TableHeaderCell align="right">In Progress</TableHeaderCell>
                  <TableHeaderCell align="right">Review</TableHeaderCell>
                  <TableHeaderCell align="right">Done</TableHeaderCell>
                  <TableHeaderCell>Progress</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {traceabilityData.epics.map((epic) => {
                    const relatedStories = traceabilityData.stories.filter((s) => s.epicId === epic.id);
                    const counts = {
                      todo: relatedStories.filter((s) => s.status === 'todo').length,
                      in_progress: relatedStories.filter((s) => s.status === 'in_progress').length,
                      review: relatedStories.filter((s) => s.status === 'review').length,
                      done: relatedStories.filter((s) => s.status === 'done').length,
                    };
                    const total = relatedStories.length;
                    const completed = counts.done;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                    // Vérifier si en retard (dueDate dépassée et statut différent de done)
                    const epicIsOverdue = isOverdue(epic.dueDate, epic.status);
                    const rowBgColor = epicIsOverdue
                      ? 'bg-red-50/30 border-red-200'
                      : percentage === 100
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : percentage >= 80
                      ? 'bg-green-50/30 border-green-200'
                      : percentage >= 50
                      ? 'bg-amber-50/30 border-amber-200'
                      : '';

                    return (
                      <TableRow key={epic.id} hover className={rowBgColor}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {epicIsOverdue && (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" title={`Overdue by ${getDaysOverdue(epic.dueDate)} days`}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{epic.title}</div>
                              {epic.dueDate?.toDate && (
                                <div className={`text-xs mt-0.5 ${
                                  epicIsOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'
                                }`}>
                                  Due: {epic.dueDate.toDate().toLocaleDateString()}
                                  {epicIsOverdue && ` (${getDaysOverdue(epic.dueDate)} days overdue)`}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="font-bold text-slate-900">{total}</span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${counts.todo > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {counts.todo}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${counts.in_progress > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
                            {counts.in_progress}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${counts.review > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {counts.review}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-bold ${counts.done > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {counts.done}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ProgressIndicator
                            percentage={percentage}
                            total={total}
                            completed={completed}
                            size="sm"
                            showBadge={false}
                          />
                        </TableCell>
                        <TableCell>
                          {isOverdue ? (
                            <Badge variant="error" size="sm">Overdue</Badge>
                          ) : percentage === 100 ? (
                            <Badge variant="success" size="sm">✓ Complete</Badge>
                          ) : percentage >= 80 ? (
                            <Badge variant="success" size="sm">On Track</Badge>
                          ) : percentage >= 50 ? (
                            <Badge variant="warning" size="sm">In Progress</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Started</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Stories → Tasks (Aggregated) */}
          <Card className="bg-gradient-to-br from-white to-slate-50/30">
            <SectionTitle>Stories → Tasks Traceability</SectionTitle>
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Story</TableHeaderCell>
                  <TableHeaderCell align="right">Tasks Count</TableHeaderCell>
                  <TableHeaderCell align="right">Todo</TableHeaderCell>
                  <TableHeaderCell align="right">In Progress</TableHeaderCell>
                  <TableHeaderCell align="right">Review</TableHeaderCell>
                  <TableHeaderCell align="right">Done</TableHeaderCell>
                  <TableHeaderCell>Progress</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {traceabilityData.stories.map((story) => {
                    const relatedTasks = traceabilityData.tasks.filter((t) => t.storyId === story.id);
                    const counts = {
                      todo: relatedTasks.filter((t) => t.status === 'todo').length,
                      in_progress: relatedTasks.filter((t) => t.status === 'in_progress').length,
                      review: relatedTasks.filter((t) => t.status === 'review').length,
                      done: relatedTasks.filter((t) => t.status === 'done').length,
                      blocked: relatedTasks.filter((t) => t.blocked).length,
                    };
                    const total = relatedTasks.length;
                    const completed = counts.done;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const hasBlocked = counts.blocked > 0;

                    const rowBgColor = hasBlocked
                      ? 'bg-red-50/30 border-red-200'
                      : percentage === 100
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : percentage >= 80
                      ? 'bg-green-50/30 border-green-200'
                      : percentage >= 50
                      ? 'bg-amber-50/30 border-amber-200'
                      : '';

                    return (
                      <TableRow key={story.id} hover className={rowBgColor}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {hasBlocked && (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{story.title}</div>
                              {story.storyPoints && (
                                <div className="text-xs text-slate-500 mt-0.5">{story.storyPoints} pts</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="font-bold text-slate-900">{total}</span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${counts.todo > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                            {counts.todo}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${counts.in_progress > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
                            {counts.in_progress}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${counts.review > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {counts.review}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-bold ${counts.done > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {counts.done}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ProgressIndicator
                            percentage={percentage}
                            total={total}
                            completed={completed}
                            size="sm"
                            showBadge={false}
                          />
                        </TableCell>
                        <TableCell>
                          {hasBlocked ? (
                            <Badge variant="error" size="sm">⚠ Blocked</Badge>
                          ) : percentage === 100 ? (
                            <Badge variant="success" size="sm">✓ Complete</Badge>
                          ) : percentage >= 80 ? (
                            <Badge variant="success" size="sm">On Track</Badge>
                          ) : percentage >= 50 ? (
                            <Badge variant="warning" size="sm">In Progress</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Started</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Tasks → Requirements (Aggregated) */}
          <Card className="bg-gradient-to-br from-white to-slate-50/30">
            <SectionTitle>Tasks → Requirements Traceability</SectionTitle>
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Task</TableHeaderCell>
                  <TableHeaderCell align="right">Requirements Count</TableHeaderCell>
                  <TableHeaderCell align="right">Pending</TableHeaderCell>
                  <TableHeaderCell align="right">Verified</TableHeaderCell>
                  <TableHeaderCell>Progress</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {traceabilityData.tasks.map((task) => {
                    const relatedReqs = traceabilityData.requirements.filter((r) => r.taskId === task.id);
                    const pendingCount = relatedReqs.filter((r) => !r.verified).length;
                    const verifiedCount = relatedReqs.filter((r) => r.verified).length;
                    const total = relatedReqs.length;
                    const percentage = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;
                    const isBlocked = task.blocked;

                    const rowBgColor = isBlocked
                      ? 'bg-red-50/30 border-red-200'
                      : percentage === 100
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : percentage >= 80
                      ? 'bg-green-50/30 border-green-200'
                      : percentage >= 50
                      ? 'bg-amber-50/30 border-amber-200'
                      : '';

                    return (
                      <TableRow key={task.id} hover className={rowBgColor}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isBlocked && (
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{task.title}</div>
                              {task.estimatedHours && (
                                <div className="text-xs text-slate-500 mt-0.5">{task.estimatedHours}h estimated</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="font-bold text-slate-900">{total}</span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {pendingCount}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className={`font-bold ${verifiedCount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {verifiedCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ProgressIndicator
                            percentage={percentage}
                            total={total}
                            completed={verifiedCount}
                            size="sm"
                            showBadge={false}
                          />
                        </TableCell>
                        <TableCell>
                          {isBlocked ? (
                            <Badge variant="error" size="sm">⚠ Blocked</Badge>
                          ) : percentage === 100 ? (
                            <Badge variant="success" size="sm">✓ Verified</Badge>
                          ) : percentage >= 80 ? (
                            <Badge variant="success" size="sm">On Track</Badge>
                          ) : percentage >= 50 ? (
                            <Badge variant="warning" size="sm">In Progress</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Started</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardPage;

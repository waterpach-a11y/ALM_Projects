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
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Dashboard</h1>
        <p className="text-slate-600 font-medium">Comprehensive overview and real-time metrics</p>
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
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Blocked Tasks</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{blockedTasksCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
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
          <Card>
            <SectionTitle>Epics → Stories Traceability</SectionTitle>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Epic</TableHeaderCell>
                  <TableHeaderCell align="right">Stories Count</TableHeaderCell>
                  <TableHeaderCell align="right">Todo</TableHeaderCell>
                  <TableHeaderCell align="right">In Progress</TableHeaderCell>
                  <TableHeaderCell align="right">Review</TableHeaderCell>
                  <TableHeaderCell align="right">Done</TableHeaderCell>
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

                    return (
                      <TableRow key={epic.id} hover>
                        <TableCell>
                          <div className="font-medium text-slate-900">{epic.title}</div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="font-semibold">{relatedStories.length}</span>
                        </TableCell>
                        <TableCell align="right">{counts.todo}</TableCell>
                        <TableCell align="right">{counts.in_progress}</TableCell>
                        <TableCell align="right">{counts.review}</TableCell>
                        <TableCell align="right">{counts.done}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Stories → Tasks (Aggregated) */}
          <Card>
            <SectionTitle>Stories → Tasks Traceability</SectionTitle>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Story</TableHeaderCell>
                  <TableHeaderCell align="right">Tasks Count</TableHeaderCell>
                  <TableHeaderCell align="right">Todo</TableHeaderCell>
                  <TableHeaderCell align="right">In Progress</TableHeaderCell>
                  <TableHeaderCell align="right">Review</TableHeaderCell>
                  <TableHeaderCell align="right">Done</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {traceabilityData.stories.map((story) => {
                    const relatedTasks = traceabilityData.tasks.filter((t) => t.storyId === story.id);
                    const counts = {
                      todo: relatedTasks.filter((t) => t.status === 'todo').length,
                      in_progress: relatedTasks.filter((t) => t.status === 'in_progress').length,
                      review: relatedTasks.filter((t) => t.status === 'review').length,
                      done: relatedTasks.filter((t) => t.status === 'done').length,
                    };

                    return (
                      <TableRow key={story.id} hover>
                        <TableCell>
                          <div className="font-medium text-slate-900">{story.title}</div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="font-semibold">{relatedTasks.length}</span>
                        </TableCell>
                        <TableCell align="right">{counts.todo}</TableCell>
                        <TableCell align="right">{counts.in_progress}</TableCell>
                        <TableCell align="right">{counts.review}</TableCell>
                        <TableCell align="right">{counts.done}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Tasks → Requirements (Aggregated) */}
          <Card>
            <SectionTitle>Tasks → Requirements Traceability</SectionTitle>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHeaderCell>Task</TableHeaderCell>
                  <TableHeaderCell align="right">Requirements Count</TableHeaderCell>
                  <TableHeaderCell align="right">Pending</TableHeaderCell>
                  <TableHeaderCell align="right">Verified</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {traceabilityData.tasks.map((task) => {
                    const relatedReqs = traceabilityData.requirements.filter((r) => r.taskId === task.id);
                    const pendingCount = relatedReqs.filter((r) => !r.verified).length;
                    const verifiedCount = relatedReqs.filter((r) => r.verified).length;

                    return (
                      <TableRow key={task.id} hover>
                        <TableCell>
                          <div className="font-medium text-slate-900">{task.title}</div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="font-semibold">{relatedReqs.length}</span>
                        </TableCell>
                        <TableCell align="right">{pendingCount}</TableCell>
                        <TableCell align="right">{verifiedCount}</TableCell>
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

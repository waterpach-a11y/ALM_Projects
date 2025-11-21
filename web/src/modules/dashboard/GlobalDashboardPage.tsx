import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { useGlobalDashboard } from './useGlobalDashboard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { Avatar } from '../../components/ui/Avatar';
import { useUsers, useProjectManagers } from '../users/useUsers';
import { useCloneProject } from '../projects/useCloneProject';
import { useImportProject } from '../projects/useImportProject';
import { functions } from '../../firebase';
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
  Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  planned: '#94a3b8',
  in_progress: '#6366f1',
  blocked: '#ef4444',
  closed: '#22c55e',
};

const GlobalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGlobalDashboard();
  const { data: users } = useUsers();
  const { data: projectManagers } = useProjectManagers();
  const cloneProject = useCloneProject();
  const importProject = useImportProject();

  const [cloneModalProjectId, setCloneModalProjectId] = React.useState<string | null>(null);
  const [cloneName, setCloneName] = React.useState('');
  const [cloneOwnerId, setCloneOwnerId] = React.useState('');

  const [importModalProjectId, setImportModalProjectId] = React.useState<string | null>(null);
  const [importName, setImportName] = React.useState('');
  const [importOwnerId, setImportOwnerId] = React.useState('');
  const [importPayload, setImportPayload] = React.useState<any | null>(null);

  console.debug('[GlobalDashboardPage] data = ', data);

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
          <p className="text-red-600">Error loading global dashboard</p>
        </div>
      </Card>
    );
  }

  const dashboard = data ?? {
    projects: [],
    totalProjects: 0,
    activeProjects: 0,
    totalEpics: 0,
    totalStories: 0,
    totalTasks: 0,
    totalSprints: 0,
    projectsByStatus: {},
    projectsByOwner: {},
  };

  const {
    projects,
    totalProjects,
    activeProjects,
    totalEpics,
    totalStories,
    totalTasks,
    totalSprints,
    projectsByStatus,
    projectsByOwner,
  } = dashboard;

  const projectsStatusChartData = Object.entries(projectsByStatus).map(([status, count]) => ({
    status,
    count,
  }));

  const projectsByOwnerChartData = Object.entries(projectsByOwner)
    .map(([owner, count]) => ({ owner: owner.substring(0, 20), count }))
    .slice(0, 10);

  const usersById = (() => {
    const map = new Map<string, { label: string }>();
    if (users) {
      for (const u of users) {
        map.set(u.id, { label: u.displayName || u.email || u.id });
      }
    }
    return map;
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Dashboard</h1>
          <p className="text-slate-600 font-medium">Comprehensive overview of all projects and metrics</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/app/projects/create')}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </Button>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-slate-900">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-indigo-600">{activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Epics</p>
              <p className="text-3xl font-bold text-slate-900">{totalEpics}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-slate-900">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Projects by Status</SectionTitle>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectsStatusChartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {projectsStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] ?? '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle>Projects by Owner</SectionTitle>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsByOwnerChartData}>
                <XAxis dataKey="owner" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <SectionTitle>All Projects</SectionTitle>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableHeaderCell>Project Name</TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Members</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const statusConfig = {
                  planned: { variant: 'default' as const, label: 'Planned' },
                  in_progress: { variant: 'info' as const, label: 'In Progress' },
                  blocked: { variant: 'error' as const, label: 'Blocked' },
                  closed: { variant: 'success' as const, label: 'Closed' },
                };
                const config = statusConfig[project.projectStatus] || statusConfig.planned;

                return (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <div className="font-medium text-slate-900">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-slate-500 mt-1">{project.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={usersById.get(project.ownerId)?.label || project.ownerId}
                          size="sm"
                        />
                        <span className="text-sm text-slate-600">
                          {usersById.get(project.ownerId)?.label || project.ownerId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {project.members?.slice(0, 3).map((member) => (
                          <Avatar key={member} name={member} size="sm" />
                        ))}
                        {project.members && project.members.length > 3 && (
                          <span className="text-xs text-slate-500">+{project.members.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          to={`/app/project/${project.id}/dashboard`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to={`/app/project/${project.id}`}
                          className="text-slate-600 hover:text-slate-700 text-sm font-medium"
                        >
                          Settings
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={cloneProject.isPending}
                          onClick={() => {
                            setCloneModalProjectId(project.id);
                            setCloneName(`${project.name} (Copy)`);
                            setCloneOwnerId('');
                          }}
                        >
                          Clone
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={cloneProject.isPending || importProject.isPending}
                          onClick={async () => {
                            try {
                              const callable = httpsCallable(functions, 'exportProject');
                              const result = await callable({ projectId: project.id });
                              const data = result.data as any;
                              const json = JSON.stringify(data, null, 2);
                              const blob = new Blob([json], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `project-${project.name || project.id}.json`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error('[GlobalDashboardPage] exportProject error', err);
                            }
                          }}
                        >
                          Export
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={cloneProject.isPending || importProject.isPending}
                          onClick={() => {
                            setImportModalProjectId(project.id);
                            setImportName(`${project.name} (Imported)`);
                            setImportOwnerId('');
                            setImportPayload(null);
                          }}
                        >
                          Import
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {cloneModalProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Clone Project</h2>
            <p className="text-sm text-slate-600">
              Create a new project based on the selected one. Only the new project leader will be added as member.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New project name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  disabled={cloneProject.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project leader</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={cloneOwnerId}
                  onChange={(e) => setCloneOwnerId(e.target.value)}
                  disabled={cloneProject.isPending}
                >
                  <option value="">Select a project leader</option>
                  {projectManagers?.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.displayName || manager.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={cloneProject.isPending}
                onClick={() => {
                  if (cloneProject.isPending) return;
                  setCloneModalProjectId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={cloneProject.isPending}
                disabled={!cloneName.trim() || !cloneOwnerId || cloneProject.isPending}
                onClick={async () => {
                  if (!cloneModalProjectId || !cloneName.trim() || !cloneOwnerId) return;
                  await cloneProject.mutateAsync({
                    sourceProjectId: cloneModalProjectId,
                    name: cloneName.trim(),
                    ownerId: cloneOwnerId,
                  });
                  setCloneModalProjectId(null);
                }}
              >
                Clone Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {importModalProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Import Project from JSON</h2>
            <p className="text-sm text-slate-600">
              Select a JSON export file and configure the new project.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">JSON file</label>
                <input
                  type="file"
                  accept="application/json"
                  className="block w-full text-sm text-slate-600"
                  disabled={importProject.isPending}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setImportPayload(null);
                      return;
                    }
                    try {
                      const text = await file.text();
                      const parsed = JSON.parse(text);
                      setImportPayload(parsed);
                      if (!importName.trim() && parsed?.project?.data?.name) {
                        setImportName(`${parsed.project.data.name} (Imported)`);
                      }
                    } catch (err) {
                      console.error('[GlobalDashboardPage] error parsing import JSON', err);
                      setImportPayload(null);
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New project name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  disabled={importProject.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project leader</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={importOwnerId}
                  onChange={(e) => setImportOwnerId(e.target.value)}
                  disabled={importProject.isPending}
                >
                  <option value="">Select a project leader</option>
                  {projectManagers?.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.displayName || manager.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={importProject.isPending}
                onClick={() => {
                  if (importProject.isPending) return;
                  setImportModalProjectId(null);
                  setImportPayload(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={importProject.isPending}
                disabled={!importPayload || !importName.trim() || !importOwnerId || importProject.isPending}
                onClick={async () => {
                  if (!importPayload || !importName.trim() || !importOwnerId) return;
                  await importProject.mutateAsync({
                    payload: importPayload,
                    name: importName.trim(),
                    ownerId: importOwnerId,
                  });
                  setImportModalProjectId(null);
                  setImportPayload(null);
                }}
              >
                Import Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-slate-900">{totalStories}</p>
            <p className="text-sm text-slate-500 mt-1">Total Stories</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-slate-900">{totalSprints}</p>
            <p className="text-sm text-slate-500 mt-1">Total Sprints</p>
          </div>
        </Card>
        <Card>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-slate-900">{Object.keys(projectsByOwner).length}</p>
            <p className="text-sm text-slate-500 mt-1">Project Owners</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GlobalDashboardPage;


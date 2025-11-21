import React, { FormEvent, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from './useProject';
import { useUpdateProject } from './useUpdateProject';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField, Input, Textarea, Select } from '../../components/ui/FormField';
import { Avatar } from '../../components/ui/Avatar';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Loader } from '../../components/ui/Loader';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { useUsers } from '../users/useUsers';

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id ?? null);
  const updateProject = useUpdateProject();
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'blocked' | 'closed'>('planned');
  const [members, setMembers] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  React.useEffect(() => {
    if (project) {
      setName(project.name ?? '');
      setDescription(project.description ?? '');
      setStatus(project.projectStatus ?? 'planned');
      setOwnerId((project as any).owner || '');
      if (Array.isArray(project.members)) {
        setMembers(project.members);
      } else if (project.members && typeof project.members === 'object') {
        setMembers(Object.keys(project.members as Record<string, any>));
      } else {
        setMembers([]);
      }
      if (project.deadline?.toDate) {
        const d = project.deadline.toDate() as Date;
        setDeadline(d.toISOString().slice(0, 10));
      }
    }
  }, [project]);

  if (!id) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">No project id provided.</p>
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

  if (!project) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">Project not found.</p>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const effectiveOwnerId = ownerId || (project as any).owner || '';
    const finalMembers = (() => {
      const current = members.slice();
      if (effectiveOwnerId && !current.includes(effectiveOwnerId)) {
        current.push(effectiveOwnerId);
      }
      return current;
    })();
    try {
      setSaveState('saving');
      await updateProject.mutateAsync({
        projectId: id,
        data: {
          name,
          description,
          projectStatus: status,
          owner: effectiveOwnerId || undefined,
          members: finalMembers,
          ...(deadline ? { deadline: new Date(deadline) } : {}),
        },
      });
      setSaveState('saved');
      setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    } catch (err) {
      console.error('[ProjectPage] error while saving project', err);
      setSaveState('error');
      setTimeout(() => {
        setSaveState('idle');
      }, 3000);
    }
  };

  const statusConfig = {
    planned: { variant: 'default' as const, label: 'Planned' },
    in_progress: { variant: 'info' as const, label: 'In Progress' },
    blocked: { variant: 'error' as const, label: 'Blocked' },
    closed: { variant: 'success' as const, label: 'Closed' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Settings</h1>
          <p className="text-slate-600 font-medium">Manage project information and configuration</p>
        </div>
        {project && (
          <Link
            to={`/app/project/${id}/dashboard`}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Dashboard
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* General Information */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <SectionTitle>General Information</SectionTitle>
          <div className="mt-6 space-y-4">
            <FormField label="Project Name" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </FormField>
            <FormField label="Description">
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
              />
            </FormField>
            <FormField label="Project Owner">
              <Select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
              >
                <option value="">Select project owner</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.email} {u.email ? `(${u.email})` : ''}
                  </option>
                ))}
              </Select>
            </FormField>
            {ownerId && users && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-sm">
                <Avatar name={users.find((u) => u.id === ownerId)?.email || ''} size="md" />
                <div>
                  <div className="font-semibold text-slate-900">
                    {users.find((u) => u.id === ownerId)?.displayName ||
                      users.find((u) => u.id === ownerId)?.email}
                  </div>
                  <div className="text-sm text-slate-600">
                    {users.find((u) => u.id === ownerId)?.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Status and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-white to-slate-50/30">
            <SectionTitle>Project Status</SectionTitle>
            <div className="mt-6 space-y-4">
              <FormField label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="closed">Closed</option>
                </Select>
              </FormField>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Current status:</span>
                <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-white to-slate-50/30">
            <SectionTitle>Dates</SectionTitle>
            <div className="mt-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Created At</div>
                <div className="text-sm text-slate-600">
                  {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : '-'}
                </div>
              </div>
              <FormField label="Deadline">
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </FormField>
            </div>
          </Card>
        </div>

        {/* Members */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <SectionTitle>Team Members</SectionTitle>
          <div className="mt-6 space-y-4">
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : usersError || !users ? (
              <div className="mt-2">
                <div className="text-sm text-slate-500 py-4">
                  Team members are currently read-only.
                </div>
                {project.members && project.members.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {project.members.map((member) => {
                      const user = users?.find((u) => u.id === member);
                      return (
                        <div
                          key={member}
                          className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-sm"
                        >
                          <Avatar name={user?.email || member} size="sm" />
                          <span className="text-sm font-semibold text-slate-900">
                            {user?.displayName || user?.email || member}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Select the users who should be members of this project.
                </p>
                <MultiSelect
                  options={users.map((u) => ({
                    id: u.id,
                    label: u.displayName || u.email,
                    email: u.email,
                  }))}
                  selected={members}
                  onChange={setMembers}
                  placeholder="Select team members..."
                />
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {saveState === 'saved' && !updateProject.isPending && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-semibold">Changes saved successfully</span>
                </div>
              )}
              {saveState === 'error' && !updateProject.isPending && (
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm font-semibold">Error while saving</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              variant={saveState === 'saved' ? 'secondary' : 'primary'}
              size="lg"
              isLoading={updateProject.isPending || saveState === 'saving'}
              className="min-w-[160px]"
            >
              {saveState === 'saved' && !updateProject.isPending
                ? 'Saved'
                : saveState === 'saving' || updateProject.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ProjectPage;

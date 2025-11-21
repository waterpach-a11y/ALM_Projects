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

  React.useEffect(() => {
    if (project) {
      setName(project.name ?? '');
      setDescription(project.description ?? '');
      setStatus(project.projectStatus ?? 'planned');
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
    await updateProject.mutateAsync({
      projectId: id,
      data: {
        name,
        description,
        projectStatus: status,
        members,
        ...(deadline ? { deadline: new Date(deadline) } : {}),
      },
    });
  };

  const statusConfig = {
    planned: { variant: 'default' as const, label: 'Planned' },
    in_progress: { variant: 'info' as const, label: 'In Progress' },
    blocked: { variant: 'error' as const, label: 'Blocked' },
    closed: { variant: 'success' as const, label: 'Closed' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Settings</h1>
          <p className="text-slate-600 font-medium">Manage project information and configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* General Information */}
        <Card>
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
          </div>
        </Card>

        {/* Status and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
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

          <Card>
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
        <Card>
          <SectionTitle>Team Members</SectionTitle>
          <div className="mt-6 space-y-4">
            {usersLoading ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : usersError || !users ? (
              <div className="mt-2">
                <div className="text-sm text-slate-500 py-4">
                  Team members are currently read-only.
                </div>
                {project.members && project.members.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {project.members.map((member) => (
                      <div
                        key={member}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <Avatar name={member} size="sm" />
                        <span className="text-sm font-medium text-slate-700">{member}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-600 mb-2">
                  Select the users who should be members of this project.
                </p>
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={members.includes(u.id)}
                      onChange={() => {
                        setMembers((prev) =>
                          prev.includes(u.id)
                            ? prev.filter((id) => id !== u.id)
                            : [...prev, u.id],
                        );
                      }}
                    />
                    <Avatar name={u.email} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {u.displayName || u.email}
                      </div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </div>
                  </label>
                ))}
                {users.length === 0 && (
                  <div className="text-sm text-slate-500 py-4">No users available to assign as members.</div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={updateProject.isPending}
            className="min-w-[140px]"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectPage;

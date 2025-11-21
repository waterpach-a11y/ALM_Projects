import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from './useCreateProject';
import { useProjectManagers } from '../users/useUsers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField, Input, Textarea, Select } from '../../components/ui/FormField';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Loader } from '../../components/ui/Loader';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../auth/AuthContext';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProject = useCreateProject();
  const { data: projectManagers, isLoading: managersLoading } = useProjectManagers();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState(user?.uid || '');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerId) return;

    await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      ownerId,
      members: selectedMembers.length > 0 ? [...selectedMembers, ownerId] : [ownerId],
    });
  };

  const toggleMember = (userId: string) => {
    if (userId === ownerId) return; // Can't remove owner
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Project</h1>
        <p className="text-slate-600 font-medium">Create a new project and assign a project lead</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Project Lead */}
        <Card>
          <SectionTitle>Project Lead</SectionTitle>
          <div className="mt-6 space-y-4">
            <FormField label="Select Project Lead" required>
              {managersLoading ? (
                <div className="flex justify-center py-4">
                  <Loader />
                </div>
              ) : (
                <Select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required>
                  <option value="">Select a project lead</option>
                  {projectManagers?.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.displayName || manager.email} ({manager.roles.join(', ')})
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            {ownerId && projectManagers && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <Avatar name={projectManagers.find((m) => m.id === ownerId)?.email || ''} size="md" />
                <div>
                  <div className="font-medium text-slate-900">
                    {projectManagers.find((m) => m.id === ownerId)?.displayName ||
                      projectManagers.find((m) => m.id === ownerId)?.email}
                  </div>
                  <div className="text-sm text-slate-500">
                    {projectManagers.find((m) => m.id === ownerId)?.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Team Members (Optional) */}
        <Card>
          <SectionTitle>Team Members (Optional)</SectionTitle>
          <div className="mt-6">
            <p className="text-sm text-slate-600 mb-4">
              Select additional team members to add to the project
            </p>
            {managersLoading ? (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            ) : (
              <div className="space-y-2">
                {projectManagers
                  ?.filter((m) => m.id !== ownerId)
                  .map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <Avatar name={member.email} size="sm" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {member.displayName || member.email}
                        </div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                      </div>
                    </label>
                  ))}
                {(!projectManagers || projectManagers.filter((m) => m.id !== ownerId).length === 0) && (
                  <div className="text-sm text-slate-500 py-4 text-center">
                    No additional team members available
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/app')}
            className="min-w-[140px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={createProject.isPending}
            disabled={!name.trim() || !ownerId}
            className="min-w-[140px]"
          >
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;


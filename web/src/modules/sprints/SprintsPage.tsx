import React, { useState } from 'react';
import { useProjectStore } from '../projects/useProjectStore';
import { useSprints, useCreateSprint, useUpdateSprint, useDeleteSprint } from './useSprints';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Textarea, Select } from '../../components/ui/FormField';
import { useAuth } from '../auth/AuthContext';
import { EditSprintModal } from '../../components/forms/EditSprintModal';
import { Sprint } from './useSprints';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const SprintsPage: React.FC = () => {
  const { currentProjectId } = useProjectStore();
  const { user } = useAuth();
  const { data: sprints, isLoading } = useSprints(currentProjectId);
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'planned' | 'active' | 'done'>('planned');

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProjectId || !name.trim()) return;
    await createSprint.mutateAsync({
      projectId: currentProjectId,
      name: name.trim(),
      goal: goal.trim() || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
    setIsCreateModalOpen(false);
    setName('');
    setGoal('');
    setStartDate('');
    setEndDate('');
    setStatus('planned');
  };

  if (!currentProjectId) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">Select a project in the header to view sprints.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Sprints</h1>
          <p className="text-slate-600 font-medium">Manage project sprints</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} size="md">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Sprint
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : sprints && sprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => {
            const statusConfig = {
              planned: { variant: 'default' as const, label: 'Planned' },
              active: { variant: 'info' as const, label: 'Active' },
              done: { variant: 'success' as const, label: 'Done' },
            };
            const config = statusConfig[sprint.status];

            return (
              <Card key={sprint.id} hover className="bg-gradient-to-br from-white to-slate-50/30 border-2 border-slate-300 shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{sprint.name}</h3>
                    {sprint.goal && (
                      <p className="text-sm text-slate-600 line-clamp-2">{sprint.goal}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingSprint(sprint)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit sprint"
                      >
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingSprintId(sprint.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete sprint"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {sprint.startDate?.toDate && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Start:</span>
                      <span>{sprint.startDate.toDate().toLocaleDateString()}</span>
                    </div>
                  )}
                  {sprint.endDate?.toDate && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">End:</span>
                      <span>{sprint.endDate.toDate().toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-white to-slate-50/30">
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="No sprints yet"
            description="Create your first sprint to start organizing your work in time-boxed iterations"
            action={{
              label: 'Create Sprint',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        </Card>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Sprint"
        size="md"
      >
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <FormField label="Sprint Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint 1"
              required
            />
          </FormField>
          <FormField label="Goal">
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Sprint goal..."
              rows={3}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="End Date">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createSprint.isPending}>
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>

          {currentProjectId && (
            <>
              <EditSprintModal
                isOpen={!!editingSprint}
                onClose={() => setEditingSprint(null)}
                sprint={editingSprint}
                projectId={currentProjectId}
              />
              <ConfirmDialog
                isOpen={!!deletingSprintId}
                onClose={() => setDeletingSprintId(null)}
                onConfirm={async () => {
                  if (deletingSprintId && currentProjectId) {
                    await deleteSprint.mutateAsync({ projectId: currentProjectId, sprintId: deletingSprintId });
                    setDeletingSprintId(null);
                  }
                }}
                title="Delete Sprint"
                message="Are you sure you want to delete this sprint? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={deleteSprint.isPending}
              />
            </>
          )}
        </div>
      );
    };
    
    export default SprintsPage;


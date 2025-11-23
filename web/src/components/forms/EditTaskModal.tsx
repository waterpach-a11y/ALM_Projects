import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, Input, Textarea, Select } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Task, useUpdateTask } from '../../modules/backlog/useTasks';
import { useAuth } from '../../modules/auth/AuthContext';
import { useProjectMembers } from '../../modules/projects/useProjectMembers';
import { TaskResultsModal } from './TaskResultsModal';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, projectId }) => {
  const { user } = useAuth();
  const updateTask = useUpdateTask();
  const { data: projectMembers } = useProjectMembers(projectId);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [timeSpent, setTimeSpent] = useState<number | undefined>();
  const [remainingHours, setRemainingHours] = useState<number | undefined>();
  const [assignedTo, setAssignedTo] = useState('');
  const [tags, setTags] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [reviewRequested, setReviewRequested] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setEstimatedHours(task.estimatedHours);
      setTimeSpent(task.timeSpent);
      setRemainingHours(task.remainingHours);
      
      // Match assignedTo with project member (by email or ID)
      if (task.assignedTo && projectMembers) {
        const member = projectMembers.find(
          (m) => m.id === task.assignedTo || m.email === task.assignedTo
        );
        setAssignedTo(member ? (member.email || member.id) : task.assignedTo);
      } else {
        setAssignedTo('');
      }
      
      setTags(task.tags?.join(', ') || '');
      setBlocked(task.blocked || false);
      setBlockedReason(task.blockedReason || '');
      setReviewRequested(task.reviewRequested || false);
    }
  }, [task, projectMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !projectId) return;
    
    const tagsArray = tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        title,
        description,
        status,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        timeSpent: timeSpent ? Number(timeSpent) : undefined,
        remainingHours: remainingHours ? Number(remainingHours) : undefined,
        assignedTo: assignedTo || undefined,
        tags: tagsArray,
        blocked,
        blockedReason: blocked ? blockedReason : undefined,
        reviewRequested,
        ownerId: user?.uid || undefined,
      },
    });
    onClose();
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Title" required>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </Select>
          </FormField>
          <FormField label="Assigned To">
            <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {projectMembers?.map((member) => (
                <option key={member.id} value={member.email || member.id}>
                  {member.displayName || member.email} {member.displayName ? `(${member.email})` : ''}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Estimated Hours">
            <Input
              type="number"
              min="0"
              value={estimatedHours || ''}
              onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
            />
          </FormField>
          <FormField label="Time Spent">
            <Input
              type="number"
              min="0"
              value={timeSpent || ''}
              onChange={(e) => setTimeSpent(e.target.value ? Number(e.target.value) : undefined)}
            />
          </FormField>
          <FormField label="Remaining Hours">
            <Input
              type="number"
              min="0"
              value={remainingHours || ''}
              onChange={(e) => setRemainingHours(e.target.value ? Number(e.target.value) : undefined)}
            />
          </FormField>
        </div>
        <FormField label="Tags (comma separated)">
          <Input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </FormField>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => setBlocked(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">Blocked</span>
          </label>
          {blocked && (
            <FormField label="Blocked Reason">
              <Textarea
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                rows={2}
                placeholder="Why is this task blocked?"
              />
            </FormField>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reviewRequested}
              onChange={(e) => setReviewRequested(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">Review Requested</span>
          </label>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="info"
            onClick={() => {
              setShowResultsModal(true);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Results & Comments
            {task && ((task.results && task.results.length > 0) || (task.comments && task.comments.length > 0) || (task.attachments && task.attachments.length > 0)) && (
              <Badge variant="primary" size="sm" className="ml-2">
                {((task.results?.length || 0) + (task.comments?.length || 0) + (task.attachments?.length || 0))}
              </Badge>
            )}
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateTask.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
      {task && (
        <TaskResultsModal
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          task={task}
          projectId={projectId}
        />
      )}
    </Modal>
  );
};


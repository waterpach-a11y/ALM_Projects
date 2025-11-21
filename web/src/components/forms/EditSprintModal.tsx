import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, Input, Textarea, Select } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Sprint, useUpdateSprint } from '../../modules/sprints/useSprints';

interface EditSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  projectId: string;
}

export const EditSprintModal: React.FC<EditSprintModalProps> = ({ isOpen, onClose, sprint, projectId }) => {
  const updateSprint = useUpdateSprint();
  
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'planned' | 'active' | 'done'>('planned');

  useEffect(() => {
    if (sprint) {
      setName(sprint.name || '');
      setGoal(sprint.goal || '');
      setStatus(sprint.status || 'planned');
      if (sprint.startDate?.toDate) {
        const date = sprint.startDate.toDate() as Date;
        setStartDate(date.toISOString().slice(0, 10));
      } else {
        setStartDate('');
      }
      if (sprint.endDate?.toDate) {
        const date = sprint.endDate.toDate() as Date;
        setEndDate(date.toISOString().slice(0, 10));
      } else {
        setEndDate('');
      }
    }
  }, [sprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint || !projectId) return;
    
    await updateSprint.mutateAsync({
      projectId,
      sprintId: sprint.id,
      updates: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
      },
    });
    onClose();
  };

  if (!sprint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Sprint" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Sprint Name" required>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Goal">
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={updateSprint.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};


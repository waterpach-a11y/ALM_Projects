import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, Input, Textarea, Select } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Epic, useUpdateEpic } from '../../modules/backlog/useEpics';
import { useAuth } from '../../modules/auth/AuthContext';
import { useProjectMembers } from '../../modules/projects/useProjectMembers';

interface EditEpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  epic: Epic | null;
  projectId: string;
}

export const EditEpicModal: React.FC<EditEpicModalProps> = ({ isOpen, onClose, epic, projectId }) => {
  const { user } = useAuth();
  const updateEpic = useUpdateEpic();
  const { data: projectMembers } = useProjectMembers(projectId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState('todo');
  const [businessValue, setBusinessValue] = useState<number | undefined>();
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | undefined>();
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (epic) {
      setTitle(epic.title || '');
      setDescription(epic.description || '');
      setPriority((epic.priority as 'low' | 'medium' | 'high') || 'medium');
      setStatus(epic.status || 'todo');
      setBusinessValue(epic.businessValue);
      setRiskLevel(epic.riskLevel);
      
      // Match assignedTo with project member (by email or ID)
      if (epic.assignedTo && projectMembers) {
        const member = projectMembers.find(
          (m) => m.id === epic.assignedTo || m.email === epic.assignedTo
        );
        setAssignedTo(member ? (member.email || member.id) : epic.assignedTo);
      } else {
        setAssignedTo('');
      }
      
      if (epic.dueDate?.toDate) {
        const date = epic.dueDate.toDate() as Date;
        setDueDate(date.toISOString().slice(0, 10));
      } else {
        setDueDate('');
      }
    }
  }, [epic, projectMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epic || !projectId) return;
    
    await updateEpic.mutateAsync({
      projectId,
      epicId: epic.id,
      updates: {
        title,
        description,
        priority,
        status,
        businessValue: businessValue ? Number(businessValue) : undefined,
        riskLevel,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || undefined,
        ownerId: user?.uid || undefined,
      },
    });
    onClose();
  };

  if (!epic) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Epic" size="lg">
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
          <FormField label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Business Value (0-100)">
            <Input
              type="number"
              min="0"
              max="100"
              value={businessValue || ''}
              onChange={(e) => setBusinessValue(e.target.value ? Number(e.target.value) : undefined)}
            />
          </FormField>
          <FormField label="Risk Level">
            <Select value={riskLevel || ''} onChange={(e) => setRiskLevel(e.target.value || undefined)}>
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Due Date">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
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
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={updateEpic.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};


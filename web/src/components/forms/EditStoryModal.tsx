import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, Input, Textarea, Select } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Story, useUpdateStory } from '../../modules/backlog/useStories';
import { useAuth } from '../../modules/auth/AuthContext';
import { useProjectMembers } from '../../modules/projects/useProjectMembers';

interface EditStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  projectId: string;
}

export const EditStoryModal: React.FC<EditStoryModalProps> = ({ isOpen, onClose, story, projectId }) => {
  const { user } = useAuth();
  const updateStory = useUpdateStory();
  const { data: projectMembers } = useProjectMembers(projectId);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyPoints, setStoryPoints] = useState(1);
  const [status, setStatus] = useState('todo');
  const [businessValue, setBusinessValue] = useState<number | undefined>();
  const [complexity, setComplexity] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | undefined>();
  const [sprintNumber, setSprintNumber] = useState<number | undefined>();
  const [assignedTo, setAssignedTo] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');

  useEffect(() => {
    if (story) {
      setTitle(story.title || '');
      setDescription(story.description || '');
      setStoryPoints(story.storyPoints || 1);
      setStatus(story.status || 'todo');
      setBusinessValue(story.businessValue);
      setComplexity(story.complexity);
      setSprintNumber(story.sprintNumber);
      
      // Match assignedTo with project member (by email or ID)
      if (story.assignedTo && projectMembers) {
        const member = projectMembers.find(
          (m) => m.id === story.assignedTo || m.email === story.assignedTo
        );
        setAssignedTo(member ? (member.email || member.id) : story.assignedTo);
      } else {
        setAssignedTo('');
      }
      
      setAcceptanceCriteria(story.acceptanceCriteria?.join('\n') || '');
    }
  }, [story, projectMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !projectId) return;
    
    const criteria = acceptanceCriteria
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    
    await updateStory.mutateAsync({
      projectId,
      storyId: story.id,
      updates: {
        title,
        description,
        storyPoints: Number(storyPoints),
        status,
        businessValue: businessValue ? Number(businessValue) : undefined,
        complexity,
        sprintNumber: sprintNumber ? Number(sprintNumber) : undefined,
        assignedTo: assignedTo || undefined,
        acceptanceCriteria: criteria,
        ownerId: user?.uid || undefined,
      },
    });
    onClose();
  };

  if (!story) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Story" size="lg">
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
          <FormField label="Story Points">
            <Input
              type="number"
              min="1"
              value={storyPoints}
              onChange={(e) => setStoryPoints(Number(e.target.value))}
            />
          </FormField>
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Business Value">
            <Input
              type="number"
              value={businessValue || ''}
              onChange={(e) => setBusinessValue(e.target.value ? Number(e.target.value) : undefined)}
            />
          </FormField>
          <FormField label="Complexity">
            <Select value={complexity || ''} onChange={(e) => setComplexity(e.target.value || undefined)}>
              <option value="">None</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sprint Number">
            <Input
              type="number"
              min="1"
              value={sprintNumber || ''}
              onChange={(e) => setSprintNumber(e.target.value ? Number(e.target.value) : undefined)}
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
        <FormField label="Acceptance Criteria (one per line)">
          <Textarea
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            rows={4}
            placeholder="Enter acceptance criteria, one per line"
          />
        </FormField>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={updateStory.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};


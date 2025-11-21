import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, Input, Textarea, Select } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Requirement, useUpdateRequirement } from '../../modules/backlog/useRequirements';

interface EditRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  projectId: string;
}

export const EditRequirementModal: React.FC<EditRequirementModalProps> = ({ isOpen, onClose, requirement, projectId }) => {
  const updateRequirement = useUpdateRequirement();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [priority, setPriority] = useState('medium');
  const [requirementType, setRequirementType] = useState<'functional' | 'technical' | 'compliance' | undefined>();
  const [testCases, setTestCases] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (requirement) {
      setTitle(requirement.title || '');
      setDescription(requirement.description || '');
      setAcceptanceCriteria(requirement.acceptanceCriteria?.join('\n') || '');
      setPriority(requirement.priority || 'medium');
      setRequirementType(requirement.requirementType);
      setTestCases(requirement.testCases?.join('\n') || '');
      setVerified(requirement.verified || false);
    }
  }, [requirement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement || !projectId) return;
    
    const criteria = acceptanceCriteria
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    
    const cases = testCases
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    
    await updateRequirement.mutateAsync({
      projectId,
      requirementId: requirement.id,
      title,
      description,
      acceptanceCriteria: criteria,
      priority,
      requirementType,
      testCases: cases,
      verified,
    });
    onClose();
  };

  if (!requirement) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Requirement" size="lg">
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
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>
          <FormField label="Requirement Type">
            <Select value={requirementType || ''} onChange={(e) => setRequirementType(e.target.value || undefined)}>
              <option value="">None</option>
              <option value="functional">Functional</option>
              <option value="technical">Technical</option>
              <option value="compliance">Compliance</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Acceptance Criteria (one per line)" required>
          <Textarea
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            rows={4}
            placeholder="Enter acceptance criteria, one per line"
            required
          />
        </FormField>
        <FormField label="Test Cases (one per line)">
          <Textarea
            value={testCases}
            onChange={(e) => setTestCases(e.target.value)}
            rows={4}
            placeholder="Enter test cases, one per line"
          />
        </FormField>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">Verified</span>
        </label>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={updateRequirement.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};


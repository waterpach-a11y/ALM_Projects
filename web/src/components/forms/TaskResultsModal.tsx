import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, Textarea, Input } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Task, TaskResult, useUpdateTask } from '../../modules/backlog/useTasks';
import { useAuth } from '../../modules/auth/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { useUsers } from '../../modules/users/useUsers';

interface TaskResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
}

export const TaskResultsModal: React.FC<TaskResultsModalProps> = ({ isOpen, onClose, task, projectId }) => {
  const { user } = useAuth();
  const updateTask = useUpdateTask();
  const { data: users } = useUsers();
  
  const [newResultComment, setNewResultComment] = useState('');
  const [newResult, setNewResult] = useState('');
  const [newResultAttachmentUrl, setNewResultAttachmentUrl] = useState('');
  const [newResultAttachmentName, setNewResultAttachmentName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  const taskResults = task?.results || [];
  const taskComments = task?.comments || [];
  const taskAttachments = task?.attachments || [];

  const handleAddResult = async () => {
    if (!task || !projectId) return;
    
    const newResultEntry: TaskResult = {
      comment: newResultComment.trim() || undefined,
      result: newResult.trim() || undefined,
      attachmentUrl: newResultAttachmentUrl.trim() || undefined,
      attachmentName: newResultAttachmentName.trim() || undefined,
      createdAt: Timestamp.now(),
      createdBy: user?.uid || user?.email || 'Unknown',
    };

    const updatedResults = [...taskResults, newResultEntry];
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        results: updatedResults,
      },
    });

    // Reset form
    setNewResultComment('');
    setNewResult('');
    setNewResultAttachmentUrl('');
    setNewResultAttachmentName('');
  };

  const handleAddComment = async () => {
    if (!task || !projectId || !newComment.trim()) return;
    
    const updatedComments = [...taskComments, newComment.trim()];
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        comments: updatedComments,
      },
    });

    setNewComment('');
  };

  const handleAddAttachment = async () => {
    if (!task || !projectId || !newAttachmentUrl.trim()) return;
    
    const newAttachment = {
      url: newAttachmentUrl.trim(),
      name: newAttachmentName.trim() || 'Attachment',
      uploadedAt: Timestamp.now(),
    };

    const updatedAttachments = [...taskAttachments, newAttachment];
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        attachments: updatedAttachments,
      },
    });

    setNewAttachmentUrl('');
    setNewAttachmentName('');
  };

  const handleDeleteResult = async (index: number) => {
    if (!task || !projectId) return;
    
    const updatedResults = taskResults.filter((_, i) => i !== index);
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        results: updatedResults,
      },
    });
  };

  const handleDeleteComment = async (index: number) => {
    if (!task || !projectId) return;
    
    const updatedComments = taskComments.filter((_, i) => i !== index);
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        comments: updatedComments,
      },
    });
  };

  const handleDeleteAttachment = async (index: number) => {
    if (!task || !projectId) return;
    
    const updatedAttachments = taskAttachments.filter((_, i) => i !== index);
    
    await updateTask.mutateAsync({
      projectId,
      taskId: task.id,
      updates: {
        attachments: updatedAttachments,
      },
    });
  };

  const getUserName = (userId?: string) => {
    if (!userId || !users) return userId || 'Unknown';
    const user = users.find((u) => u.id === userId || u.email === userId);
    return user?.displayName || user?.email || userId;
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Task Results: ${task.title}`} size="xl">
      <div className="space-y-6">
        {/* Results Section */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Results
          </h3>
          <div className="space-y-3 mb-4">
            {taskResults.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No results yet</p>
            ) : (
              taskResults.map((result, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={getUserName(result.createdBy)} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{getUserName(result.createdBy)}</p>
                        {result.createdAt?.toDate && (
                          <p className="text-xs text-slate-500">
                            {result.createdAt.toDate().toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteResult(index)}
                      className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete result"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {result.comment && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-slate-700 mb-1">Comment:</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{result.comment}</p>
                    </div>
                  )}
                  {result.result && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-slate-700 mb-1">Result:</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{result.result}</p>
                    </div>
                  )}
                  {result.attachmentUrl && (
                    <div>
                      <a
                        href={result.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                        </svg>
                        {result.attachmentName || 'View Attachment'}
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
            <h4 className="font-medium text-slate-900 mb-3">Add New Result</h4>
            <div className="space-y-3">
              <FormField label="Comment">
                <Textarea
                  value={newResultComment}
                  onChange={(e) => setNewResultComment(e.target.value)}
                  rows={2}
                  placeholder="Add a comment about the result..."
                />
              </FormField>
              <FormField label="Result">
                <Textarea
                  value={newResult}
                  onChange={(e) => setNewResult(e.target.value)}
                  rows={3}
                  placeholder="Describe the result or outcome..."
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Attachment URL">
                  <Input
                    type="url"
                    value={newResultAttachmentUrl}
                    onChange={(e) => setNewResultAttachmentUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </FormField>
                <FormField label="Attachment Name">
                  <Input
                    type="text"
                    value={newResultAttachmentName}
                    onChange={(e) => setNewResultAttachmentName(e.target.value)}
                    placeholder="Document name"
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddResult}
                isLoading={updateTask.isPending}
                disabled={!newResultComment.trim() && !newResult.trim() && !newResultAttachmentUrl.trim()}
              >
                Add Result
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments
          </h3>
          <div className="space-y-2 mb-4">
            {taskComments.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No comments yet</p>
            ) : (
              taskComments.map((comment, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200 flex items-start justify-between">
                  <p className="text-sm text-slate-700 flex-1">{comment}</p>
                  <button
                    onClick={() => handleDeleteComment(index)}
                    className="p-1 rounded-lg hover:bg-red-50 transition-colors ml-2"
                    title="Delete comment"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleAddComment}
              isLoading={updateTask.isPending}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
            </svg>
            Attachments
          </h3>
          <div className="space-y-2 mb-4">
            {taskAttachments.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No attachments yet</p>
            ) : (
              taskAttachments.map((attachment, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200 flex items-center justify-between">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 flex-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{attachment.name}</span>
                    {attachment.uploadedAt?.toDate && (
                      <span className="text-xs text-slate-500">
                        ({attachment.uploadedAt.toDate().toLocaleDateString()})
                      </span>
                    )}
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(index)}
                    className="p-1 rounded-lg hover:bg-red-50 transition-colors ml-2"
                    title="Delete attachment"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Attachment URL">
              <Input
                type="url"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="https://..."
              />
            </FormField>
            <FormField label="Attachment Name">
              <Input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="Document name"
              />
            </FormField>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddAttachment}
            isLoading={updateTask.isPending}
            disabled={!newAttachmentUrl.trim()}
            className="mt-2"
          >
            Add Attachment
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};


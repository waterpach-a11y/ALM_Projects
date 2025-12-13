import React from 'react';
import { Modal } from '../ui/Modal';
import { Task } from '../../modules/backlog/useTasks';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { EditTaskModal } from './EditTaskModal';
import { useQueryClient } from '@tanstack/react-query';
import { useTraceability } from '../../modules/dashboard/useTraceability';

interface TasksFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tasks: Task[];
  projectId: string;
  epicTitle?: string;
  storyTitle?: string;
  // Filter criteria to refetch data
  filterCriteria?: {
    epicId?: string;
    storyId?: string;
    status?: string;
    testStatus?: string;
    blocked?: boolean;
  };
}

export const TasksFilterModal: React.FC<TasksFilterModalProps> = ({
  isOpen,
  onClose,
  title,
  tasks: initialTasks,
  projectId,
  epicTitle,
  storyTitle,
  filterCriteria,
}) => {
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [taskIds] = React.useState<Set<string>>(new Set(initialTasks.map(t => t.id)));
  const queryClient = useQueryClient();
  const { data: traceabilityData } = useTraceability(projectId);
  
  // Get fresh tasks from traceability data if available, otherwise use initialTasks
  const tasks = React.useMemo(() => {
    // If we have traceability data, use fresh data
    if (traceabilityData) {
      // If we have filter criteria, filter from traceability data
      if (filterCriteria) {
        let filtered = traceabilityData.tasks;
        
        if (filterCriteria.epicId) {
          const epicStories = traceabilityData.stories.filter(s => s.epicId === filterCriteria.epicId);
          const storyIds = epicStories.map(s => s.id);
          filtered = filtered.filter(t => storyIds.includes(t.storyId));
        }
        
        if (filterCriteria.storyId) {
          filtered = filtered.filter(t => t.storyId === filterCriteria.storyId);
        }
        
        if (filterCriteria.status) {
          filtered = filtered.filter(t => t.status === filterCriteria.status);
        }
        
        if (filterCriteria.testStatus !== undefined) {
          if (filterCriteria.testStatus === 'not_tested') {
            filtered = filtered.filter(t => !t.testStatus || t.testStatus === 'not_tested');
          } else {
            filtered = filtered.filter(t => t.testStatus === filterCriteria.testStatus);
          }
        }
        
        if (filterCriteria.blocked !== undefined) {
          filtered = filtered.filter(t => t.blocked === filterCriteria.blocked);
        }
        
        return filtered;
      } else {
        // If no filter criteria, match tasks by ID from initialTasks
        const updatedTasks = traceabilityData.tasks.filter(t => taskIds.has(t.id));
        return updatedTasks.length > 0 ? updatedTasks : initialTasks;
      }
    }
    
    // Fallback to initialTasks if no traceability data
    return initialTasks;
  }, [traceabilityData, filterCriteria, initialTasks, taskIds]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
      todo: { variant: 'default', label: 'Todo' },
      in_progress: { variant: 'info', label: 'In Progress' },
      review: { variant: 'warning', label: 'Review' },
      done: { variant: 'success', label: 'Done' },
      blocked: { variant: 'error', label: 'Blocked' },
    };
    const config = statusConfig[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getTestStatusBadge = (testStatus?: string) => {
    if (!testStatus || testStatus === 'not_tested') return null;
    const testStatusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
      in_progress: { variant: 'info', label: 'Test In Progress' },
      tested: { variant: 'default', label: 'Tested' },
      passed: { variant: 'success', label: 'Passed' },
      failed: { variant: 'error', label: 'Failed' },
      rejected: { variant: 'warning', label: 'Rejected' },
    };
    const config = testStatusConfig[testStatus] || { variant: 'default' as const, label: testStatus };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
        <div className="space-y-4">
          {(epicTitle || storyTitle) && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              {epicTitle && (
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">Epic:</span> {epicTitle}
                </div>
              )}
              {storyTitle && (
                <div className="text-sm text-slate-600 mt-1">
                  <span className="font-semibold">Story:</span> {storyTitle}
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-slate-600 mb-4">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </div>

          {tasks.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-slate-500">
                No tasks match this filter.
              </div>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  hover
                  className={`border-2 ${
                    task.blocked ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(task.status)}
                        {getTestStatusBadge(task.testStatus)}
                        {task.blocked && <Badge variant="error" size="sm">Blocked</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <Avatar name={task.assignedTo} size="sm" />
                        <span>{task.assignedTo}</span>
                      </div>
                    )}
                    {task.estimatedHours && (
                      <span>Est: {task.estimatedHours}h</span>
                    )}
                    {task.timeSpent && (
                      <span>Spent: {task.timeSpent}h</span>
                    )}
                    {task.remainingHours !== undefined && (
                      <span>Remaining: {task.remainingHours}h</span>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.map((tag, idx) => (
                          <Badge key={idx} size="sm" variant="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {task.blockedReason && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-xs text-red-700">
                        <span className="font-semibold">Blocked reason:</span> {task.blockedReason}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={async () => {
            setEditingTask(null);
            // Refetch traceability data after task update
            await queryClient.invalidateQueries({ queryKey: ['traceability', projectId] });
            await queryClient.refetchQueries({ queryKey: ['traceability', projectId] });
          }}
          task={editingTask}
          projectId={projectId}
        />
      )}
    </>
  );
};


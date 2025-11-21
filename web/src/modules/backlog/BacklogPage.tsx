import React, { useState, FormEvent } from 'react';
import { useProjectStore } from '../projects/useProjectStore';
import { useEpics, useCreateEpic, useUpdateEpic } from './useEpics';
import { useStories, useCreateStory, useUpdateStory } from './useStories';
import { useTasks, useCreateTask, useUpdateTask } from './useTasks';
import { useRequirements, useCreateRequirement } from './useRequirements';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, FormField } from '../../components/ui/FormField';
import { Avatar } from '../../components/ui/Avatar';
import { Loader } from '../../components/ui/Loader';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { EditEpicModal } from '../../components/forms/EditEpicModal';
import { EditStoryModal } from '../../components/forms/EditStoryModal';
import { EditTaskModal } from '../../components/forms/EditTaskModal';
import { EditRequirementModal } from '../../components/forms/EditRequirementModal';
import { useUpdateRequirement } from './useRequirements';
import { EmptyState } from '../../components/ui/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const BacklogPage: React.FC = () => {
  const { currentProjectId } = useProjectStore();

  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [newEpicTitle, setNewEpicTitle] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDescription, setNewReqDescription] = useState('');
  const [newReqAcceptance, setNewReqAcceptance] = useState('');

  const { data: epics, isLoading: epicsLoading } = useEpics(currentProjectId ?? null);
  const { data: stories, isLoading: storiesLoading } = useStories(currentProjectId ?? null, selectedEpicId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(currentProjectId ?? null, selectedStoryId);
  const { data: requirements } = useRequirements(currentProjectId ?? null, selectedTaskId);

  const createEpic = useCreateEpic();
  const createStory = useCreateStory();
  const createTask = useCreateTask();
  const createRequirement = useCreateRequirement();
  const updateEpic = useUpdateEpic();
  const updateStory = useUpdateStory();
  const updateTask = useUpdateTask();
  const updateRequirement = useUpdateRequirement();

  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);

  const handleCreateEpic = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProjectId || !newEpicTitle.trim()) return;
    await createEpic.mutateAsync({ projectId: currentProjectId, title: newEpicTitle.trim() });
    setNewEpicTitle('');
  };

  const handleStoryDragEnd = async (result: DropResult) => {
    if (!currentProjectId || !stories) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as string;
    const story = stories.find((s) => s.id === draggableId);
    if (!story || story.status === newStatus) return;

    await updateStory.mutateAsync({
      projectId: currentProjectId,
      storyId: story.id,
      updates: { status: newStatus },
    });
  };

  const handleCreateStory = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProjectId || !selectedEpicId || !newStoryTitle.trim()) return;
    await createStory.mutateAsync({ projectId: currentProjectId, epicId: selectedEpicId, title: newStoryTitle.trim() });
    setNewStoryTitle('');
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProjectId || !selectedStoryId || !newTaskTitle.trim()) return;
    await createTask.mutateAsync({ projectId: currentProjectId, storyId: selectedStoryId, title: newTaskTitle.trim() });
    setNewTaskTitle('');
  };

  const handleCreateRequirement = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProjectId || !selectedTaskId || !newReqTitle.trim()) return;
    const acceptanceCriteria = newReqAcceptance
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    await createRequirement.mutateAsync({
      projectId: currentProjectId,
      taskId: selectedTaskId,
      title: newReqTitle.trim(),
      description: newReqDescription.trim() || undefined,
      acceptanceCriteria,
      priority: 'medium',
    });
    setNewReqTitle('');
    setNewReqDescription('');
    setNewReqAcceptance('');
  };

  if (!currentProjectId) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500">Select a project in the header to work on the backlog.</p>
        </div>
      </Card>
    );
  }

  // Calculate progress for epics
  const getEpicProgress = (epicId: string) => {
    const epicStories = stories?.filter((s) => s.epicId === epicId) || [];
    const doneStories = epicStories.filter((s) => s.status === 'done').length;
    return epicStories.length > 0 ? Math.round((doneStories / epicStories.length) * 100) : 0;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Backlog</h1>
        <p className="text-slate-600 font-medium">Manage epics, stories, and tasks</p>
      </div>

      {/* Epics Section */}
      <div>
        <SectionTitle>Epics</SectionTitle>
        {epicsLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {epics?.map((epic) => {
              const progress = getEpicProgress(epic.id);
              const isSelected = epic.id === selectedEpicId;
              return (
                <Card
                  key={epic.id}
                  hover
                  className={`transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedEpicId(epic.id);
                        setSelectedStoryId(null);
                        setSelectedTaskId(null);
                      }}
                    >
                      <h3 className="font-semibold text-slate-900">{epic.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={epic.priority === 'high' ? 'error' : epic.priority === 'medium' ? 'warning' : 'success'}>
                        {epic.priority}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEpic(epic);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit epic"
                      >
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={epic.status === 'done' ? 'success' : epic.status === 'in_progress' ? 'info' : 'default'}>
                        {epic.status}
                      </Badge>
                      {epic.businessValue && (
                        <span className="text-xs text-slate-500">Value: {epic.businessValue}</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            {(!epics || epics.length === 0) && (
              <Card className="col-span-full">
                <EmptyState
                  icon={
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  title="No epics yet"
                  description="Create your first epic to start organizing your project work"
                />
              </Card>
            )}
          </div>
        )}

        <Card className="mt-4">
          <form onSubmit={handleCreateEpic} className="flex gap-2">
            <Input
              type="text"
              placeholder="New epic title"
              value={newEpicTitle}
              onChange={(e) => setNewEpicTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="md" isLoading={createEpic.isPending}>
              Add Epic
            </Button>
          </form>
        </Card>
      </div>

      {/* Stories and Tasks Section */}
      {selectedEpicId && (
        <DragDropContext onDragEnd={handleStoryDragEnd}>
          {/* Stories Section - Full Width */}
          <div>
            <SectionTitle>Stories</SectionTitle>
              {storiesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['todo', 'in_progress', 'review', 'done'].map((columnStatus) => {
                      const columnStories = stories?.filter((s) => s.status === columnStatus) ?? [];
                      return (
                        <div key={columnStatus} className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[200px]">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                              {columnStatus.replace('_', ' ')}
                            </span>
                            <Badge size="sm" variant="default">
                              {columnStories.length}
                            </Badge>
                          </div>
                          <Droppable droppableId={columnStatus}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex-1 space-y-2 min-h-[100px] rounded-lg p-2 transition-colors ${
                                  snapshot.isDraggingOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : ''
                                }`}
                              >
                                {columnStories.length === 0 && !snapshot.isDraggingOver && (
                                  <div className="text-center py-8 text-xs text-slate-400">
                                    No stories
                                  </div>
                                )}
                                {columnStories.map((story, index) => {
                                  const isSelected = story.id === selectedStoryId;
                                  return (
                                    <Draggable key={story.id} draggableId={story.id} index={index}>
                                      {(dragProvided, dragSnapshot) => (
                                        <Card
                                          hover
                                          ref={dragProvided.innerRef}
                                          {...dragProvided.draggableProps}
                                          {...dragProvided.dragHandleProps}
                                          className={`cursor-grab active:cursor-grabbing p-3 transition-all duration-200 ${
                                            isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : ''
                                          } ${
                                            dragSnapshot.isDragging
                                              ? 'shadow-lg scale-[1.02] border-indigo-300 bg-white rotate-2'
                                              : ''
                                          }`}
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <div
                                              className="flex-1 cursor-pointer"
                                              onClick={() => {
                                                setSelectedStoryId(story.id);
                                                setSelectedTaskId(null);
                                              }}
                                            >
                                              <h4 className="font-medium text-slate-900 text-sm">
                                                {story.title}
                                              </h4>
                                            </div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingStory(story);
                                              }}
                                              className="p-1 rounded hover:bg-slate-100 transition-colors ml-1"
                                              title="Edit story"
                                            >
                                              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                            <span className="font-medium">{story.storyPoints} pts</span>
                                            {story.assignedTo && (
                                              <div className="flex items-center gap-1">
                                                <Avatar name={story.assignedTo} size="sm" />
                                              </div>
                                            )}
                                            {story.complexity && (
                                              <Badge size="sm" variant="default">
                                                {story.complexity}
                                              </Badge>
                                            )}
                                          </div>
                                        </Card>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <Card className="mt-4">
              <form onSubmit={handleCreateStory} className="space-y-2">
                <Input
                  type="text"
                  placeholder="New story title"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  disabled={!selectedEpicId}
                />
                <Button type="submit" size="md" disabled={!selectedEpicId} isLoading={createStory.isPending} className="w-full">
                  Add Story
                </Button>
              </form>
            </Card>
          </div>

          {/* Tasks Section */}
          {selectedStoryId && (
            <div className="mt-6">
              <SectionTitle>Tasks</SectionTitle>
            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {tasks?.map((task) => {
                  const isSelected = task.id === selectedTaskId;
                  return (
                    <Card
                      key={task.id}
                      hover
                      className={`transition-all duration-200 ${
                        isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : ''
                      } ${task.blocked ? 'border-red-300 bg-red-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <h4 className="font-medium text-slate-900">{task.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.blocked && <Badge variant="error" size="sm">Blocked</Badge>}
                          <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'} size="sm">
                            {task.status}
                          </Badge>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit task"
                          >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Avatar name={task.assignedTo} size="sm" />
                            <span className="text-xs">{task.assignedTo}</span>
                          </div>
                        )}
                        {task.estimatedHours && <span className="text-xs">{task.estimatedHours}h</span>}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {task.tags.map((tag, idx) => (
                              <Badge key={idx} size="sm" variant="default">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
                {(!tasks || tasks.length === 0) && (
                  <Card>
                    <p className="text-sm text-slate-500 text-center py-4">No tasks yet for this story.</p>
                  </Card>
                )}
              </div>
            )}

              <Card className="mt-4">
                <form onSubmit={handleCreateTask} className="space-y-2">
                  <Input
                    type="text"
                    placeholder="New task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    disabled={!selectedStoryId}
                  />
                  <Button type="submit" size="md" disabled={!selectedStoryId} isLoading={createTask.isPending} className="w-full">
                    Add Task
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </DragDropContext>
      )}

      {/* Requirements Section */}
      {selectedTaskId && (
        <div>
          <SectionTitle>Requirements</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              {requirements?.map((req) => (
                <Card key={req.id} hover>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-900 flex-1">{req.title}</h4>
                    <button
                      onClick={() => setEditingRequirement(req)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit requirement"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  {req.description && <p className="text-sm text-slate-600 mb-2">{req.description}</p>}
                  {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                      {req.acceptanceCriteria.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                  {req.priority && (
                    <div className="mt-2">
                      <Badge variant={req.priority === 'high' ? 'error' : req.priority === 'medium' ? 'warning' : 'success'}>
                        {req.priority}
                      </Badge>
                    </div>
                  )}
                </Card>
              ))}
              {(!requirements || requirements.length === 0) && (
                <Card>
                  <p className="text-sm text-slate-500 text-center py-4">No requirements yet for this task.</p>
                </Card>
              )}
            </div>

            <Card>
              <form onSubmit={handleCreateRequirement} className="space-y-4">
                <FormField label="Title" required>
                  <Input
                    type="text"
                    placeholder="Requirement title"
                    value={newReqTitle}
                    onChange={(e) => setNewReqTitle(e.target.value)}
                  />
                </FormField>
                <FormField label="Description">
                  <Textarea
                    placeholder="Description (optional)"
                    value={newReqDescription}
                    onChange={(e) => setNewReqDescription(e.target.value)}
                    rows={3}
                  />
                </FormField>
                <FormField label="Acceptance Criteria" required>
                  <Textarea
                    placeholder="One criterion per line"
                    value={newReqAcceptance}
                    onChange={(e) => setNewReqAcceptance(e.target.value)}
                    rows={4}
                  />
                </FormField>
                <Button type="submit" size="md" isLoading={createRequirement.isPending} className="w-full">
                  Add Requirement
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {!selectedEpicId && (
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-500">Select an epic above to view and manage stories and tasks.</p>
          </div>
        </Card>
      )}

      {selectedEpicId && !selectedStoryId && (
        <Card>
          <div className="text-center py-8">
            <p className="text-slate-500">Select a story from the columns above to view and manage its tasks.</p>
          </div>
        </Card>
      )}

      {/* Edit Modals */}
      {currentProjectId && (
        <>
          <EditEpicModal
            isOpen={!!editingEpic}
            onClose={() => setEditingEpic(null)}
            epic={editingEpic}
            projectId={currentProjectId}
          />
          <EditStoryModal
            isOpen={!!editingStory}
            onClose={() => setEditingStory(null)}
            story={editingStory}
            projectId={currentProjectId}
          />
          <EditTaskModal
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            task={editingTask}
            projectId={currentProjectId}
          />
          <EditRequirementModal
            isOpen={!!editingRequirement}
            onClose={() => setEditingRequirement(null)}
            requirement={editingRequirement}
            projectId={currentProjectId}
          />
        </>
      )}
    </div>
  );
};

export default BacklogPage;

import React, { useState, FormEvent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../projects/useProjectStore';
import { useEpics, useCreateEpic, useUpdateEpic, useDeleteEpic } from './useEpics';
import { useStories, useCreateStory, useUpdateStory, useDeleteStory } from './useStories';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './useTasks';
import { useRequirements, useCreateRequirement, useDeleteRequirement } from './useRequirements';
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
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

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
  const { id: projectIdFromUrl } = useParams<{ id: string }>();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();
  const projectId = projectIdFromUrl || currentProjectId;

  // Update store when projectId comes from URL
  useEffect(() => {
    if (projectIdFromUrl && projectIdFromUrl !== currentProjectId) {
      setCurrentProjectId(projectIdFromUrl);
    }
  }, [projectIdFromUrl, currentProjectId, setCurrentProjectId]);

  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [newEpicTitle, setNewEpicTitle] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDescription, setNewReqDescription] = useState('');
  const [newReqAcceptance, setNewReqAcceptance] = useState('');

  const { data: epics, isLoading: epicsLoading } = useEpics(projectId ?? null);
  const { data: stories, isLoading: storiesLoading } = useStories(projectId ?? null, selectedEpicId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId ?? null, selectedStoryId);
  const { data: requirements } = useRequirements(projectId ?? null, selectedTaskId);

  const createEpic = useCreateEpic();
  const createStory = useCreateStory();
  const createTask = useCreateTask();
  const createRequirement = useCreateRequirement();
  const updateEpic = useUpdateEpic();
  const updateStory = useUpdateStory();
  const updateTask = useUpdateTask();
  const updateRequirement = useUpdateRequirement();
  const deleteEpic = useDeleteEpic();
  const deleteStory = useDeleteStory();
  const deleteTask = useDeleteTask();
  const deleteRequirement = useDeleteRequirement();

  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);

  // Delete confirmation states
  const [deletingEpicId, setDeletingEpicId] = useState<string | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletingRequirementId, setDeletingRequirementId] = useState<string | null>(null);

  const handleCreateEpic = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !newEpicTitle.trim()) return;
    await createEpic.mutateAsync({ projectId: projectId, title: newEpicTitle.trim() });
    setNewEpicTitle('');
  };

  const handleStoryDragEnd = async (result: DropResult) => {
    if (!projectId || !stories) return;
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
      projectId: projectId,
      storyId: story.id,
      updates: { status: newStatus },
    });
  };

  const handleCreateStory = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedEpicId || !newStoryTitle.trim()) return;
    await createStory.mutateAsync({ projectId: projectId, epicId: selectedEpicId, title: newStoryTitle.trim() });
    setNewStoryTitle('');
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedStoryId || !newTaskTitle.trim()) return;
    await createTask.mutateAsync({ projectId: projectId, storyId: selectedStoryId, title: newTaskTitle.trim() });
    setNewTaskTitle('');
  };

  const handleCreateRequirement = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedTaskId || !newReqTitle.trim()) return;
    const acceptanceCriteria = newReqAcceptance
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    await createRequirement.mutateAsync({
      projectId: projectId,
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

  if (!projectId) {
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
                  className={`transition-all duration-200 border-2 ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-lg' : 'border-slate-300 shadow-md'
                  }`}
                >
                  <div className="relative mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 cursor-pointer pr-8"
                        onClick={() => {
                          setSelectedEpicId(epic.id);
                          setSelectedStoryId(null);
                          setSelectedTaskId(null);
                        }}
                      >
                        <h3 className="font-semibold text-slate-900 mb-2">{epic.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={epic.priority === 'high' ? 'error' : epic.priority === 'medium' ? 'warning' : 'success'}>
                            {epic.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 absolute top-0 right-0">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingEpicId(epic.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete epic"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
                        <div key={columnStatus} className="flex flex-col bg-slate-50 border-2 border-slate-300 rounded-xl p-4 min-h-[200px] shadow-md">
                          <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-slate-300">
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
                                  snapshot.isDraggingOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-400' : ''
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
                                          className={`cursor-grab active:cursor-grabbing p-4 transition-all duration-200 border-2 ${
                                            isSelected ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-lg' : 'border-slate-300 shadow-md'
                                          } ${
                                            dragSnapshot.isDragging
                                              ? 'shadow-xl scale-[1.02] border-indigo-500 bg-white rotate-2'
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
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingStory(story);
                                                }}
                                                className="p-1 rounded hover:bg-slate-100 transition-colors"
                                                title="Edit story"
                                              >
                                                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setDeletingStoryId(story.id);
                                                }}
                                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Delete story"
                                              >
                                                <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                              </button>
                                            </div>
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
                      className={`transition-all duration-200 border-2 ${
                        isSelected ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-lg' : task.blocked ? 'border-red-400 bg-red-50 shadow-md' : 'border-slate-300 shadow-md'
                      }`}
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
                          <div className="flex items-center gap-1">
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingTaskId(task.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete task"
                            >
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
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
                <Card key={req.id} hover className="border-2 border-slate-300 shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-900 flex-1">{req.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingRequirement(req)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit requirement"
                      >
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingRequirementId(req.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete requirement"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
      {projectId && (
        <>
          <EditEpicModal
            isOpen={!!editingEpic}
            onClose={() => setEditingEpic(null)}
            epic={editingEpic}
            projectId={projectId}
          />
          <EditStoryModal
            isOpen={!!editingStory}
            onClose={() => setEditingStory(null)}
            story={editingStory}
            projectId={projectId}
          />
          <EditTaskModal
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            task={editingTask}
            projectId={projectId}
          />
          <EditRequirementModal
            isOpen={!!editingRequirement}
            onClose={() => setEditingRequirement(null)}
            requirement={editingRequirement}
            projectId={projectId}
          />

          {/* Delete Confirmation Dialogs */}
          {projectId && (
            <>
              <ConfirmDialog
                isOpen={!!deletingEpicId}
                onClose={() => setDeletingEpicId(null)}
                onConfirm={async () => {
                  if (deletingEpicId && projectId) {
                    await deleteEpic.mutateAsync({ projectId: projectId, epicId: deletingEpicId });
                    setDeletingEpicId(null);
                    if (selectedEpicId === deletingEpicId) {
                      setSelectedEpicId(null);
                      setSelectedStoryId(null);
                      setSelectedTaskId(null);
                    }
                  }
                }}
                title="Delete Epic"
                message="Are you sure you want to delete this epic? This will also delete all associated stories, tasks, and requirements. This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={deleteEpic.isPending}
              />
              <ConfirmDialog
                isOpen={!!deletingStoryId}
                onClose={() => setDeletingStoryId(null)}
                onConfirm={async () => {
                  if (deletingStoryId && projectId) {
                    await deleteStory.mutateAsync({ projectId: projectId, storyId: deletingStoryId });
                    setDeletingStoryId(null);
                    if (selectedStoryId === deletingStoryId) {
                      setSelectedStoryId(null);
                      setSelectedTaskId(null);
                    }
                  }
                }}
                title="Delete Story"
                message="Are you sure you want to delete this story? This will also delete all associated tasks and requirements. This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={deleteStory.isPending}
              />
              <ConfirmDialog
                isOpen={!!deletingTaskId}
                onClose={() => setDeletingTaskId(null)}
                onConfirm={async () => {
                  if (deletingTaskId && projectId) {
                    await deleteTask.mutateAsync({ projectId: projectId, taskId: deletingTaskId });
                    setDeletingTaskId(null);
                    if (selectedTaskId === deletingTaskId) {
                      setSelectedTaskId(null);
                    }
                  }
                }}
                title="Delete Task"
                message="Are you sure you want to delete this task? This will also delete all associated requirements. This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={deleteTask.isPending}
              />
              <ConfirmDialog
                isOpen={!!deletingRequirementId}
                onClose={() => setDeletingRequirementId(null)}
                onConfirm={async () => {
                  if (deletingRequirementId && projectId) {
                    await deleteRequirement.mutateAsync({ projectId: projectId, requirementId: deletingRequirementId });
                    setDeletingRequirementId(null);
                  }
                }}
                title="Delete Requirement"
                message="Are you sure you want to delete this requirement? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={deleteRequirement.isPending}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BacklogPage;

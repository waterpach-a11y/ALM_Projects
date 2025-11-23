import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Epic } from '../backlog/useEpics';
import { Story } from '../backlog/useStories';
import { Task } from '../backlog/useTasks';
import { Requirement } from '../backlog/useRequirements';

export interface TraceabilityData {
  epics: Epic[];
  stories: Story[];
  tasks: Task[];
  requirements: Requirement[];
  traceabilityMatrix: {
    epicToStories: Record<string, Story[]>;
    storyToTasks: Record<string, Task[]>;
    taskToRequirements: Record<string, Requirement[]>;
  };
}

export const useTraceability = (projectId: string | null) => {
  return useQuery<TraceabilityData | null>({
    queryKey: ['traceability', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return null;

      const [epicsSnap, storiesSnap, tasksSnap, requirementsSnap] = await Promise.all([
        getDocs(collection(db, 'projects', projectId, 'epics')),
        getDocs(collection(db, 'projects', projectId, 'stories')),
        getDocs(collection(db, 'projects', projectId, 'tasks')),
        getDocs(collection(db, 'projects', projectId, 'requirements')),
      ]);

      const epics: Epic[] = epicsSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title ?? 'Untitled epic',
          status: data.status ?? 'todo',
          priority: data.priority ?? 'medium',
          description: data.description,
          businessValue: data.businessValue,
          ownerId: data.ownerId,
          riskLevel: data.riskLevel,
          dueDate: data.dueDate,
          assignedTo: data.assignedTo,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      const stories: Story[] = storiesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          epicId: data.epicId ?? '',
          title: data.title ?? 'Untitled story',
          status: data.status ?? 'todo',
          storyPoints: typeof data.storyPoints === 'number' ? data.storyPoints : 1,
          assignedTo: data.assignedTo,
          businessValue: data.businessValue,
          complexity: data.complexity,
          ownerId: data.ownerId,
          sprintNumber: data.sprintNumber,
          acceptanceCriteria: data.acceptanceCriteria || [],
          description: data.description,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      const tasks: Task[] = tasksSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          storyId: data.storyId ?? '',
          title: data.title ?? 'Untitled task',
          status: data.status ?? 'todo',
          assignedTo: data.assignedTo,
          estimatedHours: data.estimatedHours,
          tags: data.tags || [],
          blocked: data.blocked || false,
          ownerId: data.ownerId,
          timeSpent: data.timeSpent,
          remainingHours: data.remainingHours,
          blockedReason: data.blockedReason,
          reviewRequested: data.reviewRequested || false,
          description: data.description,
          testStatus: data.testStatus || 'not_tested',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      const requirements: Requirement[] = requirementsSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          taskId: data.taskId,
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          acceptanceCriteria: data.acceptanceCriteria || [],
          priority: data.priority,
          requirementType: data.requirementType,
          testCases: data.testCases || [],
          verified: data.verified || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      // Build traceability matrix
      const epicToStories: Record<string, Story[]> = {};
      stories.forEach((story) => {
        if (story.epicId) {
          if (!epicToStories[story.epicId]) {
            epicToStories[story.epicId] = [];
          }
          epicToStories[story.epicId].push(story);
        }
      });

      const storyToTasks: Record<string, Task[]> = {};
      tasks.forEach((task) => {
        if (task.storyId) {
          if (!storyToTasks[task.storyId]) {
            storyToTasks[task.storyId] = [];
          }
          storyToTasks[task.storyId].push(task);
        }
      });

      const taskToRequirements: Record<string, Requirement[]> = {};
      requirements.forEach((req) => {
        if (req.taskId) {
          if (!taskToRequirements[req.taskId]) {
            taskToRequirements[req.taskId] = [];
          }
          taskToRequirements[req.taskId].push(req);
        }
      });

      return {
        epics,
        stories,
        tasks,
        requirements,
        traceabilityMatrix: {
          epicToStories,
          storyToTasks,
          taskToRequirements,
        },
      };
    },
  });
};


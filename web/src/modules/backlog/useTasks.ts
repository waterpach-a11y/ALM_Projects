import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, doc, getDocs, query, where, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface TaskResult {
  id?: string;
  comment?: string;
  result?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt?: any;
  createdBy?: string;
}

export type TestStatus = 'not_tested' | 'in_progress' | 'tested' | 'passed' | 'failed' | 'rejected';

export interface Task {
  id: string;
  storyId: string;
  title: string;
  status: string;
  assignedTo?: string;
  estimatedHours?: number;
  tags?: string[];
  blocked?: boolean;
  ownerId?: string;
  timeSpent?: number;
  remainingHours?: number;
  blockedReason?: string;
  reviewRequested?: boolean;
  description?: string;
  testStatus?: TestStatus;
  results?: TaskResult[];
  comments?: string[];
  attachments?: { url: string; name: string; uploadedAt?: any; size?: number; type?: string }[];
  createdAt?: any;
  updatedAt?: any;
}

export const useTasks = (projectId: string | null, storyId: string | null) => {
  return useQuery<Task[]>({
    queryKey: ['tasks', projectId, storyId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      const baseRef = collection(db, 'projects', projectId, 'tasks');
      const q = storyId ? query(baseRef, where('storyId', '==', storyId)) : baseRef;
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
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
          results: data.results || [],
          comments: data.comments || [],
          attachments: data.attachments || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
    },
  });
};

interface CreateTaskInput {
  projectId: string;
  storyId: string;
  title: string;
  description?: string;
  estimatedHours?: number;
  ownerId?: string;
  assignedTo?: string;
  tags?: string[];
  blocked?: boolean;
  blockedReason?: string;
  reviewRequested?: boolean;
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, storyId, title, description, estimatedHours, ownerId, assignedTo, tags, blocked, blockedReason, reviewRequested }: CreateTaskInput) => {
      const ref = collection(db, 'projects', projectId, 'tasks');
      await addDoc(ref, {
        storyId,
        title,
        description: description || '',
        status: 'todo',
        estimatedHours: estimatedHours || null,
        ownerId: ownerId || null,
        assignedTo: assignedTo || null,
        tags: tags || [],
        blocked: blocked || false,
        blockedReason: blockedReason || null,
        reviewRequested: reviewRequested || false,
        testStatus: 'not_tested',
        timeSpent: 0,
        remainingHours: estimatedHours || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: (_, { projectId, storyId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, storyId] });
    },
  });
};

interface UpdateTaskInput {
  projectId: string;
  taskId: string;
  updates: {
    status?: string;
    assignedTo?: string;
    title?: string;
    description?: string;
    estimatedHours?: number;
    ownerId?: string;
    tags?: string[];
    blocked?: boolean;
    blockedReason?: string;
    reviewRequested?: boolean;
    timeSpent?: number;
    remainingHours?: number;
    testStatus?: TestStatus;
    results?: TaskResult[];
    comments?: string[];
    attachments?: { url: string; name: string; uploadedAt?: any; size?: number; type?: string }[];
  };
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, taskId, updates }: UpdateTaskInput) => {
      const ref = doc(db, 'projects', projectId, 'tasks', taskId);
      // Firestore n'accepte pas les valeurs undefined, on nettoie l'objet d'updates
      const cleanedUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedUpdates[key] = value;
        }
      });

      await updateDoc(ref, { ...cleanedUpdates, updatedAt: Timestamp.now() });
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};

interface DeleteTaskInput {
  projectId: string;
  taskId: string;
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, taskId }: DeleteTaskInput) => {
      const ref = doc(db, 'projects', projectId, 'tasks', taskId);
      await deleteDoc(ref);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
    },
  });
};

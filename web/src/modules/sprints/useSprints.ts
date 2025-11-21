import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: any;
  endDate?: any;
  status: 'planned' | 'active' | 'done';
  createdAt?: any;
  updatedAt?: any;
}

export const useSprints = (projectId: string | null) => {
  return useQuery<Sprint[]>({
    queryKey: ['sprints', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      const snap = await getDocs(collection(db, 'projects', projectId, 'sprints'));
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          projectId: data.projectId,
          name: data.name,
          goal: data.goal,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status || 'planned',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
    },
  });
};

export const useSprint = (projectId: string | null, sprintId: string | null) => {
  return useQuery<Sprint | null>({
    queryKey: ['sprint', projectId, sprintId],
    enabled: !!projectId && !!sprintId,
    queryFn: async () => {
      if (!projectId || !sprintId) return null;
      const snap = await getDocs(collection(db, 'projects', projectId, 'sprints'));
      const doc = snap.docs.find((d) => d.id === sprintId);
      if (!doc) return null;
      const data = doc.data() as any;
      return {
        id: doc.id,
        projectId: data.projectId,
        name: data.name,
        goal: data.goal,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || 'planned',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    },
  });
};

interface CreateSprintInput {
  projectId: string;
  name: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'planned' | 'active' | 'done';
}

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, name, goal, startDate, endDate, status }: CreateSprintInput) => {
      const ref = collection(db, 'projects', projectId, 'sprints');
      await addDoc(ref, {
        projectId,
        name,
        goal: goal || '',
        startDate: startDate ? Timestamp.fromDate(startDate) : null,
        endDate: endDate ? Timestamp.fromDate(endDate) : null,
        status: status || 'planned',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    },
  });
};

interface UpdateSprintInput {
  projectId: string;
  sprintId: string;
  updates: {
    name?: string;
    goal?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: 'planned' | 'active' | 'done';
  };
}

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, sprintId, updates }: UpdateSprintInput) => {
      const ref = doc(db, 'projects', projectId, 'sprints', sprintId);
      const updateData: any = { ...updates, updatedAt: Timestamp.now() };
      if (updates.startDate !== undefined) {
        updateData.startDate = updates.startDate ? Timestamp.fromDate(updates.startDate) : null;
      }
      if (updates.endDate !== undefined) {
        updateData.endDate = updates.endDate ? Timestamp.fromDate(updates.endDate) : null;
      }
      await updateDoc(ref, updateData);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    },
  });
};


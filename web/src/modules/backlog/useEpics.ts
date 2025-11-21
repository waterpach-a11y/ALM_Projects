import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Epic {
  id: string;
  title: string;
  status: string;
  priority: string;
  description?: string;
  businessValue?: number;
  ownerId?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  dueDate?: any;
  assignedTo?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const useEpics = (projectId: string | null) => {
  return useQuery<Epic[]>({
    queryKey: ['epics', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      const snap = await getDocs(collection(db, 'projects', projectId, 'epics'));
      return snap.docs.map((d) => {
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
    },
  });
};

interface CreateEpicInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  ownerId?: string;
  businessValue?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
}

export const useCreateEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, title, description, priority, ownerId, businessValue, riskLevel, dueDate, assignedTo }: CreateEpicInput) => {
      const ref = collection(db, 'projects', projectId, 'epics');
      await addDoc(ref, {
        title,
        description: description || '',
        status: 'todo',
        priority: priority || 'medium',
        ownerId: ownerId || null,
        businessValue: businessValue || null,
        riskLevel: riskLevel || null,
        dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
        assignedTo: assignedTo || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] });
    },
  });
};

interface UpdateEpicInput {
  projectId: string;
  epicId: string;
  updates: {
    status?: string;
    priority?: string;
    title?: string;
    description?: string;
    ownerId?: string;
    businessValue?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    dueDate?: Date | null;
    assignedTo?: string;
  };
}

export const useUpdateEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, epicId, updates }: UpdateEpicInput) => {
      const ref = doc(db, 'projects', projectId, 'epics', epicId);
      const updateData: any = { ...updates, updatedAt: Timestamp.now() };
      if (updates.dueDate !== undefined) {
        updateData.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
      }
      await updateDoc(ref, updateData);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['epics', projectId] });
    },
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, doc, getDocs, query, where, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Story {
  id: string;
  epicId: string;
  title: string;
  status: string;
  storyPoints: number;
  assignedTo?: string;
  businessValue?: number;
  complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  ownerId?: string;
  sprintNumber?: number;
  acceptanceCriteria?: string[];
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const useStories = (projectId: string | null, epicId: string | null) => {
  return useQuery<Story[]>({
    queryKey: ['stories', projectId, epicId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      const baseRef = collection(db, 'projects', projectId, 'stories');
      const q = epicId ? query(baseRef, where('epicId', '==', epicId)) : baseRef;
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
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
    },
  });
};

interface CreateStoryInput {
  projectId: string;
  epicId: string;
  title: string;
  description?: string;
  storyPoints?: number;
  ownerId?: string;
  sprintNumber?: number;
  acceptanceCriteria?: string[];
  businessValue?: number;
  complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  assignedTo?: string;
}

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, epicId, title, description, storyPoints, ownerId, sprintNumber, acceptanceCriteria, businessValue, complexity, assignedTo }: CreateStoryInput) => {
      const ref = collection(db, 'projects', projectId, 'stories');
      await addDoc(ref, {
        epicId,
        title,
        description: description || '',
        status: 'todo',
        storyPoints: storyPoints || 1,
        ownerId: ownerId || null,
        sprintNumber: sprintNumber || null,
        acceptanceCriteria: acceptanceCriteria || [],
        businessValue: businessValue || null,
        complexity: complexity || null,
        assignedTo: assignedTo || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    onSuccess: (_, { projectId, epicId }) => {
      queryClient.invalidateQueries({ queryKey: ['stories', projectId, epicId] });
    },
  });
};

interface UpdateStoryInput {
  projectId: string;
  storyId: string;
  updates: {
    status?: string;
    storyPoints?: number;
    title?: string;
    description?: string;
    ownerId?: string;
    sprintNumber?: number;
    acceptanceCriteria?: string[];
    businessValue?: number;
    complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
    assignedTo?: string;
  };
}

export const useUpdateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, storyId, updates }: UpdateStoryInput) => {
      const ref = doc(db, 'projects', projectId, 'stories', storyId);
      const updateData: any = { updatedAt: Timestamp.now() };
      
      // Only include fields that are not undefined
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.storyPoints !== undefined) updateData.storyPoints = updates.storyPoints;
      if (updates.ownerId !== undefined) updateData.ownerId = updates.ownerId || null;
      if (updates.sprintNumber !== undefined) updateData.sprintNumber = updates.sprintNumber ?? null;
      if (updates.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = updates.acceptanceCriteria || [];
      if (updates.businessValue !== undefined) updateData.businessValue = updates.businessValue ?? null;
      if (updates.complexity !== undefined) updateData.complexity = updates.complexity || null;
      if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo || null;
      
      await updateDoc(ref, updateData);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] });
    },
  });
};

interface DeleteStoryInput {
  projectId: string;
  storyId: string;
}

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, storyId }: DeleteStoryInput) => {
      const ref = doc(db, 'projects', projectId, 'stories', storyId);
      await deleteDoc(ref);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};

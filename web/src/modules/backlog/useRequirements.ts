import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Requirement {
  id: string;
  taskId: string;
  projectId: string;
  title: string;
  description?: string;
  acceptanceCriteria: string[];
  priority?: string;
  requirementType?: 'functional' | 'technical' | 'compliance';
  testCases?: string[];
  verified?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export const useRequirements = (projectId: string | null, taskId: string | null) => {
  return useQuery<Requirement[]>({
    queryKey: ['requirements', projectId, taskId],
    enabled: !!projectId && !!taskId,
    queryFn: async () => {
      if (!projectId || !taskId) return [];
      const snap = await getDocs(collection(db, 'projects', projectId, 'requirements'));
      return snap.docs
        .map((d) => {
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
        })
        .filter((r) => r.taskId === taskId) as Requirement[];
    },
  });
};

interface CreateRequirementInput {
  projectId: string;
  taskId: string;
  title: string;
  description?: string;
  acceptanceCriteria: string[];
  priority?: string;
  requirementType?: 'functional' | 'technical' | 'compliance';
  testCases?: string[];
  verified?: boolean;
}

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, taskId, title, description, acceptanceCriteria, priority, requirementType, testCases, verified }: CreateRequirementInput) => {
      const ref = collection(db, 'projects', projectId, 'requirements');
      await addDoc(ref, {
        projectId,
        taskId,
        title,
        description: description ?? '',
        acceptanceCriteria,
        priority: priority ?? 'medium',
        requirementType: requirementType || null,
        testCases: testCases || [],
        verified: verified || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: (_, { projectId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId, taskId] });
    },
  });
};

interface UpdateRequirementInput {
  projectId: string;
  requirementId: string;
  title?: string;
  description?: string;
  acceptanceCriteria?: string[];
  priority?: string;
  requirementType?: 'functional' | 'technical' | 'compliance';
  testCases?: string[];
  verified?: boolean;
}

export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, requirementId, ...updates }: UpdateRequirementInput) => {
      const ref = doc(db, 'projects', projectId, 'requirements', requirementId);
      const updateData: any = { updatedAt: serverTimestamp() };
      
      // Only include fields that are not undefined
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = updates.acceptanceCriteria || [];
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.requirementType !== undefined) updateData.requirementType = updates.requirementType || null;
      if (updates.testCases !== undefined) updateData.testCases = updates.testCases || [];
      if (updates.verified !== undefined) updateData.verified = updates.verified;
      
      await updateDoc(ref, updateData);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
    },
  });
};

interface DeleteRequirementInput {
  projectId: string;
  requirementId: string;
}

export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, requirementId }: DeleteRequirementInput) => {
      const ref = doc(db, 'projects', projectId, 'requirements', requirementId);
      await deleteDoc(ref);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
    },
  });
};

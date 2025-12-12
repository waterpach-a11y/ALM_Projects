import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface UpdateProjectInput {
  projectId: string;
  data: Record<string, any>;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: UpdateProjectInput) => {
      const ref = doc(db, 'projects', projectId);

      const payload: Record<string, any> = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      // Normalize members to a map { [uid]: true } when provided as an array
      if (Array.isArray(payload.members)) {
        const membersArray = payload.members as string[];
        const membersMap: Record<string, boolean> = {};
        for (const uid of membersArray) {
          membersMap[uid] = true;
        }
        payload.members = membersMap;
      }

      // Filter out undefined values (Firestore doesn't accept undefined)
      // Convert undefined to null for optional fields, or omit them entirely
      const cleanPayload: Record<string, any> = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined) {
          cleanPayload[key] = value;
        }
      }

      await updateDoc(ref, cleanPayload);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

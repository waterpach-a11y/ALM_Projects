import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface DeleteProjectInput {
  projectId: string;
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId }: DeleteProjectInput) => {
      const deleteProject = httpsCallable(functions, 'deleteProject');
      await deleteProject({ projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['global-dashboard'] });
    },
  });
};


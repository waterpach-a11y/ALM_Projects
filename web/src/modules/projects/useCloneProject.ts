import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { functions } from '../../firebase';

interface CloneProjectInput {
  sourceProjectId: string;
  name: string;
  ownerId: string;
}

export const useCloneProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: CloneProjectInput) => {
      const cloneProject = httpsCallable(functions, 'cloneProject');
      const result = await cloneProject({
        sourceProjectId: input.sourceProjectId,
        name: input.name,
        ownerId: input.ownerId,
      });
      return result.data as { newProjectId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['global-dashboard'] });
      if (data?.newProjectId) {
        navigate(`/app/project/${data.newProjectId}/dashboard`);
      }
    },
  });
}

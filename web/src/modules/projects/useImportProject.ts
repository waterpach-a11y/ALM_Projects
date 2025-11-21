import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { functions } from '../../firebase';

interface ImportProjectInput {
  payload: any;
  name: string;
  ownerId: string;
}

export const useImportProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: ImportProjectInput) => {
      const importProject = httpsCallable(functions, 'importProject');
      const result = await importProject({
        payload: input.payload,
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
};

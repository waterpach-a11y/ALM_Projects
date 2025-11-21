import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { functions } from '../../firebase';

interface CreateProjectInput {
  name: string;
  description?: string;
  ownerId: string;
  members?: string[];
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const createProject = httpsCallable(functions, 'createProject');
      const result = await createProject({
        name: input.name,
        description: input.description || '',
        ownerId: input.ownerId,
        members: input.members || [input.ownerId],
      });
      return result.data as { projectId: string; project: any };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['global-dashboard'] });
      navigate(`/app/project/${data.projectId}`);
    },
  });
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface UpdateUserRolesInput {
  userId: string;
  roles: string[];
}

export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserRolesInput) => {
      const setUserRoles = httpsCallable(functions, 'setUserRoles');
      const result = await setUserRoles({
        userId: input.userId,
        roles: input.roles,
      });
      return result.data as { success: boolean; userId: string; roles: string[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface MakeAdminInput {
  userId: string;
}

export const useMakeAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MakeAdminInput) => {
      const setUserRoles = httpsCallable(functions, 'setUserRoles');
      const result = await setUserRoles({
        userId: input.userId,
        roles: ['admin'],
      });
      return result.data as { success: boolean; userId: string; roles: string[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};


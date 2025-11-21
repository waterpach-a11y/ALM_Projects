import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface CreateUserInput {
  email: string;
  password: string;
  displayName?: string;
  roles?: string[];
}

interface InviteUserInput {
  email: string;
  displayName?: string;
  roles?: string[];
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      try {
        const createUser = httpsCallable(functions, 'createUser');
        const result = await createUser(input);
        return result.data as { success: boolean; userId: string; email: string };
      } catch (error: any) {
        // Provide more detailed error message
        if (error.code === 'functions/not-found' || error.code === 'functions/internal') {
          throw new Error('Firebase Functions not deployed. Please deploy functions first: cd functions && npm run deploy');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InviteUserInput) => {
      try {
        const inviteUser = httpsCallable(functions, 'inviteUser');
        const result = await inviteUser(input);
        return result.data as { success: boolean; userId: string; email: string; tempPassword: string };
      } catch (error: any) {
        // Provide more detailed error message
        if (error.code === 'functions/not-found' || error.code === 'functions/internal') {
          throw new Error('Firebase Functions not deployed. Please deploy functions first: cd functions && npm run deploy');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};


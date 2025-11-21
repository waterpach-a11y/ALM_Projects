import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface DeleteUserInput {
  userId: string;
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: DeleteUserInput) => {
      const ref = doc(db, 'users', userId);
      await deleteDoc(ref);
      // Note: This only deletes the Firestore document, not the Firebase Auth user
      // To fully delete a user, you would need a Firebase Function
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};


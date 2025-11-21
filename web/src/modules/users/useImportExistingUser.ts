import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface ImportExistingUserInput {
  email: string;
  roles?: string[];
}

interface ImportExistingUserResult {
  success: boolean;
  userId: string;
  email: string;
  roles: string[];
  imported: boolean;
}

export const useImportExistingUser = () => {
  return useMutation<ImportExistingUserResult, any, ImportExistingUserInput>({
    mutationFn: async ({ email, roles }) => {
      const importExistingUser = httpsCallable(functions, 'importExistingUser');
      const result = await importExistingUser({ email, roles });
      return result.data as ImportExistingUserResult;
    },
  });
}

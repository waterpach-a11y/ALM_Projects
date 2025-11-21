import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

interface SyncUserRolesInput {
  userId?: string; // Si non fourni, synchronise l'utilisateur actuel
}

interface SyncAllAdminRolesInput {
  // Pas de paramètres nécessaires
}

export const useSyncUserRoles = () => {
  return useMutation({
    mutationFn: async (input?: SyncUserRolesInput) => {
      const syncUserRoles = httpsCallable(functions, 'syncUserRoles');
      const result = await syncUserRoles(input || {});
      return result.data as { success: boolean; userId: string; roles: string[]; message: string };
    },
  });
};

export const useSyncAllAdminRoles = () => {
  return useMutation({
    mutationFn: async () => {
      const syncAllAdminRoles = httpsCallable(functions, 'syncAllAdminRoles');
      const result = await syncAllAdminRoles({});
      return result.data as {
        success: boolean;
        synced: number;
        total: number;
        results: Array<{ userId: string; email: string; synced: boolean; error?: string }>;
      };
    },
  });
};


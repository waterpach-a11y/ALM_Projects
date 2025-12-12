import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

export const useSendWeeklyReports = () => {
  const sendWeeklyReportsManual = httpsCallable(functions, 'sendWeeklyReportsManual');

  return useMutation({
    mutationFn: async () => {
      const result = await sendWeeklyReportsManual({});
      return result.data as {
        success: boolean;
        totalRecipients: number;
        results: Array<{
          email: string;
          reportsCount: number;
          success: boolean;
          error?: string;
        }>;
      };
    },
  });
};


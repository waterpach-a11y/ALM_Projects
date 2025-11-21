import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Project } from '../../models';

export const useProject = (projectId: string | null) => {
  return useQuery<Project | null>({
    queryKey: ['project', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return null;
      const ref = doc(db, 'projects', projectId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as any) } as Project;
    },
  });
};

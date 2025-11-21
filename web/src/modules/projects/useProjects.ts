import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export interface Project {
  id: string;
  name: string;
}

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.debug('[useProjects] no authenticated user, returning empty list');
          return [];
        }

        const tokenResult = await user.getIdTokenResult();
        const roles = (tokenResult.claims.roles as string[]) || [];
        const isAdmin = roles.includes('admin');
        const isProjectManager = roles.includes('project-manager');

        let snap;
        if (isAdmin || isProjectManager) {
          // Admins and project-managers can see all projects
          snap = await getDocs(collection(db, 'projects'));
        } else {
          // Other roles: only projects where they are explicitly a member (map members.<uid> == true)
          const colRef = collection(db, 'projects');
          const q = query(colRef, where(`members.${user.uid}`, '==', true));
          snap = await getDocs(q);
        }

        const projects = snap.docs.map((d) => ({ id: d.id, name: (d.data().name as string) || 'Unnamed project' }));
        console.debug('[useProjects] fetched projects:', projects);
        return projects;
      } catch (error) {
        console.error('[useProjects] error while fetching projects:', error);
        throw error;
      }
    },
  });
};

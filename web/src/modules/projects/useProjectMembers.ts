import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUsers } from '../users/useUsers';

export interface ProjectMember {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
  photoURL?: string;
}

export const useProjectMembers = (projectId: string | null) => {
  const { data: allUsers } = useUsers();

  return useQuery<ProjectMember[]>({
    queryKey: ['projectMembers', projectId],
    enabled: !!projectId && !!allUsers,
    queryFn: async () => {
      if (!projectId || !allUsers) return [];

      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) return [];

      const projectData = projectDoc.data();
      let memberIds: string[] = [];

      // Handle both array and map formats for members
      if (Array.isArray(projectData.members)) {
        memberIds = projectData.members;
      } else if (projectData.members && typeof projectData.members === 'object') {
        memberIds = Object.keys(projectData.members);
      }

      // Also include the owner if not already in members
      if (projectData.owner && !memberIds.includes(projectData.owner)) {
        memberIds.push(projectData.owner);
      }

      // Map member IDs to user objects
      const members = memberIds
        .map((memberId) => {
          const user = allUsers.find((u) => u.id === memberId);
          if (user) {
            return {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              roles: user.roles,
              photoURL: user.photoURL,
            };
          }
          // If user not found in users collection, return basic info
          return {
            id: memberId,
            email: memberId,
            displayName: undefined,
            roles: [],
            photoURL: undefined,
          };
        })
        .filter(Boolean) as ProjectMember[];

      return members;
    },
  });
};


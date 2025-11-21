import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
  photoURL?: string;
}

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            email: data.email || '',
            displayName: data.displayName || '',
            roles: data.roles || ['user'],
            photoURL: data.photoURL,
          };
        });
      } catch (error: any) {
        console.error('Error fetching users:', error);
        // If permission denied, return empty array and log the error
        if (error.code === 'permission-denied') {
          console.warn('Permission denied: Make sure your user has the admin role in Firebase Auth custom claims');
        }
        throw error;
      }
    },
  });
};

export const useProjectManagers = () => {
  return useQuery<User[]>({
    queryKey: ['users', 'project-managers'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            email: data.email || '',
            displayName: data.displayName || '',
            roles: data.roles || ['user'],
            photoURL: data.photoURL,
          };
        })
        .filter(
          (user) =>
            user.roles.includes('project-manager') ||
            user.roles.includes('project-lead') ||
            user.roles.includes('admin'),
        );
    },
  });
};


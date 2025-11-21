import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export interface DashboardResponse {
  totalEpics: number;
  totalStories: number;
  totalTasks: number;
  storiesByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  requirementsByPriority: Record<string, number>;
  openBugsCount: number;
  blockedTasksCount: number;
  verifiedRequirementsCount: number;
  workloadByDeveloper: { userId: string; tasksCount: number }[];
  completionRate: number; // 0-100
  burndownData: { date: string; remaining: number }[];
  storiesDone: number;
  storiesTotal: number;
}

export const useProjectDashboard = (projectId: string | null) => {
  return useQuery<DashboardResponse | null>({
    queryKey: ['dashboard', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return null;

      const [epicsSnap, storiesSnap, tasksSnap, bugsSnap, requirementsSnap] = await Promise.all([
        getDocs(collection(db, 'projects', projectId, 'epics')),
        getDocs(collection(db, 'projects', projectId, 'stories')),
        getDocs(collection(db, 'projects', projectId, 'tasks')),
        getDocs(collection(db, 'projects', projectId, 'bugs')),
        getDocs(collection(db, 'projects', projectId, 'requirements')),
      ]);

      const totalEpics = epicsSnap.size;

      const storiesByStatus: Record<string, number> = {};
      let storiesDone = 0;
      let storiesTotal = storiesSnap.size;
      storiesSnap.forEach((doc) => {
        const data = doc.data() as any;
        const status = (data.status as string) || 'unknown';
        storiesByStatus[status] = (storiesByStatus[status] ?? 0) + 1;
        if (status === 'done') storiesDone++;
      });

      const tasksByStatus: Record<string, number> = {};
      const workloadMap = new Map<string, number>();
      const burndownMap = new Map<string, number>();
      let totalTasks = 0;
      let doneTasks = 0;
      let blockedTasksCount = 0;

      tasksSnap.forEach((doc) => {
        const data = doc.data() as any;
        const status = (data.status as string) || 'unknown';
        tasksByStatus[status] = (tasksByStatus[status] ?? 0) + 1;

        const userId = (data.assignedTo as string) || data.assigneeId || 'Unassigned';
        workloadMap.set(userId, (workloadMap.get(userId) ?? 0) + 1);

        totalTasks++;
        if (status === 'done') doneTasks++;
        if (data.blocked === true) blockedTasksCount++;

        const createdAt = (data.createdAt as any)?.toDate?.() as Date | undefined;
        const dayKey = createdAt ? createdAt.toISOString().slice(0, 10) : 'unknown';
        burndownMap.set(dayKey, (burndownMap.get(dayKey) ?? 0) + 1);
      });

      const workloadByDeveloper = Array.from(workloadMap.entries()).map(([userId, tasksCount]) => ({
        userId,
        tasksCount,
      }));

      const requirementsByPriority: Record<string, number> = {};
      let verifiedRequirements = 0;
      requirementsSnap.forEach((doc) => {
        const data = doc.data() as any;
        const priority = (data.priority as string) || 'medium';
        requirementsByPriority[priority] = (requirementsByPriority[priority] ?? 0) + 1;
        if (data.verified === true) verifiedRequirements++;
      });

      const openBugsCount = bugsSnap.size;

      const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

      const sortedDays = Array.from(burndownMap.keys())
        .filter((d) => d !== 'unknown')
        .sort();
      const burndownData: { date: string; remaining: number }[] = [];
      let remaining = totalTasks;
      sortedDays.forEach((day) => {
        // simple modèle: on considère que plus on avance dans le temps, moins il reste de tâches
        remaining = Math.max(0, remaining - (burndownMap.get(day) ?? 0));
        burndownData.push({ date: day, remaining });
      });

      return {
        totalEpics,
        totalStories: storiesTotal,
        totalTasks,
        storiesByStatus,
        tasksByStatus,
        requirementsByPriority,
        openBugsCount,
        blockedTasksCount,
        verifiedRequirementsCount: verifiedRequirements,
        workloadByDeveloper,
        completionRate,
        burndownData,
        storiesDone,
        storiesTotal,
      };
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Project } from '../../models';

export interface ProjectWithHealth extends Project {
  overallHealth?: number; // 0-100 completion rate
  healthStatus?: 'excellent' | 'good' | 'needs_attention';
}

export interface GlobalDashboardData {
  projects: ProjectWithHealth[];
  totalProjects: number;
  activeProjects: number;
  totalEpics: number;
  totalStories: number;
  totalTasks: number;
  totalSprints: number;
  projectsByStatus: Record<string, number>;
  projectsByOwner: Record<string, number>;
}

export const useGlobalDashboard = () => {
  return useQuery<GlobalDashboardData>({
    queryKey: ['global-dashboard'],
    queryFn: async () => {
      const projectsSnap = await getDocs(collection(db, 'projects'));

      // Get all projects
      const projects: Project[] = projectsSnap.docs.map((d) => {
        const data = d.data() as any;

        let members: string[] = [];
        if (Array.isArray(data.members)) {
          members = data.members as string[];
        } else if (data.members && typeof data.members === 'object') {
          members = Object.keys(data.members as Record<string, any>);
        }

        return {
          id: d.id,
          name: data.name,
          description: data.description,
          ownerId: data.owner || data.ownerId,
          members,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          deadline: data.deadline,
          projectStatus: data.projectStatus || data.status || 'planned',
          codeLink: data.codeLink,
          resultLink: data.resultLink,
        };
      });

      // Count projects by status
      const projectsByStatus: Record<string, number> = {};
      projects.forEach((p) => {
        const status = p.projectStatus || 'planned';
        projectsByStatus[status] = (projectsByStatus[status] || 0) + 1;
      });

      // Count projects by owner
      const projectsByOwner: Record<string, number> = {};
      projects.forEach((p) => {
        const owner = p.ownerId || 'unknown';
        projectsByOwner[owner] = (projectsByOwner[owner] || 0) + 1;
      });

      // Count all epics, stories, tasks, sprints across all projects
      let totalEpics = 0;
      let totalStories = 0;
      let totalTasks = 0;
      let totalSprints = 0;

      // Calculate overall health for each project and aggregate counts
      const projectsWithHealth: ProjectWithHealth[] = [];
      
      for (const project of projects) {
        try {
          const [epics, stories, tasks, sprints] = await Promise.all([
            getDocs(collection(db, 'projects', project.id, 'epics')),
            getDocs(collection(db, 'projects', project.id, 'stories')),
            getDocs(collection(db, 'projects', project.id, 'tasks')),
            getDocs(collection(db, 'projects', project.id, 'sprints')),
          ]);
          
          totalEpics += epics.size;
          totalStories += stories.size;
          totalTasks += tasks.size;
          totalSprints += sprints.size;
          
          // Calculate completion rate (overall health)
          let doneTasks = 0;
          let totalTasksCount = tasks.size;
          tasks.forEach((taskDoc) => {
            const taskData = taskDoc.data();
            if (taskData.status === 'done') {
              doneTasks++;
            }
          });
          
          const overallHealth = totalTasksCount > 0 ? Math.round((doneTasks / totalTasksCount) * 100) : 0;
          const healthStatus = overallHealth >= 80 ? 'excellent' : overallHealth >= 50 ? 'good' : 'needs_attention';
          
          projectsWithHealth.push({
            ...project,
            overallHealth,
            healthStatus,
          });
        } catch (e) {
          // If error, add project without health data
          projectsWithHealth.push({
            ...project,
            overallHealth: 0,
            healthStatus: 'needs_attention' as const,
          });
        }
      }

      const activeProjects = projects.filter((p) => p.projectStatus === 'in_progress').length;

      return {
        projects: projectsWithHealth,
        totalProjects: projects.length,
        activeProjects,
        totalEpics,
        totalStories,
        totalTasks,
        totalSprints,
        projectsByStatus,
        projectsByOwner,
      };
    },
  });
};


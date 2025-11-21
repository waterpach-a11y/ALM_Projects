import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useProjects } from '../projects/useProjects';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const [roles, setRoles] = React.useState<string[]>([]);
  const [workloadTotal, setWorkloadTotal] = React.useState(0);
  const [workloadByProject, setWorkloadByProject] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const loadRoles = async () => {
      if (!user) {
        setRoles([]);
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        const claimsRoles = (tokenResult.claims.roles as string[]) || [];
        setRoles(claimsRoles);
      } catch (e) {
        console.error('[UserProfilePage] error loading roles from custom claims', e);
        setRoles([]);
      }
    };

    loadRoles();
  }, [user]);

  React.useEffect(() => {
    const loadWorkload = async () => {
      if (!user) {
        setWorkloadTotal(0);
        setWorkloadByProject({});
        return;
      }

      try {
        const tasksRef = collectionGroup(db, 'tasks');
        const q = query(tasksRef, where('assignedTo', '==', user.uid));
        const snap = await getDocs(q);

        const perProject: Record<string, number> = {};
        snap.forEach((docSnap) => {
          const parentProject = docSnap.ref.parent.parent; // projects/{projectId}
          const projectId = parentProject?.id;
          if (!projectId) return;
          perProject[projectId] = (perProject[projectId] || 0) + 1;
        });

        setWorkloadTotal(snap.size);
        setWorkloadByProject(perProject);
      } catch (e) {
        console.error('[UserProfilePage] error loading workload', e);
        setWorkloadTotal(0);
        setWorkloadByProject({});
      }
    };

    loadWorkload();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-slate-500">You must be logged in to view your profile.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600 font-medium">Overview of your account and projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <div className="text-sm text-slate-600">
              <div className="font-medium text-slate-900">{user.email?.split('@')[0] || user.email}</div>
              <div className="text-slate-500">{user.email}</div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Roles</p>
              <div className="flex flex-wrap gap-2">
                {(roles.length > 0 ? roles : ['user']).map((role) => (
                  <Badge key={role}>{role}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <p className="text-sm text-slate-600">
              You currently have access to <span className="font-semibold">{projects?.length ?? 0}</span> project(s).
            </p>
            <p className="text-sm text-slate-600">
              You are assigned to <span className="font-semibold">{workloadTotal}</span> task(s) across all projects.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Projects</h2>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading projects...</div>
          ) : !projects || projects.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">You do not have access to any projects yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell align="right">My Tasks</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="text-xs text-slate-500">ID: {project.id}</div>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-semibold">{workloadByProject[project.id] || 0}</span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center gap-3 justify-end">
                        <a
                          href={`/app/project/${project.id}/dashboard`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Dashboard
                        </a>
                        <a
                          href={`/app/project/${project.id}`}
                          className="text-slate-600 hover:text-slate-700 text-sm font-medium"
                        >
                          Settings
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserProfilePage;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProjectStore } from '../../modules/projects/useProjectStore';
import { useProjects } from '../../modules/projects/useProjects';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  const { currentProjectId } = useProjectStore();
  const { data: projects } = useProjects();

  // Try to infer projectId from URL (/app/project/:id/...)
  let projectIdFromPath: string | null = null;
  if (paths.length >= 3 && paths[0] === 'app' && paths[1] === 'project') {
    projectIdFromPath = paths[2];
  }

  const effectiveProjectId = projectIdFromPath || currentProjectId || null;
  const currentProject = projects?.find((p) => p.id === effectiveProjectId) || null;

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/app' }];

  if (paths.length > 1 && paths[0] === 'app') {
    const routeMap: Record<string, string> = {
      backlog: 'Backlog',
      bugs: 'Bugs',
      sprints: 'Sprints',
      users: 'Users & Roles',
      project: 'Project',
    };

    // If we're in a project context, add the project name/id as the next crumb
    if (paths[1] === 'project' && effectiveProjectId) {
      const projectLabel = currentProject?.name || effectiveProjectId;
      const projectPath = '/' + paths.slice(0, 3).join('/'); // /app/project/:id
      breadcrumbs.push({ label: projectLabel, path: projectPath });

      // Handle one more segment like /dashboard
      if (paths.length > 3) {
        const last = paths[3];
        const label = routeMap[last] || last.charAt(0).toUpperCase() + last.slice(1);
        breadcrumbs.push({ label });
      }
    } else {
      // Non-project routes: use simple mapping
      paths.slice(1).forEach((path, index) => {
        const fullPath = '/' + paths.slice(0, index + 2).join('/');
        breadcrumbs.push({
          label: routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
          path: index === paths.length - 2 ? undefined : fullPath,
        });
      });
    }
  }

  return (
    <div className="space-y-2">
      <nav className="flex items-center space-x-2 text-sm text-slate-600">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-indigo-600 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-900 font-medium">{crumb.label}</span>
            )}
            {index < breadcrumbs.length - 1 && <span className="text-slate-400">/</span>}
          </React.Fragment>
        ))}
      </nav>

      {/* Project-level navigation menu under the breadcrumb when a project is selected */}
      {effectiveProjectId && (
        <div className="flex flex-wrap gap-2 mt-1">
          <Link
            to={`/app/project/${effectiveProjectId}/dashboard`}
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            Project Dashboard
          </Link>
          <Link
            to="/app/backlog"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            Backlog
          </Link>
          <Link
            to="/app/bugs"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            Bugs
          </Link>
          <Link
            to="/app/sprints"
            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            Sprints
          </Link>
        </div>
      )}
    </div>
  );
};

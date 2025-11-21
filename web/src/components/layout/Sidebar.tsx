import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProjectStore } from '../../modules/projects/useProjectStore';
import { useAuth } from '../../modules/auth/AuthContext';
import { useProjects } from '../../modules/projects/useProjects';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// Admin-only nav items
const adminNavItems: NavItem[] = [
  {
    label: 'Global Dashboard',
    path: '/app',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Users & Roles',
    path: '/app/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

// Regular nav items (visible to all authenticated users)
// For now we keep only global/admin-level navigation in the sidebar.
// Project-specific navigation (Backlog, Bugs, Sprints, etc.) is handled inside the project screens.
const regularNavItems: NavItem[] = [
  {
    label: 'Help & Documentation',
    path: '/app/help',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC<{ isCollapsed: boolean; onToggle: () => void }> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { currentProjectId } = useProjectStore();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: projects } = useProjects();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        const roles = (tokenResult.claims.roles as string[]) || [];
        console.log('uid courant = ', user.uid);
        console.log('claims.roles = ', roles);
        setIsAdmin(roles.includes('admin'));
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const navItems = loading ? [] : isAdmin ? [...adminNavItems, ...regularNavItems] : regularNavItems;

  return (
    <aside
      className={`bg-white/80 backdrop-blur-xl border-r-2 border-slate-300 shadow-medium transition-all duration-300 ease-out flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-slate-300 bg-gradient-to-r from-indigo-50/50 to-white">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">ALM</h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm border-2 border-indigo-300'
                  : 'text-slate-600 border-2 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 hover:shadow-sm'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Project Dashboard Link - Only show when a project is selected */}
        {currentProjectId && (
          <Link
            to={`/app/project/${currentProjectId}/dashboard`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              location.pathname === `/app/project/${currentProjectId}/dashboard`
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isCollapsed ? 'Project Dashboard' : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {!isCollapsed && <span>Project Dashboard</span>}
          </Link>
        )}
      </nav>

      {!isCollapsed && currentProjectId && (
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Current Project</div>
          <div className="text-sm font-medium text-slate-900 truncate">
            {projects?.find((p) => p.id === currentProjectId)?.name || currentProjectId}
          </div>
        </div>
      )}
    </aside>
  );
};


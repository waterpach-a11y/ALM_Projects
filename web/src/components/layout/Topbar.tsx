import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase';
import { useAuth } from '../../modules/auth/AuthContext';
import { useProjects } from '../../modules/projects/useProjects';
import { useProjectStore } from '../../modules/projects/useProjectStore';
import { Avatar } from '../ui/Avatar';

export const Topbar: React.FC = () => {
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
  };

  const userName = user?.email?.split('@')[0] || 'User';
  const currentProject = projects?.find((p) => p.id === currentProjectId);

  if (projects) {
    console.debug('[Topbar] projects for current user:', projects);
    console.debug('[Topbar] currentProjectId:', currentProjectId);
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-soft flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm font-semibold text-slate-700 shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{currentProject?.name || 'Select Project'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProjectMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-large z-50 animate-scale-in">
              <div className="p-2">
                {projects?.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProjectId(project.id);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      project.id === currentProjectId
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {project.name}
                  </button>
                ))}
                {(!projects || projects.length === 0) && (
                  <div className="px-3 py-2 text-sm text-slate-500">No projects available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {currentProjectId && (
          <Link
            to={`/app/project/${currentProjectId}/dashboard`}
            className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 rounded-xl p-2 transition-colors"
          >
            <Avatar name={userName} size="md" />
            {!showUserMenu && (
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-large z-50 animate-scale-in">
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-slate-600 border-b border-slate-200">
                  <div className="font-medium text-slate-900">{userName}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(showUserMenu || showProjectMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowProjectMenu(false);
          }}
        />
      )}
    </header>
  );
};


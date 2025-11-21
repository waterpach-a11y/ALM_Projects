import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AdminProtectedRoute } from '../auth/AdminProtectedRoute';
import LoginPage from '../auth/pages/LoginPage';
import RegisterPage from '../auth/pages/RegisterPage';
import ResetPasswordPage from '../auth/pages/ResetPasswordPage';
import AppShell from './AppShell';
import DashboardPage from '../dashboard/DashboardPage';
import GlobalDashboardPage from '../dashboard/GlobalDashboardPage';
import BacklogPage from '../backlog/BacklogPage';
import BugsPage from '../bugs/BugsPage';
import ProjectPage from '../projects/ProjectPage';
import CreateProjectPage from '../projects/CreateProjectPage';
import SprintsPage from '../sprints/SprintsPage';
import UsersManagementPage from '../users/UsersManagementPage';
import SyncRolesPage from '../users/SyncRolesPage';
import UserProfilePage from '../users/UserProfilePage';
import HelpPage from '../help/HelpPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminProtectedRoute><GlobalDashboardPage /></AdminProtectedRoute>} />
          <Route path="projects/create" element={<CreateProjectPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="project/:id/dashboard" element={<DashboardPage />} />
          <Route path="project/:id/backlog" element={<BacklogPage />} />
          <Route path="project/:id/bugs" element={<BugsPage />} />
          <Route path="project/:id/sprints" element={<SprintsPage />} />
          <Route path="users" element={<AdminProtectedRoute><UsersManagementPage /></AdminProtectedRoute>} />
          <Route path="sync-roles" element={<SyncRolesPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="project/:id" element={<ProjectPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;

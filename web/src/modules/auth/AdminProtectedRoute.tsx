import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader } from '../../components/ui/Loader';

interface Props {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        const roles = (tokenResult.claims.roles as string[]) || [];
        setIsAdmin(roles.includes('admin'));
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-4">You need administrator privileges to access this page.</p>
          <Navigate to="/app" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};


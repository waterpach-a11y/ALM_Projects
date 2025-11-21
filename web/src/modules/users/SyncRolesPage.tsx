import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSyncUserRoles } from './useSyncRoles';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';

/**
 * Page temporaire pour synchroniser les rôles Firestore vers Custom Claims
 * Accessible à tous les utilisateurs authentifiés pour synchroniser leurs propres rôles
 */
const SyncRolesPage: React.FC = () => {
  const { user } = useAuth();
  const syncUserRoles = useSyncUserRoles();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [firestoreRoles, setFirestoreRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les rôles depuis Custom Claims
        const tokenResult = await user.getIdTokenResult();
        const claimsRoles = (tokenResult.claims.roles as string[]) || [];
        setUserRoles(claimsRoles);

        // Récupérer les rôles depuis Firestore
        const { collection, getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../../firebase');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFirestoreRoles((data.roles as string[]) || []);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const handleSync = async () => {
    if (!user) return;

    try {
      await syncUserRoles.mutateAsync({ userId: user.uid });
      alert('✅ Rôles synchronisés avec succès! Veuillez vous déconnecter et vous reconnecter pour que les changements prennent effet.');
      
      // Recharger les rôles
      const tokenResult = await user.getIdTokenResult(true);
      const claimsRoles = (tokenResult.claims.roles as string[]) || [];
      setUserRoles(claimsRoles);
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message || 'Échec de la synchronisation'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const needsSync = JSON.stringify(userRoles.sort()) !== JSON.stringify(firestoreRoles.sort());

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Synchroniser les Rôles</h1>
        <p className="text-slate-600">Synchronisez vos rôles de Firestore vers Firebase Auth Custom Claims</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">État actuel</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Rôles dans Firestore:</p>
                <div className="flex gap-2 flex-wrap">
                  {firestoreRoles.length > 0 ? (
                    firestoreRoles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">Aucun rôle</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Rôles dans Custom Claims (token actuel):</p>
                <div className="flex gap-2 flex-wrap">
                  {userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          firestoreRoles.includes(role)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">Aucun rôle</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {needsSync && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-2">
                ⚠️ <strong>Les rôles ne sont pas synchronisés!</strong>
              </p>
              <p className="text-sm text-yellow-700">
                Vos rôles dans Firestore ne correspondent pas à ceux dans Firebase Auth Custom Claims.
                Cliquez sur le bouton ci-dessous pour synchroniser.
              </p>
            </div>
          )}

          {!needsSync && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ <strong>Les rôles sont synchronisés!</strong>
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <Button
              variant="primary"
              onClick={handleSync}
              isLoading={syncUserRoles.isPending}
              disabled={!needsSync}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Synchroniser les Rôles
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              <strong>Note importante:</strong> Après la synchronisation, vous devez vous déconnecter et vous reconnecter
              pour que le nouveau token avec les rôles mis à jour soit chargé.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SyncRolesPage;


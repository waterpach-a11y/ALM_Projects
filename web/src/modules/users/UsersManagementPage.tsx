import React, { useState } from 'react';
import { useUsers } from './useUsers';
import { useUpdateUserRoles } from './useUpdateUserRoles';
import { useCreateUser, useInviteUser } from './useCreateUser';
import { useMakeAdmin } from './useMakeAdmin';
import { useSyncUserRoles, useSyncAllAdminRoles } from './useSyncRoles';
import { useImportExistingUser } from './useImportExistingUser';
import { useDeleteUser } from './useDeleteUser';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Loader } from '../../components/ui/Loader';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select } from '../../components/ui/FormField';
import { useAuth } from '../auth/AuthContext';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';

const ALLOWED_ROLES = ['admin', 'project-manager', 'project-lead', 'tester', 'validator', 'developer', 'user'];

const UsersManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useUsers();
  const updateUserRoles = useUpdateUserRoles();
  const createUser = useCreateUser();
  const inviteUser = useInviteUser();
  const makeAdmin = useMakeAdmin();
  const syncUserRoles = useSyncUserRoles();
  const syncAllAdminRoles = useSyncAllAdminRoles();
  const importExistingUser = useImportExistingUser();
  const deleteUser = useDeleteUser();

  const [editingUser, setEditingUser] = useState<{ id: string; roles: string[] } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    roles: ['user'] as string[],
  });
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    displayName: '',
    roles: ['user'] as string[],
  });
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [importEmail, setImportEmail] = useState('');
  const [importRoles, setImportRoles] = useState<string[]>(['user']);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const autoSyncedRef = React.useRef(false);

  React.useEffect(() => {
    const fetchUserRoles = async () => {
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          const roles = (tokenResult.claims.roles as string[]) || [];
          setUserRoles(roles);
        } catch (error) {
          console.error('Error fetching user roles:', error);
        }
      }
    };
    fetchUserRoles();
  }, [currentUser]);

  const handleImportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await importExistingUser.mutateAsync({
        email: importEmail,
        roles: importRoles,
      });
      alert(
        result.imported
          ? `User imported: ${result.email} (roles: ${result.roles.join(', ')})`
          : `User updated: ${result.email} (roles: ${result.roles.join(', ')})`,
      );
      setIsImportModalOpen(false);
      setImportEmail('');
      setImportRoles(['user']);
    } catch (error: any) {
      console.error('Error importing user:', error);
      alert(`Error: ${error.message || 'Failed to import existing user'}`);
    }
  };

  const handleEditRoles = (user: { id: string; roles: string[] }) => {
    setEditingUser(user);
    setSelectedRoles([...user.roles]);
  };

  const handleSaveRoles = async () => {
    if (!editingUser || selectedRoles.length === 0) return;

    try {
      await updateUserRoles.mutateAsync({
        userId: editingUser.id,
        roles: selectedRoles,
      });
      setEditingUser(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error('Error updating user roles:', error);
    }
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'project-manager':
        return 'warning';
      case 'project-lead':
        return 'success';
      case 'tester':
        return 'info';
      case 'validator':
        return 'info';
      case 'developer':
        return 'info';
      default:
        return 'default';
    }
  };

  // Check if user has admin role
  const isAdmin = userRoles.includes('admin');

  React.useEffect(() => {
    if (isAdmin && !autoSyncedRef.current) {
      autoSyncedRef.current = true;
      syncUserRoles
        .mutateAsync({})
        .then(() => {
          // Sync silencieuse de tous les utilisateurs quand un admin ouvre la page
        })
        .catch((error: any) => {
          console.error('Error auto-syncing all user roles:', error?.message || error);
        });
    }
  }, [isAdmin, syncUserRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({
        email: createFormData.email,
        password: createFormData.password,
        displayName: createFormData.displayName || undefined,
        roles: createFormData.roles,
      });
      setIsCreateModalOpen(false);
      setCreateFormData({ email: '', password: '', displayName: '', roles: ['user'] });
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Error: ${error.message || 'Failed to create user. Make sure Firebase Functions are deployed.'}`);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await inviteUser.mutateAsync({
        email: inviteFormData.email,
        displayName: inviteFormData.displayName || undefined,
        roles: inviteFormData.roles,
      });
      setInviteResult({ email: result.email, tempPassword: result.tempPassword });
      setInviteFormData({ email: '', displayName: '', roles: ['user'] });
    } catch (error: any) {
      console.error('Error inviting user:', error);
      alert(`Error: ${error.message || 'Failed to invite user. Make sure Firebase Functions are deployed.'}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1 mb-2">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Users Management</h1>
          <p className="text-slate-600 font-medium">Manage users and their roles in the system</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button
              variant="secondary"
              onClick={() => setIsImportModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Import User
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="secondary"
              onClick={async () => {
                if (confirm('Synchroniser tous les rôles admin de Firestore vers Firebase Auth Custom Claims?')) {
                  try {
                    const result = await syncAllAdminRoles.mutateAsync();
                    alert(`Synchronisation terminée: ${result.synced} utilisateur(s) synchronisé(s) sur ${result.total}. Les utilisateurs doivent se déconnecter et se reconnecter.`);
                  } catch (error: any) {
                    alert(`Erreur: ${error.message || 'Échec de la synchronisation'}`);
                  }
                }
              }}
              isLoading={syncAllAdminRoles.isPending}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync All Admin Roles
            </Button>
          )}
          <Button variant="secondary" onClick={() => setIsInviteModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Invite User
          </Button>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </Button>
        </div>
      </div>

      <Card>
        <SectionTitle>All Users</SectionTitle>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2 font-medium">Error loading users</p>
              <p className="text-sm text-slate-500 mb-4">
                {(error as any)?.code === 'permission-denied' 
                  ? 'Permission denied. Your user needs the "admin" role in Firebase Auth Custom Claims (not just in Firestore).'
                  : (error as any)?.message || 'Failed to load users'}
              </p>
              {(error as any)?.code === 'permission-denied' && (
                <div className="bg-slate-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <p className="text-sm font-medium text-slate-700 mb-2">To fix this:</p>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Go to Firebase Console → Authentication → Users</li>
                    <li>Find your user (Paul) and click the 3 dots (⋮)</li>
                    <li>Select "Edit user" → Scroll to "Custom Claims"</li>
                    <li>
                      Add: <code className="bg-slate-200 px-1 rounded">{'{"roles": ["admin"]}'}</code>
                    </li>
                    <li>Save, then <strong>logout and login again</strong> in the app</li>
                  </ol>
                  <p className="text-xs text-slate-500 mt-3">
                    Current user roles in token: {userRoles.length > 0 ? userRoles.join(', ') : 'none (need to add admin)'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {users && users.length > 0 && (
                <div className="mb-4 text-sm text-slate-600">
                  Found {users.length} user{users.length > 1 ? 's' : ''}
                </div>
              )}
                            <Table>
                <TableHeader>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Roles</TableHeaderCell>
                  <TableHeaderCell align="right">Actions</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {users && users.length === 0 ? (
                    <TableRow>
                      <TableCell>
                        <div className="text-center py-12 text-slate-500">
                          <p className="mb-2">No users found</p>
                          <p className="text-sm">Create or invite a user to get started</p>
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ) : (
                    users?.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={user.email} size="md" />
                            <div>
                              <div className="font-medium text-slate-900">
                                {user.displayName || user.email.split('@')[0]}
                              </div>
                              {user.displayName && (
                                <div className="text-sm text-slate-500">{user.email}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map((role) => (
                              <Badge key={role} variant={getRoleBadgeVariant(role)} size="sm">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center gap-2 justify-end">
                            {user.id !== currentUser?.uid && (
                              <>
                          {isAdmin && !user.roles.includes('admin') && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Make ${user.email} an admin?`)) {
                                  try {
                                    await makeAdmin.mutateAsync({ userId: user.id });
                                  } catch (error) {
                                    console.error('Error making user admin:', error);
                                    alert('You need admin role to perform this action');
                                  }
                                }
                              }}
                              isLoading={makeAdmin.isPending}
                            >
                              Make Admin
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Synchroniser les rôles de ${user.email} vers Firebase Auth Custom Claims?`)) {
                                  try {
                                    await syncUserRoles.mutateAsync({ userId: user.id });
                                    alert('Rôles synchronisés! L\'utilisateur doit se déconnecter et se reconnecter.');
                                  } catch (error: any) {
                                    alert(`Erreur: ${error.message || 'Échec de la synchronisation'}`);
                                  }
                                }
                              }}
                              isLoading={syncUserRoles.isPending}
                              title="Synchroniser les rôles Firestore vers Custom Claims"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          )}
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleEditRoles(user)}
                                >
                                  Edit Roles
                                </Button>
                                {isAdmin && (
                                  <button
                                    onClick={() => setDeletingUserId(user.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete user"
                                  >
                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </>
                            )}
                            {user.id === currentUser?.uid && (
                              <span className="text-sm text-slate-400">Current User</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </Card>

      <Modal
        isOpen={!!editingUser}
        onClose={() => {
          setEditingUser(null);
          setSelectedRoles([]);
        }}
        title="Edit User Roles"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              Select roles for: <span className="font-medium">{editingUser?.id}</span>
            </p>
          </div>

          <FormField label="Roles" required>
            <div className="space-y-2">
              {ALLOWED_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 capitalize">{role.replace('-', ' ')}</div>
                    <div className="text-xs text-slate-500">
                      {role === 'admin' && 'Full system access'}
                      {role === 'project-manager' && 'Can create and manage projects'}
                      {role === 'project-lead' && 'Project lead / Chef de projet for specific projects'}
                      {role === 'tester' && 'Can test features and manage test-related tasks'}
                      {role === 'validator' && 'Can review and validate deliverables'}
                      {role === 'developer' && 'Can work on tasks and stories'}
                      {role === 'user' && 'Basic user access'}
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(role)} size="sm">
                    {role}
                  </Badge>
                </label>
              ))}
            </div>
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingUser(null);
                setSelectedRoles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveRoles}
              isLoading={updateUserRoles.isPending}
              disabled={selectedRoles.length === 0}
            >
              Save Roles
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Existing User Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportEmail('');
          setImportRoles(['user']);
        }}
        title="Import Existing User"
        size="md"
      >
        <form onSubmit={handleImportUser} className="space-y-4">
          <FormField label="User Email" required>
            <Input
              type="email"
              value={importEmail}
              onChange={(e) => setImportEmail(e.target.value)}
              placeholder="existing.user@example.com"
              required
            />
          </FormField>

          <FormField label="Roles to Assign">
            <div className="space-y-2">
              {ALLOWED_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={importRoles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setImportRoles([...importRoles, role]);
                      } else {
                        setImportRoles(importRoles.filter((r) => r !== role));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm capitalize">{role.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportEmail('');
                setImportRoles(['user']);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={importExistingUser.isPending}>
              Import User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFormData({ email: '', password: '', displayName: '', roles: ['user'] });
        }}
        title="Create New User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormField label="Email" required>
            <Input
              type="email"
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </FormField>
          <FormField label="Password" required>
            <Input
              type="password"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder="Enter password"
              required
              minLength={6}
            />
          </FormField>
          <FormField label="Display Name">
            <Input
              type="text"
              value={createFormData.displayName}
              onChange={(e) => setCreateFormData({ ...createFormData, displayName: e.target.value })}
              placeholder="John Doe"
            />
          </FormField>
          <FormField label="Initial Roles">
            <div className="space-y-2">
              {ALLOWED_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={createFormData.roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCreateFormData({
                          ...createFormData,
                          roles: [...createFormData.roles, role],
                        });
                      } else {
                        setCreateFormData({
                          ...createFormData,
                          roles: createFormData.roles.filter((r) => r !== role),
                        });
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm capitalize">{role.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </FormField>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateFormData({ email: '', password: '', displayName: '', roles: ['user'] });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createUser.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteFormData({ email: '', displayName: '', roles: ['user'] });
          setInviteResult(null);
        }}
        title="Invite User"
        size="md"
      >
        {inviteResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm font-medium text-emerald-900 mb-2">User invited successfully!</p>
              <p className="text-sm text-emerald-700">
                Email: <span className="font-medium">{inviteResult.email}</span>
              </p>
              <p className="text-sm text-emerald-700 mt-2">
                Temporary Password: <span className="font-mono font-medium">{inviteResult.tempPassword}</span>
              </p>
              <p className="text-xs text-emerald-600 mt-3">
                Share this password with the user. They should change it on first login.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteResult(null);
                  setInviteFormData({ email: '', displayName: '', roles: ['user'] });
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteUser} className="space-y-4">
            <FormField label="Email" required>
              <Input
                type="email"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
            </FormField>
            <FormField label="Display Name">
              <Input
                type="text"
                value={inviteFormData.displayName}
                onChange={(e) => setInviteFormData({ ...inviteFormData, displayName: e.target.value })}
                placeholder="John Doe"
              />
            </FormField>
            <FormField label="Initial Roles">
              <div className="space-y-2">
                {ALLOWED_ROLES.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={inviteFormData.roles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setInviteFormData({
                            ...inviteFormData,
                            roles: [...inviteFormData.roles, role],
                          });
                        } else {
                          setInviteFormData({
                            ...inviteFormData,
                            roles: inviteFormData.roles.filter((r) => r !== role),
                          });
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm capitalize">{role.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </FormField>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteFormData({ email: '', displayName: '', roles: ['user'] });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={inviteUser.isPending}>
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingUserId}
        onClose={() => setDeletingUserId(null)}
        onConfirm={async () => {
          if (deletingUserId) {
            await deleteUser.mutateAsync({ userId: deletingUserId });
            setDeletingUserId(null);
          }
        }}
        title="Delete User"
        message={`Are you sure you want to delete this user? This will remove their Firestore document. Note: This does not delete the Firebase Auth account. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
};

export default UsersManagementPage;


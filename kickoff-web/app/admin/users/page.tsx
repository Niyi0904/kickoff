'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Link2, Unlink } from 'lucide-react';
import { useAppContext } from '@/app/context/AppDataContext';
import { getAllUsersWithRoles, setUserRole } from '@/lib/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/app/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LinkUserToPlayerDialog } from '@/components/LinkUserToPlayerDialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { unlinkPlayer } from '@/lib/playerLinking';

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}

function UsersContent() {
  const { isAdmin, leagueId } = useAppContext();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);
  const [linkTarget, setLinkTarget] = useState<{ userId: string; userName: string } | null>(null);
  const [unlinkingPlayerId, setUnlinkingPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with roles...');
      const usersData = await getAllUsersWithRoles(leagueId);
      console.log('Fetched users:', usersData);
      setUsers(usersData);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only admins can access this section.</p>
        </div>
      </div>
    );
  }

  const handleChangeRole = async (userId: string, newRole: 'league_manager' | 'team_manager' | 'player') => {
    setChangingRoleUserId(userId);
    try {
      await setUserRole(userId, newRole);
      toast({ title: 'Success', description: `User role updated to ${newRole}` });
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    } finally {
      setChangingRoleUserId(null);
    }
  };

  const handleUnlink = async (playerId: string, userName: string) => {
    setUnlinkingPlayerId(playerId);
    try {
      await unlinkPlayer(playerId);
      toast({ title: 'Success', description: `Unlinked player profile from ${userName}` });
      await fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to unlink player profile', variant: 'destructive' });
    } finally {
      setUnlinkingPlayerId(null);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <UsersIcon className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold">All Users</h2>
        </div>

        {loading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 bg-secondary/40 animate-pulse rounded-lg" />
              <div className="h-6 w-32 bg-secondary/50 animate-pulse rounded-lg" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-secondary/30 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Link Player</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-secondary/50 transition-colors">
                    <td className="py-4 font-medium text-foreground">{user.displayName}</td>
                    <td className="py-4 text-muted-foreground">{user.email}</td>
                    <td className="py-4">
                      <span className="text-xs uppercase tracking-wider bg-accent/15 text-accent px-2 py-1 rounded-full font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleChangeRole(user.userId, newRole as 'league_manager' | 'team_manager' | 'player')}
                        disabled={changingRoleUserId === user.userId}
                      >
                        <SelectTrigger className="w-40 bg-secondary border-border text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="league_manager">League Manager</SelectItem>
                          <SelectItem value="team_manager">Team Manager</SelectItem>
                          <SelectItem value="player">Player</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4">
                      {user.linkedPlayerId ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Linked {user.linkedPlayerName ? `(${user.linkedPlayerName})` : ''}
                          </div>
                          <ConfirmDialog
                            title="Unlink Player Profile?"
                            description={`This will remove the link between ${user.displayName} and player profile ${user.linkedPlayerName || ''}. They will lose access to My Profile dashboard.`}
                            confirmLabel="Unlink Profile"
                            cancelLabel="Cancel"
                            onConfirm={() => handleUnlink(user.linkedPlayerId, user.displayName)}
                            loading={unlinkingPlayerId === user.linkedPlayerId}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Unlink Player Profile"
                              >
                                <Unlink className="w-3.5 h-3.5" />
                              </Button>
                            }
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLinkTarget({ userId: user.userId, userName: user.displayName })}
                          className="gap-1.5 text-xs text-primary hover:bg-primary/10"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Link Player
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <LinkUserToPlayerDialog
        userId={linkTarget?.userId ?? ''}
        userName={linkTarget?.userName ?? ''}
        open={linkTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLinkTarget(null);
            fetchUsers(); // Refresh when dialog closes (might have linked)
          }
        }}
      />
    </div>
  );
}

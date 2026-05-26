'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Mail, Copy, Trash2, Check, X, Link2, UserPlus, ChevronsUpDown } from 'lucide-react';
import { useAppContext } from '@/app/context/AppDataContext';
import {
  createUserInvite, getPendingInvites, setUserRole,
  getAllUsersWithRoles, deleteUserInvite, findPendingInviteByEmail,
  isUserRegistered, linkExistingUserToPlayer,
} from '@/lib/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/app/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLeagueSettings } from '@/app/hooks/use-leagueSettings';
import { DeadlineBanner } from '@/components/deadlineBanner';
import { InvitePlayerMode, NewPlayerData } from '@/lib/admin';
import { cn } from '@/lib/utils';
import { LinkUserToPlayerDialog } from '@/components/LinkUserToPlayerDialog';

const POSITIONS = [
  'Goal Keeper (GK)', 'Defender (DF)', 'Midfielder (MF)', 'Forward (FW)',
  'Central Defenders (CB)', 'Right Back (RB)', 'Left Back (LB)',
  'Left Wing (LW)', 'Right Wing (RW)', 'Striker (ST)',
  'Defensive Midfielder (DM)', 'Attacking Midfielder (AM)', 'Central Midfielder (CM)',
];

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

// ── Mode selector card (reusable) ─────────────────────────────
function ModeCard({
  selected, onClick, icon: Icon, title, description,
}: {
  selected: boolean; onClick: () => void; icon: React.ElementType;
  title: string; description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-xl border-2 transition-all space-y-0.5',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-background hover:border-border/80'
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', selected ? 'text-primary' : 'text-muted-foreground')} />
        <span className={cn('font-bold text-sm', selected ? 'text-primary' : 'text-foreground')}>
          {title}
        </span>
        {selected && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
      </div>
      <p className="text-xs text-muted-foreground pl-6">{description}</p>
    </button>
  );
}

function OnboardingContent() {
  const { isAdmin, user, players, teams } = useAppContext();
  const { toast }                         = useToast();
  const { deadlineMs, isDeadlinePassed }  = useLeagueSettings();

  // ── Existing invite state ──────────────────────────────────
  const [inviteEmail,       setInviteEmail]       = useState('');
  const [inviteRole,        setInviteRole]         = useState<'admin' | 'user'>('user');
  const [sendEmail,         setSendEmail]          = useState(true);
  const [isSubmitting,      setIsSubmitting]       = useState(false);
  const [openInviteDialog,  setOpenInviteDialog]   = useState(false);
  const [pendingInvites,    setPendingInvites]     = useState<any[]>([]);
  const [users,             setUsers]              = useState<any[]>([]);
  const [emailStatus,       setEmailStatus]        = useState<{ pendingInvite?: any; registered?: boolean } | null>(null);
  const [emailChecking,     setEmailChecking]      = useState(false);
  const [copiedCode,        setCopiedCode]         = useState<string | null>(null);
  const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);

  // ── NEW: player linking state ──────────────────────────────
  const [playerMode,        setPlayerMode]         = useState<InvitePlayerMode>('none');
  const [selectedPlayerId,  setSelectedPlayerId]   = useState('');
  const [playerSearch,      setPlayerSearch]       = useState(false);
  const [newPlayer,         setNewPlayer]          = useState<NewPlayerData>({
    name: '', position: POSITIONS[0], number: 0, teamId: '',
  });

  // ── NEW: Link existing user state ──────────────────────────
  const [linkTarget, setLinkTarget] = useState<{ userId: string; userName: string } | null>(null);

  // Unlinked players only — for the dropdown
  const unlinkedPlayers = useMemo(() =>
    players.filter((p: any) => !p.linkedUserId),
    [players]
  );
  const selectedPlayer = players.find((p: any) => p.id === selectedPlayerId);
  const selectedTeam   = selectedPlayer ? teams.find((t: any) => t.id === selectedPlayer.teamId) : null;

  useEffect(() => {
    if (isAdmin) { fetchPendingInvites(); fetchUsers(); }
  }, [isAdmin]);

  const fetchPendingInvites = async () => setPendingInvites(await getPendingInvites());
  const fetchUsers          = async () => setUsers(await getAllUsersWithRoles());

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only admins can access the onboarding section.</p>
        </div>
      </div>
    );
  }

  // ── Reset form ─────────────────────────────────────────────
  const resetInviteForm = () => {
    setInviteEmail(''); setInviteRole('user'); setSendEmail(true);
    setPlayerMode('none'); setSelectedPlayerId('');
    setNewPlayer({ name: '', position: POSITIONS[0], number: 0, teamId: '' });
    setEmailStatus(null);
  };

  // ── Validate ───────────────────────────────────────────────
  const isInviteValid = () => {
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) return false;
    if (emailStatus?.registered || emailStatus?.pendingInvite) return false;
    if (playerMode === 'link_existing' && !selectedPlayerId) return false;
    if (playerMode === 'create_new') {
      if (!newPlayer.name.trim() || !newPlayer.teamId) return false;
    }
    return true;
  };

  // ── Create invite — same logic as before + player mode ─────
  const handleCreateInvite = async () => {
    if (isDeadlinePassed) {
      toast({ title: 'Invitations Closed', description: 'New invitations are no longer accepted.', variant: 'destructive' });
      return;
    }
    if (!isInviteValid()) {
      toast({ title: 'Error', description: 'Please fill in all required fields correctly.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createUserInvite({
        email:            inviteEmail.trim(),
        role:             inviteRole,
        createdByAdminId: user?.uid || '',
        playerMode,
        playerId:   playerMode === 'link_existing' ? selectedPlayerId : undefined,
        newPlayer:  playerMode === 'create_new'    ? newPlayer        : undefined,
      });

      if (!res.error && 'inviteCode' in res) {
        // ── Same email sending logic you already had ──────────
        if (sendEmail) {
          try {
            const emailRes = await fetch('/api/send-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: inviteEmail, inviteCode: res.inviteCode, role: inviteRole }),
            });
            if (!emailRes.ok) {
              toast({ title: 'Warning', description: 'Invite created but email failed to send. Share the code manually.', variant: 'destructive' });
            } else {
              toast({ title: 'Success', description: 'Invite created and sent via email!' });
            }
          } catch {
            toast({ title: 'Warning', description: `Invite created: ${res.inviteCode}. Email failed — share the code manually.`, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Success', description: `Invite created: ${res.inviteCode}` });
        }

        resetInviteForm();
        setOpenInviteDialog(false);
        await fetchPendingInvites();

      } else if (res.error) {
        const code = (res.error as any).code;
        if (code === 'ALREADY_INVITED')        toast({ title: 'Invite Exists',      description: 'There is already a pending invite for this email.',    variant: 'destructive' });
        else if (code === 'ALREADY_REGISTERED') toast({ title: 'User Exists',        description: 'A user with this email is already registered.',        variant: 'destructive' });
        else if (code === 'PLAYER_ALREADY_LINKED') toast({ title: 'Already Linked', description: 'This player profile is already linked to an account.',  variant: 'destructive' });
        else toast({ title: 'Error', description: (res.error as any)?.message ?? 'Failed to create invite', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Copy, resend, revoke — identical to your existing logic ─
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleResendInvite = async (inviteCode: string, role: string) => {
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/send-invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, inviteCode, role }),
      });
      toast(resp.ok
        ? { title: 'Sent', description: 'Invite email resent' }
        : { title: 'Error', description: 'Failed to resend invite', variant: 'destructive' }
      );
    } catch {
      toast({ title: 'Error', description: 'Failed to resend invite', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const handleRevokeInvite = async (inviteCode: string) => {
    if (!confirm('Revoke this invite? This cannot be undone.')) return;
    setIsSubmitting(true);
    try {
      const res = await deleteUserInvite(inviteCode);
      if ((res as any).error) {
        toast({ title: 'Error', description: 'Failed to revoke invite', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Invite revoked' });
        await fetchPendingInvites();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to revoke invite', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'user') => {
    setChangingRoleUserId(userId);
    try {
      await setUserRole(userId, newRole);
      toast({ title: 'Success', description: `User role updated to ${newRole}` });
      await fetchUsers();
    } catch {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    } finally { setChangingRoleUserId(null); }
  };

  // ── Debounced email check — identical to your existing logic ─
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const email = inviteEmail?.trim();
    if (!email) { setEmailStatus(null); setEmailChecking(false); return; }
    setEmailChecking(true);
    t = setTimeout(async () => {
      try {
        const pending    = await findPendingInviteByEmail(email);
        const registered = await isUserRegistered(email);
        setEmailStatus({ pendingInvite: pending ?? undefined, registered: !!registered });
      } catch { setEmailStatus(null); }
      finally { setEmailChecking(false); }
    }, 400);
    return () => { if (t) clearTimeout(t); };
  }, [inviteEmail]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <DeadlineBanner deadlineMs={deadlineMs} isDeadlinePassed={isDeadlinePassed} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Invite new users and manage admin roles</p>
      </motion.div>

      {/* ── Invite Section ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Invite New User</h2>
        </div>

        <Dialog open={openInviteDialog} onOpenChange={(o) => { if (!o) resetInviteForm(); setOpenInviteDialog(o); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={isDeadlinePassed}>
              <Plus className="w-4 h-4" />
              {isDeadlinePassed ? 'Invitations Closed' : 'Create Invite'}
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create User Invite</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4">

              {/* ── Email — same as before ────────────────────── */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="user@gmail.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-secondary border-border"
                />
                <div className="mt-2">
                  {emailChecking ? (
                    <p className="text-sm text-muted-foreground">Checking email…</p>
                  ) : emailStatus?.registered ? (
                    <p className="text-sm text-destructive">This email is already registered.</p>
                  ) : emailStatus?.pendingInvite ? (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-amber-600">Pending invite exists (code: {emailStatus.pendingInvite.id})</p>
                      <Button size="sm" variant="ghost" onClick={() => handleResendInvite(emailStatus.pendingInvite.id, emailStatus.pendingInvite.role)}>
                        <Mail className="w-4 h-4" /> Resend
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ── Role — same as before ─────────────────────── */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Role</label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'user')}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ── NEW: Player linking mode ───────────────────── */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Player Profile Link</label>
                <div className="space-y-2">
                  <ModeCard
                    selected={playerMode === 'none'}
                    onClick={() => setPlayerMode('none')}
                    icon={Shield}
                    title="No player link"
                    description="Admin or manager — no player profile attached"
                  />
                  <ModeCard
                    selected={playerMode === 'link_existing'}
                    onClick={() => setPlayerMode('link_existing')}
                    icon={Link2}
                    title="Link existing player"
                    description="This person already has a player profile in your squad"
                  />
                  <ModeCard
                    selected={playerMode === 'create_new'}
                    onClick={() => setPlayerMode('create_new')}
                    icon={UserPlus}
                    title="Create new player"
                    description="Register a new player and link them automatically on sign-up"
                  />
                </div>
              </div>

              {/* ── Link existing — player search dropdown ────── */}
              <AnimatePresence>
                {playerMode === 'link_existing' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                      <label className="text-xs font-bold uppercase text-primary/70">Select Player</label>
                      <Popover open={playerSearch} onOpenChange={setPlayerSearch}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal bg-background">
                            {selectedPlayer
                              ? `${selectedPlayer.name} · ${selectedTeam?.name ?? '—'}`
                              : 'Search unlinked players...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search player..." />
                            <CommandList>
                              <CommandEmpty>No unlinked players found.</CommandEmpty>
                              <CommandGroup>
                                {unlinkedPlayers.map((p: any) => {
                                  const t = teams.find((t: any) => t.id === p.teamId);
                                  return (
                                    <CommandItem
                                      key={p.id}
                                      value={p.name}
                                      onSelect={() => { setSelectedPlayerId(p.id); setPlayerSearch(false); }}
                                    >
                                      <Check className={cn('mr-2 h-4 w-4', selectedPlayerId === p.id ? 'opacity-100' : 'opacity-0')} />
                                      <span>{p.name}</span>
                                      <span className="ml-auto text-xs text-muted-foreground">{t?.name}</span>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {unlinkedPlayers.length === 0 && (
                        <p className="text-xs text-muted-foreground">All players are already linked.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Create new player form ─────────────────── */}
                {playerMode === 'create_new' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl space-y-3">
                      <label className="text-xs font-bold uppercase text-green-700">New Player Details</label>
                      <Input
                        placeholder="Full name"
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        className="bg-background"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={newPlayer.position} onValueChange={(v) => setNewPlayer({ ...newPlayer, position: v })}>
                          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {POSITIONS.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Jersey #"
                          value={newPlayer.number || ''}
                          onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) || 0 })}
                          className="bg-background"
                        />
                      </div>
                      <Select value={newPlayer.teamId} onValueChange={(v) => setNewPlayer({ ...newPlayer, teamId: v })}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select Team" /></SelectTrigger>
                        <SelectContent>
                          {teams.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Send email checkbox — same as before ──────── */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                />
                <label htmlFor="send-email" className="text-sm text-muted-foreground cursor-pointer">
                  Send invite via email
                </label>
              </div>

              <Button
                onClick={handleCreateInvite}
                className="w-full"
                disabled={isSubmitting || !isInviteValid()}
              >
                {isSubmitting ? 'Creating...' : 'Create Invite'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* ── Pending Invites — identical to your existing UI ─────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
        <h2 className="font-display text-xl font-bold mb-6">Pending Invites</h2>
        <div className="space-y-3">
          {pendingInvites.length === 0 ? (
            <p className="text-muted-foreground">No pending invites</p>
          ) : (
            pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <p className="text-sm font-semibold">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">Code: {invite.id}</p>
                  {/* Show if invite has a player link */}
                  {invite.linkedPlayerId && (
                    <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {invite.playerMode === 'create_new' ? 'New player will be created' : 'Linked to existing player'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-full font-medium">{invite.role}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleCopyCode(invite.id)} className="gap-1">
                    {copiedCode === invite.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRevokeInvite(invite.id)} className="gap-1 text-destructive">
                    <Trash2 className="w-3 h-3" /> Revoke
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Manage Users — existing UI + new Link Player button ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <h2 className="font-display text-xl font-bold mb-6">Manage Users</h2>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            users.map((usr) => {
              // Check if this user already has a linked player
              const linkedPlayer = players.find((p: any) => p.linkedUserId === usr.userId);
              return (
                <div key={usr.userId} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="text-sm font-semibold">{usr.displayName}</p>
                    <p className="text-xs text-muted-foreground">{usr.email}</p>
                    {/* Show linked player name if exists */}
                    {linkedPlayer && (
                      <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {linkedPlayer.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* ── NEW: Link Player button — only if not already linked ── */}
                    {!linkedPlayer && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLinkTarget({ userId: usr.userId, userName: usr.displayName })}
                        className="gap-1.5 text-xs text-primary hover:bg-primary/10"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Link Player
                      </Button>
                    )}
                    {/* ── Role dropdown — same as before ─────────── */}
                    <Select
                      value={usr.role}
                      onValueChange={(newRole) => handleChangeRole(usr.userId, newRole as 'admin' | 'user')}
                      disabled={changingRoleUserId === usr.userId}
                    >
                      <SelectTrigger className="w-24 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* ── Link User to Player Dialog ───────────────────────────── */}
      <LinkUserToPlayerDialog
        userId={linkTarget?.userId ?? ''}
        userName={linkTarget?.userName ?? ''}
        open={linkTarget !== null}
        onOpenChange={(open) => !open && setLinkTarget(null)}
      />
    </div>
  );
}
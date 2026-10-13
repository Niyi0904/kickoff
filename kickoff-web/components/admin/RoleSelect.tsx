'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/app/context/AppDataContext';
import {
  assignTeamManager,
  changeUserRole,
  getLinkedPlayerForUser,
  getTeamManagerInfo,
  type LinkedPlayerInfo,
  type TeamManagerInfo,
} from '@/lib/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/hooks/use-toast';
import { AlertTriangle, Crown, Loader2 } from 'lucide-react';

type Role = 'league_manager' | 'team_manager' | 'player';

const ROLE_LABELS: Record<Role, string> = {
  league_manager: 'League Manager',
  team_manager: 'Team Manager',
  player: 'Player',
};

interface RoleSelectProps {
  userId: string;
  role: Role;
  disabled?: boolean;
  onDone: () => void | Promise<void>;
}

/**
 * Admin-only role switcher. Setting a team manager opens a team picker that
 * links the user's player to the team, warns when the team already has a
 * manager, and blocks demoting a manager while their team would be left
 * without one.
 */
export function RoleSelect({ userId, role, disabled, onDone }: RoleSelectProps) {
  const { toast } = useToast();
  const [changing, setChanging] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  const handleChange = async (next: Role) => {
    if (next === role) return;

    if (next === 'team_manager') {
      setTeamDialogOpen(true);
      return;
    }

    setChanging(true);
    const res = await changeUserRole(userId, next);
    setChanging(false);
    if (res.error) {
      toast({ title: 'Cannot change role', description: res.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: `Role updated to ${ROLE_LABELS[next]}` });
    await onDone();
  };

  return (
    <>
      <Select value={role} onValueChange={(v) => handleChange(v as Role)} disabled={disabled || changing}>
        <SelectTrigger className="w-40 bg-secondary border-border text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="league_manager">League Manager</SelectItem>
          <SelectItem value="team_manager">Team Manager</SelectItem>
          <SelectItem value="player">Player</SelectItem>
        </SelectContent>
      </Select>

      {teamDialogOpen && (
        <TeamManagerDialog
          userId={userId}
          onClose={() => setTeamDialogOpen(false)}
          onDone={onDone}
        />
      )}
    </>
  );
}

interface TeamManagerDialogProps {
  userId: string;
  onClose: () => void;
  onDone: () => void | Promise<void>;
}

function TeamManagerDialog({ userId, onClose, onDone }: TeamManagerDialogProps) {
  const { teams } = useAppContext();
  const { toast } = useToast();

  const [linked, setLinked] = useState<LinkedPlayerInfo | null | undefined>(undefined);
  const [teamId, setTeamId] = useState('');
  const [managerState, setManagerState] = useState<{ teamId: string; manager: TeamManagerInfo | null } | null>(null);
  const [confirmedTeamId, setConfirmedTeamId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadingLinked = linked === undefined;

  useEffect(() => {
    let active = true;
    getLinkedPlayerForUser(userId)
      .then((info) => {
        if (!active) return;
        setLinked(info);
        if (info?.teamId) setTeamId(info.teamId);
      })
      .catch(() => active && setLinked(null));
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!teamId) return;
    let active = true;
    getTeamManagerInfo(teamId).then((m) => active && setManagerState({ teamId, manager: m }));
    return () => {
      active = false;
    };
  }, [teamId]);

  const loadingManager = !!teamId && managerState?.teamId !== teamId;
  const manager = managerState?.teamId === teamId ? managerState.manager : null;
  const confirmed = !!teamId && confirmedTeamId === teamId;
  const linkedOnSelectedTeam = !!linked && linked.teamId === teamId;
  const existingOtherManager = !!manager && !!linked && manager.playerId !== linked.id;
  const canSave =
    !!linked && linkedOnSelectedTeam && (!existingOtherManager || confirmed) && !saving && !loadingManager;

  const handleSave = async () => {
    setSaving(true);
    const res = await assignTeamManager(userId, teamId);
    setSaving(false);
    if (res.error) {
      toast({ title: 'Cannot assign manager', description: res.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: `${linked?.name ?? 'User'} is now the team manager` });
    onClose();
    await onDone();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Manager</DialogTitle>
          <DialogDescription>
            Choose the team this user will manage. Their linked player becomes the team manager.
          </DialogDescription>
        </DialogHeader>

        {loadingLinked ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking linked player...
          </div>
        ) : !linked ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
            This user is not linked to a player profile yet. Use <strong>Link Player</strong> first, then
            set them as a team manager.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team</label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {teamId && !linkedOnSelectedTeam && (
              <p className="text-xs text-destructive">
                {linked.name} is not on this team. Pick the team they play for.
              </p>
            )}

            {loadingManager ? (
              <p className="text-xs text-muted-foreground">Checking current manager...</p>
            ) : existingOtherManager ? (
              <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                <p className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {manager?.playerName} already manages this team. Continue and replace them?
                </p>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmedTeamId(e.target.checked ? teamId : null)}
                    className="accent-primary"
                  />
                  <span>Yes, change the manager</span>
                </label>
              </div>
            ) : manager && linkedOnSelectedTeam && manager.playerId === linked.id ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> {linked.name} is already the manager of this
                team.
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? 'Saving...' : 'Assign Manager'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

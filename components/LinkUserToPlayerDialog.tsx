'use client';
// components/LinkUserToPlayerDialog.tsx
// Used in the User Management page.
// Lets admin directly link an already-registered user to a player profile.

import { useState, useMemo } from 'react';
import { Link2, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDataContext } from '@/app/context/DataContext';
import { useAuthContext } from '@/app/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { linkExistingUserToPlayer } from '@/lib/admin';
import { useToast } from '@/app/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LinkUserToPlayerDialogProps {
  userId:      string;
  userName:    string;
  open:        boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkUserToPlayerDialog({
  userId, userName, open, onOpenChange,
}: LinkUserToPlayerDialogProps) {
  const { players, teams } = useDataContext();
  const { user: adminUser } = useAuthContext();
  const { toast }          = useToast();
  const queryClient        = useQueryClient();

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerSearch,     setPlayerSearch]     = useState(false);
  const [loading,          setLoading]          = useState(false);

  // Only show players not yet linked to anyone
  const unlinkedPlayers = useMemo(() =>
    players.filter(p => !p.linkedUserId),
    [players]
  );

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const selectedTeam   = selectedPlayer ? teams.find(t => t.id === selectedPlayer.teamId) : null;

  const handleLink = async () => {
    if (!selectedPlayerId || !adminUser) return;
    setLoading(true);
    try {
      const result = await linkExistingUserToPlayer(userId, selectedPlayerId, adminUser.uid);
      if ('error' in result && result.error) {
        toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['linked_player'] });
      toast({ title: 'Player linked', description: `${userName} is now linked to ${selectedPlayer?.name}.` });
      onOpenChange(false);
      setSelectedPlayerId('');
    } catch {
      toast({ title: 'Error', description: 'Failed to link player.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Link2 className="w-5 h-5 text-primary" />
            Link Player Profile
          </DialogTitle>
          <DialogDescription>
            Select a player profile to link to{' '}
            <span className="font-semibold text-foreground">{userName}</span>'s account.
            They will immediately gain access to their My Profile dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Popover open={playerSearch} onOpenChange={setPlayerSearch}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal bg-background"
              >
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
                    {unlinkedPlayers.map(p => {
                      const t = teams.find(t => t.id === p.teamId);
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
            <p className="text-sm text-muted-foreground text-center py-2">
              All player profiles are already linked to accounts.
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedPlayerId || loading}
              onClick={handleLink}
            >
              {loading ? 'Linking...' : 'Link Player'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useEffect, useState } from "react";
import type { Player, Team } from "@/app/hooks/useAppData";
import { useAppContext } from "@/app/context/AppDataContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import {
  autoLineup,
  DEFAULT_FORMATION,
  FORMATIONS,
  FORMATION_NAMES,
  resolveFormation,
  type PositionGroup,
} from "@/lib/formation";

const GROUP_LABELS: Record<PositionGroup, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};

interface FormationEditorProps {
  team: Team;
  players: Player[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormationEditor({ team, players, open, onOpenChange }: FormationEditorProps) {
  const { updateTeam } = useAppContext();
  const [formation, setFormation] = useState(DEFAULT_FORMATION);
  const [lineup, setLineup] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const resolved = resolveFormation(team, players);
    setFormation(resolved.formation);
    setLineup(resolved.lineup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team.id]);

  const slots = FORMATIONS[formation] ?? FORMATIONS[DEFAULT_FORMATION];

  const handleFormationChange = (next: string) => {
    setFormation(next);
    setLineup(autoLineup(players, next));
  };

  const setSlot = (index: number, playerId: string) => {
    setLineup((prev) => {
      const next = [...prev];
      if (playerId) {
        const other = next.indexOf(playerId);
        if (other !== -1 && other !== index) next[other] = next[index];
      }
      next[index] = playerId;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTeam(team.id, { formation, lineup });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  // Running index per group so slots read "Defender 2", etc.
  const counters: Record<PositionGroup, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Formation</DialogTitle>
          <DialogDescription>
            Choose a shape and assign your squad to the slots. Leave it on auto to derive the XI from
            player positions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Select value={formation} onValueChange={handleFormationChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATION_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => setLineup(autoLineup(players, formation))}
          >
            <Sparkles className="w-4 h-4 text-primary" /> Auto-fill
          </Button>
        </div>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {slots.map((slot, index) => {
            counters[slot.group] += 1;
            const value = lineup[index] ?? "";
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {GROUP_LABELS[slot.group]} {counters[slot.group]}
                </span>
                <Select
                  value={value || "unassigned"}
                  onValueChange={(v) => setSlot(index, v === "unassigned" ? "" : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Formation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

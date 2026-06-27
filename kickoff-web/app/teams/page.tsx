'use client';

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Users, Crown, Trash2, Upload, Mail, X, Search, Check, Clock, Swords, ImageUp, LayoutGrid } from "lucide-react";
import { uploadProfileImage } from "@/lib/uploadImage";
import { useAppContext } from "../context/AppDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Edit2 } from "lucide-react";
import { Team } from "../hooks/useAppData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamLogoUploadDialog } from "@/components/TeamLogoUploadDialog";
import { useRouter } from "next/navigation";
import { useLeagueSettings } from "../hooks/use-leagueSettings";
import { DeadlineBanner } from "@/components/deadlineBanner";
import { Badge } from "@/components/ui/badge";

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsContent />
    </ProtectedRoute>
  );
}

// ─────────────────────────────────────────────
// Organization Progress Panel Component
// ─────────────────────────────────────────────
function OrganizationProgressPanel({ 
  hasTeam, 
  isApproved, 
  hasPlayers, 
  hasBadge 
}: { 
  hasTeam: boolean; 
  isApproved: boolean; 
  hasPlayers: boolean; 
  hasBadge: boolean;
}) {
  const steps = [
    { label: "Team Registration", done: hasTeam, icon: Shield },
    { label: "Team Approval", done: isApproved, icon: Check, pending: !isApproved && hasTeam },
    { label: "Squad Submission", done: hasPlayers, icon: Users },
    { label: "Badge Upload", done: hasBadge, icon: ImageUp },
  ];

  const completedCount = steps.filter(s => s.done).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-4 z-40 mx-auto max-w-3xl"
    >
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Organization Progress</h3>
          <span className="text-xs text-muted-foreground">{completedCount}/4 completed</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            let stateClass = "bg-muted text-muted-foreground";
            let labelClass = "text-muted-foreground";
            
            if (step.done) {
              stateClass = "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
              labelClass = "text-emerald-500";
            } else if (step.pending) {
              stateClass = "bg-amber-500/20 text-amber-500 border-amber-500/30";
              labelClass = "text-amber-500";
            }

            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${stateClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] text-center leading-tight font-medium ${labelClass}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Glassmorphism Team Card
// ─────────────────────────────────────────────
function TeamCard({ team, index }: { team: Team; index: number }) {
  const { getTeamPlayers, getTeamManager, isAdmin, isTeamManager, teamId, approveTeam, deleteTeam, updateTeam, matches } = useAppContext();
  const router = useRouter();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [selectedTeamForLogo, setSelectedTeamForLogo] = useState<Team | null>(null);
  const { isDeadlinePassed } = useLeagueSettings();

  const teamPlayers = getTeamPlayers(team.id);
  const manager = getTeamManager(team.id);
  const canEditTeam = isAdmin || (isTeamManager && teamId === team.id);
  const matchCount = matches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/teams/${team.id}`)}
    >
      {/* Top color bar */}
      <div className="h-1.5" style={{ backgroundColor: team.primaryColor }} />

      <div className="p-5">
        {/* Top row: Avatar/Logo + Name/Manager */}
        <div className="flex items-start gap-4 mb-4">
          {/* Team Avatar with Logo */}
          <Avatar className="w-14 h-14 rounded-xl border-2 border-secondary shadow-sm shrink-0">
            <AvatarImage src={team.logo || ""} alt={team.name} className="object-cover" />
            <AvatarFallback 
              style={{ backgroundColor: team.primaryColor }} 
              className="rounded-xl font-bold text-lg text-white"
            >
              {team.abbreviation}
            </AvatarFallback>
          </Avatar>

          {/* Name and Manager */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base truncate group-hover:text-primary transition-colors">
              {team.name}
            </h3>
            {manager && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="truncate">{manager.name}</span>
              </p>
            )}
            {!manager && (
              <p className="text-xs text-muted-foreground mt-0.5">No manager assigned</p>
            )}
          </div>

          {/* Edit button (absolute to avoid layout issues) */}
          {canEditTeam && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingTeam(team); }}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{teamPlayers.length}</span>
            <span>Players</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Swords className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{matchCount}</span>
            <span>Matches</span>
          </div>
        </div>

        {/* Footer: Badge + Squad button */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          {/* Approval Badge */}
          {team.approved ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] px-2 py-0.5 font-medium">
              <Check className="w-3 h-3 mr-1" /> Approved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] px-2 py-0.5 font-medium">
              <Clock className="w-3 h-3 mr-1" /> Pending Review
            </Badge>
          )}

          {/* Approve button for league_manager on pending teams */}
          {isAdmin && !team.approved && (
            <button
              onClick={(e) => { e.stopPropagation(); approveTeam(team.id); }}
              className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-500/10"
            >
              Approve
            </button>
          )}

          {/* Squad button */}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/teams/${team.id}`); }}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1 rounded-lg hover:bg-primary/10"
          >
            Squad &rarr;
          </button>
        </div>
      </div>

      {/* Edit Team Modal */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
        <DialogContent className="bg-card border-border" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Team — {editingTeam?.name}</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Team Name</label>
                <Input value={editingTeam.name} onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Abbreviation</label>
                <Input value={editingTeam.abbreviation} onChange={(e) => setEditingTeam({ ...editingTeam, abbreviation: e.target.value })} className="bg-secondary border-border uppercase" maxLength={4} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Stadium</label>
                <Input value={editingTeam.stadium} onChange={(e) => setEditingTeam({ ...editingTeam, stadium: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Year Founded</label>
                <Input value={editingTeam.founded} onChange={(e) => setEditingTeam({ ...editingTeam, founded: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Team Color</label>
                <input type="color" value={editingTeam.primaryColor} onChange={(e) => setEditingTeam({ ...editingTeam, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
              </div>
              <Button 
                onClick={async () => {
                  if (!editingTeam) return;
                  await updateTeam(editingTeam.id, editingTeam);
                  setEditingTeam(null);
                }} 
                className="w-full"
              >
                Save Changes
              </Button>
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {teamPlayers.length > 0 ? "Cannot Delete Team" : "Are you absolutely sure?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {teamPlayers.length > 0 ? (
                          <>The team <strong>{team.name}</strong> currently has <strong>{teamPlayers.length}</strong> players. You must remove or reassign all players before this team can be deleted.</>
                        ) : (
                          <>This will permanently delete <strong>{team.name}</strong> and all associated data.</>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      {teamPlayers.length === 0 && (
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={async () => await deleteTeam(team.id)}
                        >
                          Delete Team
                        </AlertDialogAction>
                      )}
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Add Team Card (inside the grid)
// ─────────────────────────────────────────────
function AddTeamCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-8 bg-emerald-500/10 backdrop-blur-xl border-2 border-dashed border-emerald-500/30 rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 min-h-[240px] group"
    >
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Plus className="w-7 h-7 text-emerald-500" />
      </div>
      <span className="text-emerald-500 font-semibold text-lg">Add Team</span>
      <span className="text-xs text-emerald-500/70">Register a new club</span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Main Content
// ─────────────────────────────────────────────
function TeamsContent() {
  const { teams, addTeam, isAdmin, isTeamManager, teamId, players } = useAppContext();
  const router = useRouter();
  const { deadlineMs, isDeadlinePassed, seasonName } = useLeagueSettings();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    abbreviation: "", 
    stadium: "", 
    founded: "", 
    primaryColor: "#3b82f6", 
    logoFile: null as File | null 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ── Derived state for current user's team ──
  const myTeam = useMemo(() => {
    if (isAdmin) return null;
    if (teamId) return teams.find(t => t.id === teamId) ?? null;
    return null;
  }, [isAdmin, teamId, teams]);

  const myTeamPlayers = useMemo(() => {
    if (!myTeam) return [];
    return players.filter(p => p.teamId === myTeam.id);
  }, [myTeam, players]);

  const hasTeam = !!myTeam;
  const isApproved = myTeam?.approved ?? false;
  const hasPlayers = myTeamPlayers.length > 0;
  const hasBadge = !!myTeam?.logo;

  // ── Filtered teams ──
  const filteredTeams = useMemo(() => {
    let result = [...teams];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.abbreviation.toLowerCase().includes(q) ||
        t.stadium.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus === "approved") {
      result = result.filter(t => t.approved);
    } else if (filterStatus === "pending") {
      result = result.filter(t => !t.approved);
    }

    return result;
  }, [teams, searchQuery, filterStatus]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.abbreviation.trim()) return;
    setIsSubmitting(true);
    try {
      let logoUrl: string | null = null;
      if (form.logoFile) {
        try {
          const uploadRes = await uploadProfileImage(form.logoFile);
          logoUrl = uploadRes?.data?.url ?? null;
        } catch (err) {
          console.error("logo upload failed", err);
        }
      }

      await addTeam({
        name: form.name,
        abbreviation: form.abbreviation.toUpperCase().slice(0, 4),
        stadium: form.stadium,
        founded: form.founded,
        primaryColor: form.primaryColor,
        logo: logoUrl ?? null,
      });

      setForm({ name: "", abbreviation: "", stadium: "", founded: "", primaryColor: "#3b82f6", logoFile: null });
      setOpen(false);
    } catch (err) {
      console.error("addTeam flow error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAddTeam = isAdmin || isTeamManager;

  return (
    <div className="px-4 min-w-0 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <DeadlineBanner deadlineMs={deadlineMs} isDeadlinePassed={isDeadlinePassed} />
      </motion.div>

      {/* ── Breadcrumb ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
      >
        <span>Teams</span>
        <span className="text-xs">/</span>
        <span className="text-foreground font-medium">{seasonName}</span>
      </motion.div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and view all registered clubs</p>
        </motion.div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/60 backdrop-blur-xl border-border/50 rounded-xl h-10 text-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] bg-background/60 backdrop-blur-xl border-border/50 rounded-xl h-10">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Team Grid ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Team Card — inside grid */}
        {canAddTeam && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <AddTeamCard onClick={() => setOpen(true)} />
            </DialogTrigger>
            <DialogContent className="bg-background/80 backdrop-blur-2xl border-border/50 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-bold">Register Club</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Fill in the details to register a new team</p>
              </DialogHeader>

              {/* Frosted modal form */}
              <div className="space-y-5 mt-4">
                {/* Club Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Club Name</label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. Arsenal FC" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="bg-secondary/50 border-border/50 rounded-xl h-11 pl-10"
                    />
                    {form.name && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Club Abbreviation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Club Abbreviation</label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. ARS" 
                      value={form.abbreviation} 
                      onChange={(e) => setForm({ ...form, abbreviation: e.target.value.toUpperCase() })} 
                      className="bg-secondary/50 border-border/50 rounded-xl h-11 pl-10 uppercase"
                      maxLength={4}
                    />
                    {form.abbreviation && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">#</span>
                  </div>
                </div>

                {/* Manager (auto-displayed for team_manager, selectable for league_manager) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Manager</label>
                  <div className="bg-secondary/50 border border-border/50 rounded-xl h-11 px-4 flex items-center text-sm text-muted-foreground">
                    <Crown className="w-4 h-4 mr-2 text-amber-500" />
                    {isAdmin ? "Select manager after creation" : "You will be assigned as manager"}
                  </div>
                </div>

                {/* Home Stadium */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Home Stadium</label>
                  <Input 
                    placeholder="e.g. Emirates Stadium" 
                    value={form.stadium} 
                    onChange={(e) => setForm({ ...form, stadium: e.target.value })} 
                    className="bg-secondary/50 border-border/50 rounded-xl h-11"
                  />
                </div>

                {/* Year Founded */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Year Founded</label>
                  <Input 
                    placeholder="e.g. 1886" 
                    value={form.founded} 
                    onChange={(e) => setForm({ ...form, founded: e.target.value })} 
                    className="bg-secondary/50 border-border/50 rounded-xl h-11"
                  />
                </div>

                {/* Color picker */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Team Color</label>
                  <input 
                    type="color" 
                    value={form.primaryColor} 
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} 
                    className="w-10 h-10 rounded-xl cursor-pointer border-0" 
                  />
                </div>

                {/* Logo upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Team Logo (optional)</label>
                  <div className="bg-secondary/50 border border-border/50 rounded-xl p-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, logoFile: e.target.files?.[0] ?? null })}
                      className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-medium"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  disabled={isDeadlinePassed || isSubmitting || !form.name.trim() || !form.abbreviation.trim()}
                >
                  {isSubmitting ? "Registering..." : "Register Club"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Team Cards */}
        {filteredTeams.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} />
        ))}
      </div>

      {/* Empty state */}
      {filteredTeams.length === 0 && !canAddTeam && (
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No teams found</p>
        </div>
      )}

      {/* ── Organization Progress Panel (sticky bottom) ── */}
      {!isAdmin && (
        <OrganizationProgressPanel 
          hasTeam={hasTeam}
          isApproved={isApproved}
          hasPlayers={hasPlayers}
          hasBadge={hasBadge}
        />
      )}
    </div>
  );
}
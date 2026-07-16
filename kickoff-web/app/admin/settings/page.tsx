'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Calendar, Trophy, Save, RefreshCw,
    Shield, CheckCircle2, Clock, Hash, MapPin,
    ChevronRight, AlertTriangle, Globe, Lock
} from 'lucide-react';
import { useAppContext } from '@/app/context/AppDataContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLeagueSettings } from '@/app/hooks/use-leagueSettings';
import { useQueryClient } from '@tanstack/react-query';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/app/hooks/use-toast';
import { cn } from '@/lib/utils';
import { runRoleMigration } from '@/lib/admin';

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    );
}

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────
function SettingsSection({
    icon: Icon,
    title,
    description,
    children,
    delay = 0,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
        >
            {/* Section header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-secondary/20">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="font-bold text-foreground text-base">{title}</h2>
                    <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
                </div>
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Individual setting row
// ─────────────────────────────────────────────
function SettingRow({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="sm:w-48 shrink-0">
                <Label className="text-sm font-semibold text-foreground">{label}</Label>
                {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Save status badge
// ─────────────────────────────────────────────
function SaveStatus({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
    if (status === 'idle') return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                    'flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border',
                    status === 'saving' && 'text-primary border-primary/30 bg-primary/10',
                    status === 'saved' && 'text-green-500 border-green-500/30 bg-green-500/10',
                    status === 'error' && 'text-destructive border-destructive/30 bg-destructive/10',
                )}
            >
                {status === 'saving' && <RefreshCw className="w-3 h-3 animate-spin" />}
                {status === 'saved' && <CheckCircle2 className="w-3 h-3" />}
                {status === 'error' && <AlertTriangle className="w-3 h-3" />}
                {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Error saving'}
            </motion.div>
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────
function SettingsContent() {
    const { isAdmin } = useAppContext();
    const { settings, isLoading } = useLeagueSettings();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // ── Local form state — mirrors the Firestore settings doc ──────────────
    const [seasonName, setSeasonName] = useState('');
    const [inviteDeadline, setInviteDeadline] = useState('');
    const [leagueVenue, setLeagueVenue] = useState('');
    const [matchDay, setMatchDay] = useState('Tuesday');
    const [defaultTime, setDefaultTime] = useState('10:00');
    const [pointsWin, setPointsWin] = useState('3');
    const [pointsDraw, setPointsDraw] = useState('1');
    const [pointsLoss, setPointsLoss] = useState('0');
    const [yellowsPerBan, setYellowsPerBan] = useState('3');

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [hasChanges, setHasChanges] = useState(false);
    const [migrating, setMigrating] = useState(false);

    // ── Populate form when settings load from Firestore ───────────────────
    useEffect(() => {
        if (!settings) return;
        setSeasonName(settings.seasonName || '');
        // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
        const dl = (typeof settings.inviteDeadline === 'string') 
            ? settings.inviteDeadline.slice(0, 16) 
            : '';
        setInviteDeadline(dl);
        setLeagueVenue(settings.leagueVenue || '');
        setMatchDay(settings.matchDay || 'Tuesday');
        setDefaultTime(settings.defaultTime || '10:00');
        setPointsWin(String(settings.pointsWin ?? 3));
        setPointsDraw(String(settings.pointsDraw ?? 1));
        setPointsLoss(String(settings.pointsLoss ?? 0));
        setYellowsPerBan(String(settings.yellowsPerBan ?? 3));
        setHasChanges(false);
    }, [settings]);

    const markChanged = () => setHasChanges(true);

    // ── Run role migration ─────────────────────────────────────────────────
    const handleMigration = async () => {
        setMigrating(true);
        try {
            const result = await runRoleMigration();
            if (result.success) {
                toast({ title: 'Migration Complete', description: `Updated ${result.count} user role(s) to new schema.` });
            } else {
                toast({ title: 'Migration Failed', description: String(result.error), variant: 'destructive' });
            }
        } catch (err: any) {
            toast({ title: 'Migration Error', description: err.message, variant: 'destructive' });
        } finally {
            setMigrating(false);
        }
    };

    // ── Save to Firestore ──────────────────────────────────────────────────
    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            await setDoc(doc(db, 'settings', 'league'), {
                seasonName,
                // Store as full ISO string for consistency
                inviteDeadline: inviteDeadline ? `${inviteDeadline}:00` : '',
                leagueVenue,
                matchDay,
                defaultTime,
                pointsWin: Number(pointsWin),
                pointsDraw: Number(pointsDraw),
                pointsLoss: Number(pointsLoss),
                yellowsPerBan: Number(yellowsPerBan),
                leagueId: settings?.leagueId ?? 'default',
            }, { merge: true });

            // Invalidate the settings cache so all components get fresh values
            queryClient.invalidateQueries({ queryKey: ['settings', 'league'] });

            setSaveStatus('saved');
            setHasChanges(false);
            toast({ title: 'Settings saved', description: 'League configuration updated successfully.' });
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
            toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    // ── Access guard ───────────────────────────────────────────────────────
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4 p-10 bg-card rounded-2xl border border-border max-w-sm"
                >
                    <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Admin Only</h2>
                    <p className="text-muted-foreground text-sm">
                        Only league admins can access the settings panel.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-8 pb-20 max-w-3xl">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-secondary/50 animate-pulse rounded-xl" />
                    <div className="h-4 w-64 bg-secondary/30 animate-pulse rounded-xl" />
                </div>
                <div className="glass-card rounded-2xl border border-border/50 p-6 space-y-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-24 bg-secondary/40 animate-pulse rounded-lg" />
                            <div className="h-10 bg-secondary/30 animate-pulse rounded-xl" />
                        </div>
                    ))}
                    <div className="h-12 bg-secondary/30 animate-pulse rounded-xl" />
                </div>
            </div>
        );
    }

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="space-y-8 pb-20 max-w-3xl">

            {/* ── Page header ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                        League Settings
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Configure your league — changes apply instantly across the app.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SaveStatus status={saveStatus} />
                    <Button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving' || !hasChanges}
                        className="gap-2 shadow-lg shadow-primary/20"
                    >
                        <Save className="w-4 h-4" />
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </motion.div>

            {/* Unsaved changes warning */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl text-sm text-accent font-medium"
                    >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        You have unsaved changes — hit Save Changes to apply them.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Section 1: League Identity ──────────────────────────────── */}
            <SettingsSection
                icon={Trophy}
                title="League Identity"
                description="Basic information displayed across the app"
                delay={0.05}
            >
                <SettingRow
                    label="Season Name"
                    hint="Shown on the dashboard and standings page"
                >
                    <Input
                        value={seasonName}
                        onChange={(e) => { setSeasonName(e.target.value); markChanged(); }}
                        placeholder="e.g. 2026/27 Antigravity League"
                        className="bg-background border-border focus:border-primary"
                    />
                </SettingRow>

                <div className="border-t border-border/50" />

                <SettingRow
                    label="Home Venue"
                    hint="Default venue name shown on fixtures"
                >
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={leagueVenue}
                            onChange={(e) => { setLeagueVenue(e.target.value); markChanged(); }}
                            placeholder="e.g. Antigravity Sports Complex"
                            className="pl-9 bg-background border-border focus:border-primary"
                        />
                    </div>
                </SettingRow>
            </SettingsSection>

            {/* ── Section 2: Registration Window ─────────────────────────── */}
            <SettingsSection
                icon={Calendar}
                title="Registration Window"
                description="Controls when player and team invitations close"
                delay={0.1}
            >
                <SettingRow
                    label="Invite Deadline"
                    hint="Players & teams cannot register after this date and time"
                >
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="datetime-local"
                            value={inviteDeadline}
                            onChange={(e) => { setInviteDeadline(e.target.value); markChanged(); }}
                            className="pl-9 bg-background border-border focus:border-primary"
                        />
                    </div>
                </SettingRow>

                {/* Live preview of deadline */}
                {inviteDeadline && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-4 py-2.5 rounded-lg border border-border/50"
                    >
                        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                            Deadline set to{' '}
                            <span className="font-semibold text-foreground">
                                {new Date(inviteDeadline).toLocaleString('en-GB', {
                                    weekday: 'long', day: 'numeric', month: 'long',
                                    year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </span>
                    </motion.div>
                )}
            </SettingsSection>

            {/* ── Section 3: Fixture Defaults ─────────────────────────────── */}
            <SettingsSection
                icon={Settings}
                title="Fixture Defaults"
                description="Used when auto-generating match fixtures"
                delay={0.15}
            >
                <SettingRow
                    label="Match Day"
                    hint="Day of the week fixtures are auto-scheduled on"
                >
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => { setMatchDay(day); markChanged(); }}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                                    matchDay === day
                                        ? 'bg-primary/15 border-primary text-primary'
                                        : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                                )}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </SettingRow>

                <div className="border-t border-border/50" />

                <SettingRow
                    label="Default Kick-off"
                    hint="Default start time for generated fixtures"
                >
                    <div className="relative w-40">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="time"
                            value={defaultTime}
                            onChange={(e) => { setDefaultTime(e.target.value); markChanged(); }}
                            className="pl-9 bg-background border-border focus:border-primary"
                        />
                    </div>
                </SettingRow>
            </SettingsSection>

            {/* ── Section 4: Points System ────────────────────────────────── */}
            <SettingsSection
                icon={Hash}
                title="Points System"
                description="Points awarded per match result — affects standings table"
                delay={0.2}
            >
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Win', emoji: '🏆', value: pointsWin, set: setPointsWin },
                        { label: 'Draw', emoji: '🤝', value: pointsDraw, set: setPointsDraw },
                        { label: 'Loss', emoji: '❌', value: pointsLoss, set: setPointsLoss },
                    ].map(({ label, emoji, value, set }) => (
                        <div key={label} className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {emoji} {label}
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                value={value}
                                onChange={(e) => { set(e.target.value); markChanged(); }}
                                className="bg-background border-border focus:border-primary text-center font-bold text-lg"
                            />
                        </div>
                    ))}
                </div>

                {/* Points preview */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-secondary/30 px-4 py-2.5 rounded-lg border border-border/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                        Win = <span className="font-bold text-foreground">{pointsWin} pts</span>
                        {' · '}Draw = <span className="font-bold text-foreground">{pointsDraw} pts</span>
                        {' · '}Loss = <span className="font-bold text-foreground">{pointsLoss} pts</span>
                    </span>
                </div>
            </SettingsSection>

            {/* ── Section 5: Discipline Rules ─────────────────────────────── */}
            <SettingsSection
                icon={Shield}
                title="Discipline Rules"
                description="Automatic suspension thresholds"
                delay={0.25}
            >
                <SettingRow
                    label="Yellows per Ban"
                    hint="How many yellow cards trigger a 1-match suspension"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative w-28">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={yellowsPerBan}
                                onChange={(e) => { setYellowsPerBan(e.target.value); markChanged(); }}
                                className="pl-9 bg-background border-border focus:border-primary font-bold"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Players receive a 1-match ban after every{' '}
                            <span className="font-semibold text-accent">{yellowsPerBan}</span> yellow cards.
                            Red cards always trigger an immediate 1-match ban.
                        </p>
                    </div>
                </SettingRow>
            </SettingsSection>

            {/* ── Section 6: Data Migration ───────────────────────────────
            <SettingsSection
                icon={RefreshCw}
                title="Data Migration"
                description="One-time migration to update old role values (admin/user) to new schema (league_manager/team_manager/player)"
                delay={0.3}
            >
                <SettingRow
                    label="Migrate Roles"
                    hint="Converts old 'admin' → league_manager, 'user' → player (or team_manager if is_manager). Safe to run multiple times."
                >
                    <Button
                        onClick={handleMigration}
                        disabled={migrating}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className={cn('w-4 h-4', migrating && 'animate-spin')} />
                        {migrating ? 'Migrating...' : 'Run Role Migration'}
                    </Button>
                </SettingRow>
            </SettingsSection> */}

            {/* ── Bottom save bar ─────────────────────────────────────────── */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-card border border-border rounded-2xl shadow-2xl shadow-black/40"
                    >
                        <p className="text-sm text-muted-foreground">Unsaved changes</p>
                        <div className="w-px h-4 bg-border" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                // Reset to last saved values
                                if (!settings) return;
                                setSeasonName(settings.seasonName || '');
                                setInviteDeadline(settings.inviteDeadline ? settings.inviteDeadline.slice(0, 16) : '');
                                setLeagueVenue(settings.leagueVenue || '');
                                setMatchDay(settings.matchDay || 'Tuesday');
                                setDefaultTime(settings.defaultTime || '10:00');
                                setPointsWin(String(settings.pointsWin ?? 3));
                                setPointsDraw(String(settings.pointsDraw ?? 1));
                                setPointsLoss(String(settings.pointsLoss ?? 0));
                                setYellowsPerBan(String(settings.yellowsPerBan ?? 3));
                                setHasChanges(false);
                            }}
                        >
                            Discard
                        </Button>
                        <Button onClick={handleSave} disabled={saveStatus === 'saving'} size="sm" className="gap-2">
                            <Save className="w-3.5 h-3.5" />
                            Save Changes
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
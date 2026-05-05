'use client';

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import { distance } from "framer-motion";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface DeadlineBannerProps {
    deadlineMs: number;      // Unix timestamp in milliseconds from useLeagueSettings
    isDeadlinePassed: boolean;
}

export function DeadlineBanner({ deadlineMs, isDeadlinePassed }: DeadlineBannerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        // Don't start the timer if deadline has already passed
        if (isDeadlinePassed) {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const distance = deadlineMs - Date.now();
            if (distance <= 0) {
                setTimeLeft(null);
                return;
            }
            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        };
        tick(); // Run immediately so there's no 1-second blank flash
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [deadlineMs, isDeadlinePassed]);

    // ── Deadline passed — show closed banner ──────────────────────────────
    if (isDeadlinePassed) {
        return (
            <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-xl flex items-center gap-3 mb-8">
                <div className="p-2 bg-destructive/20 rounded-lg">
                    <X className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-destructive font-bold text-sm">
                    Registration window has closed.
                </p>
            </div>
        );
    }

    // ── Deadline upcoming — show countdown banner ─────────────────────────
    return (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Mail className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-amber-600 font-bold text-lg">Invitation Window Closing</h3>
                    <p className="text-amber-700/80 text-sm max-w-md">
                        New league invites will be disabled soon. Get your team registered before the clock runs out!
                    </p>
                </div>
            </div>

            {timeLeft && (
                <div className="flex gap-2">
                    {[
                        { label: 'Days', value: timeLeft.days },
                        { label: 'Hrs', value: timeLeft.hours },
                        { label: 'Min', value: timeLeft.minutes },
                        { label: 'Sec', value: timeLeft.seconds },
                    ].map((unit) => (
                        <div
                            key={unit.label}
                            className="flex flex-col items-center min-w-[60px] p-2 bg-amber-100/50 dark:bg-black/20 rounded-lg border border-amber-500/20"
                        >
                            <span className="text-xl font-mono font-bold text-amber-900">
                                {String(unit.value).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] uppercase tracking-tighter text-amber-800 font-bold">
                                {unit.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
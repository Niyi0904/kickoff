'use client';

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/app/hooks/useAppData";

interface LiveCommentaryProps {
  match: Match;
}

export function LiveCommentary({ match }: LiveCommentaryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const moments = useMemo(() => {
    if (!match?.keyMoments) return [];
    return match.keyMoments
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string, index: number) => {
        const minuteRegex = /^(\d+)'?\s*[-:]?\s*(.*)$/;
        const matchArr = line.match(minuteRegex);
        return {
          id: `moment-${index}`,
          minute: matchArr ? parseInt(matchArr[1]) : null,
          text: matchArr ? matchArr[2] : line,
        };
      });
  }, [match?.keyMoments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moments.length]);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Live Commentary</h3>
      <div
        ref={scrollRef}
        className="relative space-y-3 max-h-[500px] overflow-y-auto pr-2 scroll-smooth"
      >
        {moments.length > 0 ? (
          moments.map((moment, idx) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex gap-3 items-start"
            >
              <div className="flex flex-col items-center shrink-0">
                {moment.minute !== null ? (
                  <Badge className="text-[9px] font-black tabular-nums px-1.5 py-0.5 min-w-[32px] text-center bg-primary/10 text-primary border-primary/20">
                    {moment.minute}&prime;
                  </Badge>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-1.5" />
                )}
                {idx < moments.length - 1 && (
                  <div className="w-px flex-1 bg-border/40 min-h-[8px]" />
                )}
              </div>
              <div className={cn(
                "flex-1 p-3 rounded-xl border text-sm leading-relaxed",
                moment.minute !== null
                  ? "bg-secondary/20 border-border/50"
                  : "bg-muted/10 border-dashed border-border/30 italic text-muted-foreground"
              )}>
                {moment.text}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-muted-foreground">Waiting for Commentary</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[220px]">
              Live text commentary will appear here as the match progresses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

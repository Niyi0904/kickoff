"use client"

import { motion } from "framer-motion"
import { Trophy, Zap } from "lucide-react"

export function FixtureLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sidebar/80 backdrop-blur-2xl">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[150px] animate-pulse" />

      <div className="relative flex flex-col items-center gap-8">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="p-1 rounded-full border-t-2 border-r-2 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
          >
             <div className="bg-background/80 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                <Trophy className="h-16 w-16 text-primary" />
             </div>
          </motion.div>
          <div className="absolute inset-0 rounded-full border border-primary/20 scale-[1.3] animate-ping" />
        </div>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
              Generating Fixtures
            </h2>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Organizing the Season
          </p>
        </div>

        <div className="w-48 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}
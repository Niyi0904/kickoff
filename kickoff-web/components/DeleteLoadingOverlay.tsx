"use client"

import { motion } from "framer-motion"
import { Trash2, AlertTriangle } from "lucide-react"

export function DeleteLoadingOverlay({ message = "Clearing Fixtures" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sidebar/80 backdrop-blur-2xl">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/15 rounded-full blur-[150px] animate-pulse" />

      <div className="relative flex flex-col items-center gap-8">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="p-1 rounded-full border-2 border-destructive/40 shadow-[0_0_30px_hsl(var(--destructive)/0.2)]"
          >
             <div className="bg-background/80 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
                <Trash2 className="h-16 w-16 text-destructive" />
             </div>
          </motion.div>
          <div className="absolute inset-0 rounded-full border border-destructive/20 scale-[1.3] animate-ping" />
        </div>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
              {message}
            </h2>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Updating Database
          </p>
        </div>

        <div className="w-48 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-destructive rounded-full"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  )
}
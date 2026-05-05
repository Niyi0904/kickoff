'use client';

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/Toaster";
import { AppDataProvider } from "./context/AppDataContext";
import Sidebar from "@/components/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { QueryProvider } from "./context/QueryProvider";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AppDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sidebar>
            {children}
            <SpeedInsights />
          </Sidebar>
        </TooltipProvider>
      </AppDataProvider>
    </QueryProvider>
  );
}

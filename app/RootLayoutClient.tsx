'use client';

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/Toaster";
import { AppDataProvider } from "./context/AppDataContext";
import Sidebar from "@/components/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { QueryProvider } from "./context/QueryProvider";
import { usePathname } from "next/navigation";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicLeaguePage = pathname?.startsWith("/public-league");

  if (isPublicLeaguePage) {
    return (
      <QueryProvider>
        <TooltipProvider>
          <Toaster />
          {children}
          <SpeedInsights />
        </TooltipProvider>
      </QueryProvider>
    );
  }

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

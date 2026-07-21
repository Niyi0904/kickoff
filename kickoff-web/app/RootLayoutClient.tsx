'use client';

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/Toaster";
import { AppDataProvider } from "./context/AppDataContext";
import Sidebar from "@/components/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { QueryProvider } from "./context/QueryProvider";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/public-league") ||
    pathname?.startsWith("/organizers") ||
    pathname?.startsWith("/auth");

  if (isPublicRoute) {
    return (
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <Toaster />
            {children}
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AppDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sidebar>
              {children}
              <SpeedInsights />
            </Sidebar>
          </TooltipProvider>
        </AppDataProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

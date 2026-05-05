'use client';

import { createContext, useContext, ReactNode } from "react";
import { useAppData } from "../hooks/useAppData";

// ─────────────────────────────────────────────
// Data context — all Firestore collections and mutations.
// Re-renders only when TanStack Query delivers fresh data.
// Auth state changes (token refresh, role changes) never
// trigger re-renders in components subscribed to this context.
// ─────────────────────────────────────────────

type DataContextType = ReturnType<typeof useAppData>;

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const data = useAppData();
    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    );
}

export function useDataContext() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useDataContext must be used within DataProvider");
    return ctx;
}
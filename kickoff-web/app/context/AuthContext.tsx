'use client';

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

// ─────────────────────────────────────────────
// Auth context — user session, admin status, sign in/out.
// Re-renders only when auth state changes (login, logout,
// token refresh, role change). Completely decoupled from
// Firestore data fetching.
// ─────────────────────────────────────────────

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
    return ctx;
}
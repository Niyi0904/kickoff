'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // useState ensures each session gets its own QueryClient instance
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data is considered fresh for 5 minutes before a background refetch
                        staleTime: 1000 * 60 * 5,
                        // Keep unused data in cache for 10 minutes
                        gcTime: 1000 * 60 * 10,
                        // Don't retry on error by default (Firestore errors are usually auth issues)
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
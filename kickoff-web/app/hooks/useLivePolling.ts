'use client';

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseLivePollingOptions {
  enabled: boolean;
  interval?: number;
}

export function useLivePolling({ enabled, interval = 15000 }: UseLivePollingOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['assists'] });
      queryClient.invalidateQueries({ queryKey: ['yellowCards'] });
      queryClient.invalidateQueries({ queryKey: ['redCards'] });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, queryClient]);
}

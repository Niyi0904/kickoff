'use client';

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./useAppData";

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matches });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.goals });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assists });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.yellowCards });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.redCards });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, queryClient]);
}

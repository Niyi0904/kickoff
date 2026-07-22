'use client';

import { use } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RequirePaidPlayer } from "@/components/RequirePaidPlayer";
import { LiveMatchView } from "@/components/live/LiveMatchView";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);

  return (
    <ProtectedRoute>
      <RequirePaidPlayer>
        <LiveMatchView matchId={matchId} />
      </RequirePaidPlayer>
    </ProtectedRoute>
  );
}

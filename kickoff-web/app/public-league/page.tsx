'use client';

import { useParams } from "next/navigation";
import { PublicLeagueExperience } from "@/components/PublicLeagueExperience";

export default function PublicLeaguePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? (params.slug as string) : undefined;

  return <PublicLeagueExperience leagueSlug={slug} />;
}

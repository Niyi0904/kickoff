import { PublicLeagueExperience } from "@/components/PublicLeagueExperience";

export default function PublicLeagueSlugPage({ params }: { params: { slug: string } }) {
  return <PublicLeagueExperience leagueSlug={params.slug} />;
}

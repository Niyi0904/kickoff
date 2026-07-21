import { PublicLeagueExperience } from "@/components/PublicLeagueExperience";

export default async function PublicLeagueSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicLeagueExperience leagueSlug={slug} />;
}

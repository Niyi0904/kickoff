import { Metadata } from "next";
import { PublicTeamDetail } from "./client";

type Props = { params: Promise<{ slug: string; teamId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, teamId } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/public/team/${teamId}?slug=${slug}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const team = await res.json();
      return {
        title: `${team.name} | Team Profile | KICKOFF`,
        description: `View ${team.name}'s squad, stats, form, and match results for the current season.`,
        openGraph: {
          title: `${team.name} | KICKOFF`,
          description: `${team.name} team profile - squad, matches, and performance.`,
        },
      };
    }
  } catch {}
  return {
    title: "Team Profile | KICKOFF",
    description: "View team squad, stats, and match results.",
  };
}

export default async function TeamDetailPage(props: Props) {
  const { slug, teamId } = await props.params;
  return <PublicTeamDetail slug={slug} teamId={teamId} />;
}

import { Metadata } from "next";
import { PublicTeamDetail } from "./client";

type Props = { params: { slug: string; teamId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/public/team/${params.teamId}?slug=${params.slug}`,
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

export default function TeamDetailPage(props: Props) {
  return <PublicTeamDetail slug={props.params.slug} teamId={props.params.teamId} />;
}

import { Metadata } from "next";
import { PublicPlayerDetail } from "./client";

type Props = { params: { slug: string; playerId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/public/player/${params.playerId}?slug=${params.slug}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const player = await res.json();
      const desc = `${player.name} — ${player.position ?? "Player"} for ${player.teamName ?? "a league club"}. Stats, goals, assists, and match history.`;
      return {
        title: `${player.name} | Player Profile | KICKOFF`,
        description: desc,
        openGraph: {
          title: `${player.name} | KICKOFF`,
          description: desc,
        },
      };
    }
  } catch {}
  return {
    title: "Player Profile | KICKOFF",
    description: "Player stats, goals, assists, and match history.",
  };
}

export default function PlayerDetailPage(props: Props) {
  return <PublicPlayerDetail slug={props.params.slug} playerId={props.params.playerId} />;
}

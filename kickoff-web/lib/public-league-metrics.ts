type MetricTeam = { id: string };
type MetricPlayer = { id: string };
type MetricMatch = { status?: string | null };
type MetricGoal = { id: string };

export function buildSeasonMetrics({
  teams,
  players,
  matches,
  goals,
}: {
  teams: MetricTeam[];
  players: MetricPlayer[];
  matches: MetricMatch[];
  goals: MetricGoal[];
}) {
  const played = matches.filter((match) => match.status === "played").length;
  const upcoming = matches.filter((match) => match.status !== "played").length;

  return [
    { label: "Teams", value: teams.length },
    { label: "Players", value: players.length },
    { label: "Played", value: played },
    { label: "Upcoming", value: upcoming },
    { label: "Goals", value: goals.length },
  ];
}

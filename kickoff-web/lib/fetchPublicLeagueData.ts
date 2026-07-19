import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Team, Player, Match, EventRecord, LeagueSettings, PublicLeagueData } from "./public-league-types";

const DEFAULT_SETTINGS: LeagueSettings = {
  seasonName: "Current Season",
  leagueVenue: "",
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
};

export async function fetchPublicLeagueData(leagueSlug?: string): Promise<PublicLeagueData> {
  let leagueId: string | null = null;

  if (leagueSlug) {
    const slugSnap = await getDocs(query(collection(db, "leagues"), where("slug", "==", leagueSlug)));
    if (!slugSnap.empty) {
      leagueId = slugSnap.docs[0].id;
    }
  }

  const baseConstraints = leagueId ? [where("leagueId", "==", leagueId)] : [];
  const matchConstraints = leagueId
    ? [where("leagueId", "==", leagueId), orderBy("matchDay", "desc")]
    : [orderBy("matchDay", "desc")];

  const settingsDocId = leagueId ?? "league";
  const settingsCollection = "settings";

  const [teamsSnap, playersSnap, matchesSnap, goalsSnap, assistsSnap, yellowsSnap, redsSnap, settingsSnap] =
    await Promise.all([
      getDocs(query(collection(db, "teams"), ...baseConstraints)),
      getDocs(query(collection(db, "players"), ...baseConstraints)),
      getDocs(query(collection(db, "matches"), ...matchConstraints)),
      getDocs(query(collection(db, "goals"), ...baseConstraints)),
      getDocs(query(collection(db, "assists"), ...baseConstraints)),
      getDocs(query(collection(db, "yellow_cards"), ...baseConstraints)),
      getDocs(query(collection(db, "red_cards"), ...baseConstraints)),
      getDoc(doc(db, settingsCollection, settingsDocId)),
    ]);

  const teams: Team[] = teamsSnap.docs.map((d) => {
    const team = d.data();
    return {
      id: d.id,
      name: team.name ?? "Unnamed Team",
      logo: team.logo ?? null,
      primaryColor: team.primary_color ?? team.primaryColor ?? "#22c55e",
      stadium: team.stadium ?? null,
      founded: team.founded ?? null,
    };
  });

  const players: Player[] = playersSnap.docs.map((d) => {
    const player = d.data();
    return {
      id: d.id,
      name: player.name ?? "Unnamed Player",
      teamId: player.team_id ?? player.teamId ?? "",
      photo: player.photo ?? null,
      number: player.number ?? null,
      position: player.position ?? null,
    };
  });

  const matches: Match[] = matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
  const goals: EventRecord[] = goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const assists: EventRecord[] = assistsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const yellowCards: EventRecord[] = yellowsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const redCards: EventRecord[] = redsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventRecord));
  const settings = settingsSnap.exists()
    ? ({ ...DEFAULT_SETTINGS, ...settingsSnap.data() } as LeagueSettings)
    : DEFAULT_SETTINGS;

  return { teams, players, matches, goals, assists, yellowCards, redCards, settings };
}

export async function resolveLeagueId(leagueSlug: string): Promise<string | null> {
  const slugSnap = await getDocs(query(collection(db, "leagues"), where("slug", "==", leagueSlug)));
  if (slugSnap.empty) return null;
  return slugSnap.docs[0].id;
}

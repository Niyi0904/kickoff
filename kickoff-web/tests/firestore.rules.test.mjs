import { readFileSync } from "fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  setDoc,
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const PROJECT_ID = "team-management-7d995";
const LEAGUE_A = "default";
const LEAGUE_B = "second-league";

let testEnv;

before(async function () {
  this.timeout(30000);
  const rules = readFileSync("firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules },
  });
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// ── Helpers ────────────────────────────────────────────────────────────────

async function seedUserRole(uid, role, leagueId, teamId = null) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection("user_roles").doc(uid).set({
      role,
      leagueId,
      teamId,
    });
  });
}

async function seedDocument(collectionPath, docId, data) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await db.collection(collectionPath).doc(docId).set(data);
  });
}

function authContext(uid) {
  return testEnv.authenticatedContext(uid, {});
}

function unauthed() {
  return testEnv.unauthenticatedContext();
}

// ── Scenario 1: Single League (League A = 'default') ──────────────────────

describe("Single-league — league_manager access", () => {
  let lm;

  beforeEach(async function () {
    this.timeout(30000);
    await seedUserRole("lm1", "league_manager", LEAGUE_A);
    await seedDocument("leagues", LEAGUE_A, { name: "Default League" });
    await seedDocument("teams", "teamA1", {
      name: "Team A1",
      leagueId: LEAGUE_A,
      approved: true,
    });
    await seedDocument("players", "playerA1", {
      name: "Alice",
      team_id: "teamA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("matches", "matchA1", {
      home: "Team A1",
      away: "Team A2",
      leagueId: LEAGUE_A,
      matchDay: 1,
    });
    await seedDocument("goals", "goalA1", {
      matchId: "matchA1",
      scorerId: "playerA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("assists", "assistA1", {
      matchId: "matchA1",
      playerId: "playerA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("yellow_cards", "ycA1", {
      matchId: "matchA1",
      playerId: "playerA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("red_cards", "rcA1", {
      matchId: "matchA1",
      playerId: "playerA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("match_attendance", "attA1", {
      matchId: "matchA1",
      playerId: "playerA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("suspensions", "suspA1", {
      playerId: "playerA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("link_requests", "linkA1", {
      userId: "user1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("user_invites", "invA1", {
      email: "test@test.com",
      leagueId: LEAGUE_A,
    });
    await seedDocument("settings", "league", {
      seasonName: "S1",
      leagueId: LEAGUE_A,
    });
    lm = authContext("lm1");
  });

  it("can read teams within their league", async () => {
    await assertSucceeds(getDoc(doc(lm.firestore(), "teams", "teamA1")));
  });

  it("can write teams within their league", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "teams", "teamA1-new"), {
        name: "New Team",
        leagueId: LEAGUE_A,
        approved: true,
      }),
    );
  });

  it("can update teams within their league", async () => {
    await assertSucceeds(
      setDoc(
        doc(lm.firestore(), "teams", "teamA1"),
        { name: "Updated", leagueId: LEAGUE_A, approved: true },
        { merge: true },
      ),
    );
  });

  it("can delete teams within their league", async () => {
    await assertSucceeds(deleteDoc(doc(lm.firestore(), "teams", "teamA1")));
  });

  it("can read players within their league", async () => {
    await assertSucceeds(getDoc(doc(lm.firestore(), "players", "playerA1")));
  });

  it("can write players within their league", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "players", "playerA1-new"), {
        name: "New Player",
        team_id: "teamA1",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can update players within their league", async () => {
    await assertSucceeds(
      setDoc(
        doc(lm.firestore(), "players", "playerA1"),
        { name: "Updated" },
        { merge: true },
      ),
    );
  });

  it("can delete players within their league", async () => {
    await assertSucceeds(deleteDoc(doc(lm.firestore(), "players", "playerA1")));
  });

  it("can write matches within their league", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "matches", "matchA1-new"), {
        home: "A",
        away: "B",
        leagueId: LEAGUE_A,
        matchDay: 1,
      }),
    );
  });

  it("can write match events within their league (goals, assists, cards, attendance)", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "goals", "g-new"), {
        matchId: "matchA1",
        leagueId: LEAGUE_A,
      }),
    );
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "assists", "a-new"), {
        matchId: "matchA1",
        leagueId: LEAGUE_A,
      }),
    );
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "yellow_cards", "yc-new"), {
        matchId: "matchA1",
        leagueId: LEAGUE_A,
      }),
    );
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "red_cards", "rc-new"), {
        matchId: "matchA1",
        leagueId: LEAGUE_A,
      }),
    );
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "match_attendance", "att-new"), {
        matchId: "matchA1",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can write suspensions within their league", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "suspensions", "susp-new"), {
        playerId: "playerA1",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can write settings within their league", async () => {
    await assertSucceeds(
      setDoc(
        doc(lm.firestore(), "settings", "league"),
        { seasonName: "S2", leagueId: LEAGUE_A },
        { merge: true },
      ),
    );
  });

  it("can write user_invites within their league", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "user_invites", "inv-new"), {
        email: "new@test.com",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can write user_roles (unscoped — all league_managers)", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "user_roles", "newuser"), {
        role: "player",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read user_roles (unscoped)", async () => {
    await assertSucceeds(getDoc(doc(lm.firestore(), "user_roles", "lm1")));
  });
});

describe("Single-league — team_manager access", () => {
  let tm;

  beforeEach(async function () {
    this.timeout(30000);
    await seedUserRole("tm1", "team_manager", LEAGUE_A, "teamA1");
    await seedDocument("teams", "teamA1", {
      name: "Team A1",
      leagueId: LEAGUE_A,
      approved: true,
    });
    await seedDocument("teams", "teamA2", {
      name: "Team A2",
      leagueId: LEAGUE_A,
      approved: true,
    });
    await seedDocument("players", "playerA1", {
      name: "Player A1",
      team_id: "teamA1",
      teamId: "teamA1",
      leagueId: LEAGUE_A,
    });
    tm = authContext("tm1");
  });

  it("can read teams (public)", async () => {
    await assertSucceeds(getDoc(doc(tm.firestore(), "teams", "teamA1")));
  });

  it("can create their own team", async () => {
    await assertSucceeds(
      setDoc(doc(tm.firestore(), "teams", "teamA1-new"), {
        name: "My Team",
        leagueId: LEAGUE_A,
        approved: false,
      }),
    );
  });

  it("can update their own team", async () => {
    await assertSucceeds(
      setDoc(
        doc(tm.firestore(), "teams", "teamA1"),
        { name: "Updated Name", leagueId: LEAGUE_A, approved: false },
        { merge: true },
      ),
    );
  });

  it("CANNOT change approved field on their team", async () => {
    await assertFails(
      setDoc(
        doc(tm.firestore(), "teams", "teamA1"),
        { approved: true, leagueId: LEAGUE_A },
        { merge: true },
      ),
    );
  });

  it("CANNOT update another team", async () => {
    await assertFails(
      setDoc(
        doc(tm.firestore(), "teams", "teamA2"),
        { name: "Hacked", leagueId: LEAGUE_A },
        { merge: true },
      ),
    );
  });

  it("CANNOT delete any team", async () => {
    await assertFails(deleteDoc(doc(tm.firestore(), "teams", "teamA1")));
  });

  it("can create players for their own team", async () => {
    await assertSucceeds(
      setDoc(doc(tm.firestore(), "players", "p-new"), {
        name: "New Player",
        team_id: "teamA1",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("CANNOT create players for another team", async () => {
    await assertFails(
      setDoc(doc(tm.firestore(), "players", "p-hack"), {
        name: "Hacker",
        team_id: "teamA2",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can update players on their own team", async () => {
    await assertSucceeds(
      setDoc(
        doc(tm.firestore(), "players", "playerA1"),
        { name: "Updated Name" },
        { merge: true },
      ),
    );
  });

  it("CANNOT update players on another team", async () => {
    await seedDocument("players", "playerA2", {
      name: "Player A2",
      team_id: "teamA2",
      teamId: "teamA2",
      leagueId: LEAGUE_A,
    });
    await assertFails(
      setDoc(
        doc(tm.firestore(), "players", "playerA2"),
        { name: "Hacked" },
        { merge: true },
      ),
    );
  });

  it("CANNOT write matches", async () => {
    await assertFails(
      setDoc(doc(tm.firestore(), "matches", "m-new"), {
        home: "A",
        away: "B",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("CANNOT write match events", async () => {
    await assertFails(
      setDoc(doc(tm.firestore(), "goals", "g-new"), {
        matchId: "x",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("CANNOT write suspensions", async () => {
    await assertFails(
      setDoc(doc(tm.firestore(), "suspensions", "s-new"), {
        playerId: "x",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("CANNOT write settings", async () => {
    await assertFails(
      setDoc(doc(tm.firestore(), "settings", "league"), {
        seasonName: "Hacked",
        leagueId: LEAGUE_A,
      }),
    );
  });
});

describe("Single-league — player access", () => {
  let pl;

  beforeEach(async function () {
    this.timeout(30000);
    await seedUserRole("pl1", "player", LEAGUE_A);
    await seedDocument("teams", "teamA1", {
      name: "Team A1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("matches", "matchA1", {
      home: "A",
      away: "B",
      leagueId: LEAGUE_A,
    });
    pl = authContext("pl1");
  });

  it("can read teams (public)", async () => {
    await assertSucceeds(getDoc(doc(pl.firestore(), "teams", "teamA1")));
  });

  it("CANNOT write teams", async () => {
    await assertFails(
      setDoc(doc(pl.firestore(), "teams", "t-new"), {
        name: "X",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read players (public)", async () => {
    await seedDocument("players", "pa", {
      name: "P",
      team_id: "teamA1",
      leagueId: LEAGUE_A,
    });
    await assertSucceeds(getDoc(doc(pl.firestore(), "players", "pa")));
  });

  it("CANNOT write players", async () => {
    await assertFails(
      setDoc(doc(pl.firestore(), "players", "p-new"), {
        name: "Hack",
        team_id: "teamA1",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read matches (public)", async () => {
    await assertSucceeds(getDoc(doc(pl.firestore(), "matches", "matchA1")));
  });

  it("CANNOT write matches", async () => {
    await assertFails(
      setDoc(doc(pl.firestore(), "matches", "m-new"), {
        home: "A",
        away: "B",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("CANNOT write match events", async () => {
    await assertFails(
      setDoc(doc(pl.firestore(), "goals", "g-new"), {
        matchId: "x",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read settings (public)", async () => {
    await seedDocument("settings", "league", {
      seasonName: "S1",
      leagueId: LEAGUE_A,
    });
    await assertSucceeds(getDoc(doc(pl.firestore(), "settings", "league")));
  });

  it("CANNOT write settings", async () => {
    await assertFails(
      setDoc(doc(pl.firestore(), "settings", "league"), {
        seasonName: "Hacked",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read their own user_roles", async () => {
    await assertSucceeds(getDoc(doc(pl.firestore(), "user_roles", "pl1")));
  });
});

describe("Single-league — unauthenticated access", () => {
  let ua;

  beforeEach(async function () {
    this.timeout(30000);
    await seedDocument("teams", "teamA1", {
      name: "Team A1",
      leagueId: LEAGUE_A,
      approved: true,
    });
    await seedDocument("players", "playerA1", {
      name: "P1",
      team_id: "teamA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("matches", "matchA1", {
      home: "A",
      away: "B",
      leagueId: LEAGUE_A,
    });
    ua = unauthed();
  });

  it("can read teams (public default)", async () => {
    await assertSucceeds(getDoc(doc(ua.firestore(), "teams", "teamA1")));
  });

  it("CANNOT write teams", async () => {
    await assertFails(
      setDoc(doc(ua.firestore(), "teams", "t-new"), {
        name: "X",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read players (public default)", async () => {
    await assertSucceeds(getDoc(doc(ua.firestore(), "players", "playerA1")));
  });

  it("CANNOT write players", async () => {
    await assertFails(
      setDoc(doc(ua.firestore(), "players", "p-new"), {
        name: "X",
        team_id: "teamA1",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("can read matches (public default)", async () => {
    await assertSucceeds(getDoc(doc(ua.firestore(), "matches", "matchA1")));
  });

  it("CANNOT read user_roles", async () => {
    await assertFails(getDoc(doc(ua.firestore(), "user_roles", "anyone")));
  });

  it("CANNOT do any write", async () => {
    await assertFails(
      setDoc(doc(ua.firestore(), "settings", "league"), {
        seasonName: "X",
        leagueId: LEAGUE_A,
      }),
    );
    await assertFails(
      setDoc(doc(ua.firestore(), "matches", "m-new"), {
        home: "A",
        away: "B",
        leagueId: LEAGUE_A,
      }),
    );
  });
});

// ── Scenario 2: Two-league isolation ───────────────────────────────────────

describe("Two-league isolation", () => {
  let lmB, tmB;

  beforeEach(async function () {
    this.timeout(30000);
    // Seed user_roles for League B users
    await seedUserRole("lmB", "league_manager", LEAGUE_B);
    await seedUserRole("tmB", "team_manager", LEAGUE_B, "teamB1");

    // Seed League A data
    await seedDocument("leagues", LEAGUE_A, { name: "League A" });
    await seedDocument("teams", "teamA1", {
      name: "Team A1",
      leagueId: LEAGUE_A,
      approved: true,
    });
    await seedDocument("players", "playerA1", {
      name: "Alice",
      team_id: "teamA1",
      teamId: "teamA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("matches", "matchA1", {
      home: "A1",
      away: "A2",
      leagueId: LEAGUE_A,
      matchDay: 1,
    });
    await seedDocument("goals", "goalA1", {
      matchId: "matchA1",
      leagueId: LEAGUE_A,
    });
    await seedDocument("settings", "league", {
      seasonName: "League A Settings",
      leagueId: LEAGUE_A,
    });
    await seedDocument("suspensions", "suspA1", {
      playerId: "playerA1",
      leagueId: LEAGUE_A,
    });

    // Seed League B data
    await seedDocument("leagues", LEAGUE_B, { name: "League B" });
    await seedDocument("teams", "teamB1", {
      name: "Team B1",
      leagueId: LEAGUE_B,
      approved: true,
    });
    await seedDocument("players", "playerB1", {
      name: "Bob",
      team_id: "teamB1",
      teamId: "teamB1",
      leagueId: LEAGUE_B,
    });
    await seedDocument("matches", "matchB1", {
      home: "B1",
      away: "B2",
      leagueId: LEAGUE_B,
      matchDay: 1,
    });
    await seedDocument("goals", "goalB1", {
      matchId: "matchB1",
      leagueId: LEAGUE_B,
    });

    lmB = authContext("lmB");
    tmB = authContext("tmB");
  });

  describe("League B league_manager CANNOT write League A data", () => {
    it("CANNOT write League A teams", async () => {
      await assertFails(
        setDoc(
          doc(lmB.firestore(), "teams", "teamA1"),
          { name: "Hacked", leagueId: LEAGUE_A },
          { merge: true },
        ),
      );
    });

    it("CANNOT delete League A teams", async () => {
      await assertFails(deleteDoc(doc(lmB.firestore(), "teams", "teamA1")));
    });

    it("CANNOT write League A players", async () => {
      await assertFails(
        setDoc(
          doc(lmB.firestore(), "players", "playerA1"),
          { name: "Hacked" },
          { merge: true },
        ),
      );
    });

    it("CANNOT delete League A players", async () => {
      await assertFails(deleteDoc(doc(lmB.firestore(), "players", "playerA1")));
    });

    it("CANNOT write League A matches", async () => {
      await assertFails(deleteDoc(doc(lmB.firestore(), "matches", "matchA1")));
    });

    it("CANNOT write League A goals", async () => {
      await assertFails(deleteDoc(doc(lmB.firestore(), "goals", "goalA1")));
    });

    it("CANNOT write League A settings", async () => {
      await assertFails(
        setDoc(doc(lmB.firestore(), "settings", "league"), {
          seasonName: "Hacked",
          leagueId: LEAGUE_A,
        }),
      );
    });

    it("CANNOT write League A suspensions", async () => {
      await assertFails(
        deleteDoc(doc(lmB.firestore(), "suspensions", "suspA1")),
      );
    });

    it("CANNOT create a League A team", async () => {
      await assertFails(
        setDoc(doc(lmB.firestore(), "teams", "fake-team"), {
          name: "Fake",
          leagueId: LEAGUE_A,
          approved: true,
        }),
      );
    });

    it("CANNOT write League A leagues document", async () => {
      await assertFails(
        setDoc(doc(lmB.firestore(), "leagues", LEAGUE_A), { name: "Hacked" }),
      );
    });
  });

  describe("League B league_manager CAN read League A data (public reads)", () => {
    it("can read League A teams", async () => {
      await assertSucceeds(getDoc(doc(lmB.firestore(), "teams", "teamA1")));
    });

    it("can read League A players", async () => {
      await assertSucceeds(getDoc(doc(lmB.firestore(), "players", "playerA1")));
    });

    it("can read League A matches", async () => {
      await assertSucceeds(getDoc(doc(lmB.firestore(), "matches", "matchA1")));
    });
  });

  describe("League B team_manager CANNOT access League A data", () => {
    it("CANNOT write League A teams (their own or others)", async () => {
      await assertFails(
        setDoc(
          doc(tmB.firestore(), "teams", "teamA1"),
          { name: "Hacked", leagueId: LEAGUE_A },
          { merge: true },
        ),
      );
    });

    it("CANNOT create League A players", async () => {
      await assertFails(
        setDoc(doc(tmB.firestore(), "players", "p-hack"), {
          name: "Hacker",
          team_id: "teamA1",
          leagueId: LEAGUE_A,
        }),
      );
    });

    it("CANNOT update League A players", async () => {
      await assertFails(
        setDoc(
          doc(tmB.firestore(), "players", "playerA1"),
          { name: "Hacked" },
          { merge: true },
        ),
      );
    });
  });

  describe("League A league_manager CAN write their own data but NOT League B", () => {
    let lmA;

    beforeEach(async function () {
      this.timeout(30000);
      await seedUserRole("lmA", "league_manager", LEAGUE_A);
      lmA = authContext("lmA");
    });

    it("can write League A teams", async () => {
      await assertSucceeds(
        setDoc(
          doc(lmA.firestore(), "teams", "teamA1"),
          { name: "Updated By A", leagueId: LEAGUE_A, approved: true },
          { merge: true },
        ),
      );
    });

    it("CANNOT write League B teams", async () => {
      await assertFails(
        setDoc(
          doc(lmA.firestore(), "teams", "teamB1"),
          { name: "Hacked By A", leagueId: LEAGUE_B },
          { merge: true },
        ),
      );
    });

    it("CANNOT write League B players", async () => {
      await assertFails(
        setDoc(
          doc(lmA.firestore(), "players", "playerB1"),
          { name: "Hacked" },
          { merge: true },
        ),
      );
    });

    it("CANNOT write League B matches", async () => {
      await assertFails(deleteDoc(doc(lmA.firestore(), "matches", "matchB1")));
    });
  });
});

// ── Scenario 3: user_roles / users ────────────────────────────────────────

describe("user_roles collection — unchanged behavior", () => {
  let lm, pl;

  beforeEach(async function () {
    this.timeout(30000);
    await seedUserRole("lm_u", "league_manager", LEAGUE_A);
    await seedUserRole("pl_u", "player", LEAGUE_A);
    await seedDocument("user_roles", "other", {
      role: "team_manager",
      leagueId: LEAGUE_A,
    });
    lm = authContext("lm_u");
    pl = authContext("pl_u");
  });

  it("league_manager can read any user_role", async () => {
    await assertSucceeds(getDoc(doc(lm.firestore(), "user_roles", "other")));
  });

  it("league_manager can write any user_role", async () => {
    await assertSucceeds(
      setDoc(doc(lm.firestore(), "user_roles", "pl_u"), {
        role: "edited",
        leagueId: LEAGUE_A,
      }),
    );
  });

  it("player can read their own user_role", async () => {
    await assertSucceeds(getDoc(doc(pl.firestore(), "user_roles", "pl_u")));
  });

  it("player CANNOT read another user's role", async () => {
    await assertFails(getDoc(doc(pl.firestore(), "user_roles", "other")));
  });

  it("player CANNOT write any user_role", async () => {
    await assertFails(
      setDoc(doc(pl.firestore(), "user_roles", "pl_u"), {
        role: "league_manager",
        leagueId: LEAGUE_A,
      }),
    );
  });
});
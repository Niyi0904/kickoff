// scripts/fixWrongLeagueId.ts
// Corrects documents that were mistakenly backfilled with leagueId = 'default'
// to the actual correct leagueId. Verifies the count matches expectations
// before writing anything, as a safety check.

import { config } from 'dotenv';
config();

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

const WRONG_LEAGUE_ID = 'default';
const CORRECT_LEAGUE_ID = 'MWFePlubN1q0O5WH0Ih3';

// Expected counts from the previous run's BACKFILLED output — used as a
// safety check, not a filter. If actual counts don't match these, the
// script stops and prints a warning instead of writing anything, since
// that would mean something else also has leagueId = 'default' for a
// different, legitimate reason, and blindly overwriting it would be wrong.
const EXPECTED_COUNTS: Record<string, number> = {
  teams: 1,
  players: 96,
  matches: 51,
  goals: 60,
  assists: 50,
  yellow_cards: 26,
  red_cards: 11,
  match_attendance: 0,
  suspensions: 1,
  match_records: 0,
  link_requests: 0,
  user_invites: 0,
};

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '')
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n'),
};

const app = initializeApp({ credential: cert(serviceAccount) });
const db: Firestore = getFirestore(app);

async function fixCollection(collectionName: string): Promise<{ found: number; fixed: number }> {
  const snap = await db
    .collection(collectionName)
    .where('leagueId', '==', WRONG_LEAGUE_ID)
    .get();

  const found = snap.docs.length;
  const expected = EXPECTED_COUNTS[collectionName] ?? 0;

  if (found !== expected) {
    console.log(
      `⚠️  SKIPPING ${collectionName}: found ${found} docs with leagueId='default', ` +
      `expected ${expected}. Not touching this collection — investigate before re-running.`,
    );
    return { found, fixed: 0 };
  }

  if (found === 0) {
    console.log(`${collectionName}: 0 docs to fix, skipping.`);
    return { found: 0, fixed: 0 };
  }

  const chunkSize = 400;
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = db.batch();
    docs.slice(i, i + chunkSize).forEach((docSnap) => {
      batch.update(docSnap.ref, { leagueId: CORRECT_LEAGUE_ID });
    });
    await batch.commit();
  }

  console.log(`✓ FIXED ${collectionName}: ${found} docs → leagueId='${CORRECT_LEAGUE_ID}'`);
  return { found, fixed: found };
}

(async () => {
  console.log('=== Correcting wrong leagueId ===');
  console.log(`From: '${WRONG_LEAGUE_ID}'  To: '${CORRECT_LEAGUE_ID}'\n`);

  const collections = Object.keys(EXPECTED_COUNTS);
  let totalFixed = 0;

  for (const col of collections) {
    const result = await fixCollection(col);
    totalFixed += result.fixed;
  }

  // Also fix the settings/league singleton, which the original script
  // wrote 'default' into via ensureLeagueId().
  const settingsRef = db.collection('settings').doc('league');
  const settingsSnap = await settingsRef.get();
  const settingsLeagueId = settingsSnap.data()?.leagueId;
  if (settingsLeagueId === WRONG_LEAGUE_ID) {
    await settingsRef.set({ leagueId: CORRECT_LEAGUE_ID }, { merge: true });
    console.log(`✓ FIXED settings/league: leagueId → '${CORRECT_LEAGUE_ID}'`);
  } else {
    console.log(`settings/league already has leagueId='${settingsLeagueId}', left untouched.`);
  }

  console.log(`\nTotal documents corrected: ${totalFixed}`);
  process.exit(0);
})();
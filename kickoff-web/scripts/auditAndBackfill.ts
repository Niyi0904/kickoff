// scripts/auditAndBackfill.ts
// Audits leagueId coverage and backfills missing values using Firebase Admin SDK.
// Uses service-account credentials from .env (no API key / Auth initialization needed).
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

const LEAGUE_COLLECTIONS = [
  'teams',
  'players',
  'matches',
  'goals',
  'assists',
  'yellow_cards',
  'red_cards',
  'match_attendance',
  'suspensions',
  'match_records',
  'link_requests',
  'user_invites',
] as const;

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
};

const app = initializeApp({ credential: cert(serviceAccount) });
const db: Firestore = getFirestore(app);

async function ensureLeagueId(): Promise<string> {
  const settingsRef = db.collection('settings').doc('league');
  const settingsSnap = await settingsRef.get();
  const data = settingsSnap.data() as any | undefined;
  const existingLeagueId = settingsSnap.exists ? data?.leagueId : null;
  if (existingLeagueId) return existingLeagueId as string;
  const defaultLeagueId = 'default';
  await settingsRef.set({ leagueId: defaultLeagueId }, { merge: true });
  return defaultLeagueId;
}

async function countMissingLeagueId(collectionName: string): Promise<number> {
  const snap = await db.collection(collectionName).get();
  return snap.docs.filter((d) => !('leagueId' in d.data()) || (d.data() as any).leagueId == null).length;
}

async function backfillCollection(collectionName: string, leagueId: string): Promise<number> {
  const snap = await db.collection(collectionName).get();
  const docs = snap.docs.filter((docSnap) => !('leagueId' in docSnap.data()) || (docSnap.data() as any).leagueId == null);
  const chunkSize = 400;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = db.batch();
    docs.slice(i, i + chunkSize).forEach((docSnap) => {
      batch.set(docSnap.ref, { leagueId }, { merge: true });
    });
    await batch.commit();
  }
  return docs.length;
}

(async () => {
  console.log('=== leagueId Audit ===');
  const leagueId = await ensureLeagueId();
  console.log('Using leagueId:', leagueId);

  const before: Record<string, number> = {};
  for (const col of LEAGUE_COLLECTIONS) {
    const count = await countMissingLeagueId(col);
    before[col] = count;
    console.log(`BEFORE ${col}: ${count} missing`);
  }

  console.log('\n=== Backfilling ===');
  const totalBackfilled: Record<string, number> = {};
  for (const col of LEAGUE_COLLECTIONS) {
    const count = await backfillCollection(col, leagueId);
    totalBackfilled[col] = count;
    console.log(`BACKFILLED ${col}: ${count} docs`);
  }

  console.log('\n=== After Audit ===');
  let totalAfter = 0;
  for (const col of LEAGUE_COLLECTIONS) {
    const count = await countMissingLeagueId(col);
    totalAfter += count;
    console.log(`AFTER ${col}: ${count} missing`);
  }
  console.log(`\nTotal missing leagueId across all collections: ${totalAfter}`);

  process.exit(0);
})();
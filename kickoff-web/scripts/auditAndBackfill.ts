// scripts/auditAndBackfill.ts
// Audits leagueId coverage and backfills missing values.
// Uses Firestore directly to avoid importing the app's firebase.ts (which initializes Auth).
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { writeBatch, doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function ensureLeagueId(): Promise<string> {
  const settingsRef = doc(db, 'settings', 'league');
  const settingsSnap = await getDoc(settingsRef);
  const existingLeagueId = settingsSnap.exists() ? (settingsSnap.data() as any)?.leagueId : null;
  if (existingLeagueId) return existingLeagueId as string;
  const defaultLeagueId = 'default';
  await setDoc(settingsRef, { leagueId: defaultLeagueId }, { merge: true });
  return defaultLeagueId;
}

async function countMissingLeagueId(collectionName: string): Promise<number> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.filter((d) => !('leagueId' in d.data()) || (d.data() as any).leagueId == null).length;
}

async function backfillCollection(collectionName: string, leagueId: string): Promise<number> {
  const snap = await getDocs(collection(db, collectionName));
  const docs = snap.docs.filter((docSnap) => !('leagueId' in docSnap.data()) || (docSnap.data() as any).leagueId == null);
  const chunkSize = 400;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
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
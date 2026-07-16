// scripts/backfillUserRolesLeagueId.ts
// Audits user_roles for missing leagueId and backfills to the correct,
// explicit league ID — no fallback/default inference, to avoid repeating
// the earlier 'default' mistake.
console.log('SCRIPT STARTED');
import { config } from 'dotenv';
config();

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';

const CORRECT_LEAGUE_ID = 'MWFePlubN1q0O5WH0Ih3';

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '')
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n'),
};

const app = initializeApp({ credential: cert(serviceAccount) });
const db: Firestore = getFirestore(app);

(async () => {
  console.log('=== Auditing user_roles for missing leagueId ===\n');

  const snap = await db.collection('user_roles').get();

  const missing = snap.docs.filter((d) => {
    const data = d.data();
    return !('leagueId' in data) || data.leagueId == null;
  });

  if (missing.length === 0) {
    console.log('No user_roles documents are missing leagueId. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${missing.length} user_roles documents missing leagueId:\n`);
  missing.forEach((d) => {
    const data = d.data();
    console.log(`  uid: ${d.id}  role: ${data.role ?? '(none)'}  teamId: ${data.teamId ?? '(none)'}`);
  });

  const shouldApply = process.argv.includes('--apply');

  if (!shouldApply) {
    console.log(
      `\nDRY RUN — no changes written. ${missing.length} documents would be set to ` +
      `leagueId='${CORRECT_LEAGUE_ID}'.`,
    );
    console.log('Review the uid/role list above carefully — confirm none of these belong');
    console.log('to the test league from Step 6, not just the live one.');
    console.log('\nRe-run with --apply once you\'ve confirmed the list is correct:');
    console.log('  npx tsx scripts/backfillUserRolesLeagueId.ts --apply');
    process.exit(0);
  }

  console.log(`\nApplying: setting leagueId = '${CORRECT_LEAGUE_ID}' on ${missing.length} documents...\n`);

  const batch = db.batch();
  missing.forEach((d) => {
    batch.update(d.ref, { leagueId: CORRECT_LEAGUE_ID });
  });
  await batch.commit();

  console.log(`✓ Backfilled ${missing.length} user_roles documents → leagueId='${CORRECT_LEAGUE_ID}'`);

  // Verify
  const verifySnap = await db.collection('user_roles').get();
  const stillMissing = verifySnap.docs.filter((d) => {
    const data = d.data();
    return !('leagueId' in data) || data.leagueId == null;
  }).length;

  console.log(`\nVerification: ${stillMissing} user_roles documents still missing leagueId.`);

  process.exit(0);
})();
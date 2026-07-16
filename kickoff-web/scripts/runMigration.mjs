/**
 * Migration script using Firebase Admin SDK
 * Run: node scripts/runMigration.mjs
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Admin SDK
let app;
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    readFileSync(resolve(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
  );
  app = initializeApp({ credential: cert(serviceAccount) });
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

async function migrate() {
  console.log('=== Starting Collection Migration (Admin SDK) ===\n');

  // 1. Get all leagues documents
  const leaguesSnap = await db.collection('leagues').get();
  console.log(`Found ${leaguesSnap.docs.length} league(s)\n`);

  // 2. Get the old settings/league singleton
  const oldSettingsSnap = await db.collection('settings').doc('league').get();
  const oldSettings = oldSettingsSnap.exists ? oldSettingsSnap.data() : null;
  if (oldSettings) {
    console.log('Found old settings/league singleton with fields:', Object.keys(oldSettings).join(', '));
    console.log(`  → points to leagueId: ${oldSettings.leagueId}\n`);
  }

  for (const leagueDoc of leaguesSnap.docs) {
    const leagueId = leagueDoc.id;
    const leagueData = leagueDoc.data();

    console.log(`--- Processing League: ${leagueData.leagueName ?? leagueData.name ?? 'Unknown'} (${leagueId}) ---`);

    // ── Settings Migration ──
    const nestedSettings = leagueData.settings ?? {};
    const singletonSettings = (oldSettings && oldSettings.leagueId === leagueId) ? oldSettings : null;

    // Map: nested.pointsForWin → pointsWin, singleton fields → direct
    const settingsPayload = {
      seasonName: singletonSettings?.seasonName ?? nestedSettings.seasonName ?? leagueData.seasonName ?? 'Current Season',
      pointsWin: singletonSettings?.pointsWin ?? nestedSettings.pointsForWin ?? nestedSettings.pointsWin ?? 3,
      pointsDraw: singletonSettings?.pointsDraw ?? nestedSettings.pointsDraw ?? 1,
      pointsLoss: singletonSettings?.pointsLoss ?? nestedSettings.pointsLoss ?? 0,
      matchDay: singletonSettings?.matchDay ?? nestedSettings.matchDay ?? leagueData.matchDay ?? 'Tuesday',
      defaultTime: singletonSettings?.defaultTime ?? nestedSettings.defaultTime ?? leagueData.defaultTime ?? '10:00',
      inviteDeadline: singletonSettings?.inviteDeadline ?? nestedSettings.inviteDeadline ?? leagueData.inviteDeadline ?? '2099-12-31T23:59:59',
      leagueVenue: singletonSettings?.leagueVenue ?? nestedSettings.leagueVenue ?? leagueData.leagueVenue ?? '',
      yellowsPerBan: singletonSettings?.yellowsPerBan ?? nestedSettings.yellowsPerBan ?? leagueData.yellowsPerBan ?? 3,
    };

    // Check for conflicts
    if (singletonSettings && nestedSettings.pointsForWin !== undefined) {
      if (singletonSettings.pointsWin !== nestedSettings.pointsForWin) {
        console.log(`  ⚠ CONFLICT: singleton says pointsWin=${singletonSettings.pointsWin}, nested says pointsForWin=${nestedSettings.pointsForWin}. Using singleton value.`);
      }
    }

    // Write to settings/{leagueId}
    await db.collection('settings').doc(leagueId).set(settingsPayload, { merge: true });
    console.log(`  ✓ Written settings/${leagueId}`);

    // ── Subscription Migration ──
    const nestedSub = leagueData.subscription ?? {};
    const subPayload = {
      plan: nestedSub.plan ?? 'free',
      status: nestedSub.active === true ? 'active' : (nestedSub.status ?? 'trial'),
      currentPeriodEnd: nestedSub.currentPeriodEnd ?? null,
    };
    await db.collection('subscriptions').doc(leagueId).set(subPayload, { merge: true });
    console.log(`  ✓ Written subscriptions/${leagueId}`);

    // ── Remove nested fields from leagues/{leagueId} ──
    const fieldsToRemove = {};
    if ('settings' in leagueData) fieldsToRemove.settings = FieldValue.delete();
    if ('subscription' in leagueData) fieldsToRemove.subscription = FieldValue.delete();

    // Remove flat setting fields that were duplicated into leagues
    const flatSettingFields = ['seasonName', 'inviteDeadline', 'leagueVenue', 'matchDay', 'defaultTime', 'pointsWin', 'pointsDraw', 'pointsLoss', 'yellowsPerBan'];
    const keepFields = ['id', 'slug', 'name', 'leagueName', 'ownerId', 'adminIds', 'logoUrl', 'theme', 'createdAt'];
    for (const field of flatSettingFields) {
      if (field in leagueData && !keepFields.includes(field)) {
        fieldsToRemove[field] = FieldValue.delete();
      }
    }

    if (Object.keys(fieldsToRemove).length > 0) {
      await db.collection('leagues').doc(leagueId).update(fieldsToRemove);
      console.log(`  ✓ Removed nested fields from leagues/${leagueId}: ${Object.keys(fieldsToRemove).join(', ')}`);
    } else {
      console.log(`  - No nested fields to remove from leagues/${leagueId}`);
    }

    console.log('');
  }

  // ── Retire settings/league ──
  console.log('--- Retiring settings/league singleton ---');
  if (oldSettingsSnap.exists) {
    await db.collection('settings').doc('league').set({
      _migrated: true,
      _migratedAt: new Date().toISOString(),
      _note: 'Retired. See settings/{leagueId} for per-league settings.',
    }, { merge: true });
    console.log('  ✓ Marked settings/league as migrated (tombstone)');
  } else {
    console.log('  - settings/league does not exist, nothing to retire.');
  }

  console.log('\n=== Migration Complete ===');
}

migrate().catch(console.error);
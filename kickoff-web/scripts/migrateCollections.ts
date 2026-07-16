import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, deleteField } from 'firebase/firestore';

/**
 * Migration script: Extract nested settings/subscription from leagues/{leagueId}
 * into top-level settings/{leagueId} and subscriptions/{leagueId}.
 * Also migrates the old settings/league singleton into a per-league document.
 *
 * Run: npx ts-node scripts/migrateCollections.ts
 * Or via Firebase shell: node scripts/migrateCollections.cjs
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

interface MigrationReport {
  leagueId: string;
  leagueName: string;
  settingsMigrated: boolean;
  subscriptionMigrated: boolean;
  nestedFieldsRemoved: boolean;
  notes: string[];
}

async function migrate() {
  console.log('=== Starting Collection Migration ===\n');
  const reports: MigrationReport[] = [];

  // 1. Get all leagues documents
  const leaguesSnap = await getDocs(collection(db, 'leagues'));
  console.log(`Found ${leaguesSnap.docs.length} league(s)\n`);

  // 2. Get the old settings/league singleton
  const oldSettingsSnap = await getDoc(doc(db, 'settings', 'league'));
  const oldSettings = oldSettingsSnap.exists() ? oldSettingsSnap.data() : null;
  if (oldSettings) {
    console.log('Found old settings/league singleton with fields:', Object.keys(oldSettings).join(', '));
    console.log(`  → points to leagueId: ${oldSettings.leagueId}\n`);
  }

  for (const leagueDoc of leaguesSnap.docs) {
    const leagueId = leagueDoc.id;
    const leagueData = leagueDoc.data();
    const report: MigrationReport = {
      leagueId,
      leagueName: leagueData.leagueName ?? leagueData.name ?? 'Unknown',
      settingsMigrated: false,
      subscriptionMigrated: false,
      nestedFieldsRemoved: false,
      notes: [],
    };

    console.log(`--- Processing League: ${report.leagueName} (${leagueId}) ---`);

    // ── Settings Migration ──
    // Source 1: nested leagues/{leagueId}.settings
    const nestedSettings = leagueData.settings ?? {};
    // Source 2: old settings/league singleton (if it points to this league)
    const singletonSettings = (oldSettings && oldSettings.leagueId === leagueId) ? oldSettings : null;

    // Merge: singleton wins for any field it has, nested fills gaps
    // Map field names:
    //   nested.pointsForWin  → pointsWin
    //   singleton.pointsWin  → pointsWin (already correct)
    //   singleton.pointsDraw, pointsLoss, etc. → direct
    const settingsPayload: Record<string, any> = {
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

    // Check for conflicts between the two sources
    if (singletonSettings && nestedSettings.pointsForWin !== undefined) {
      if (singletonSettings.pointsWin !== nestedSettings.pointsForWin) {
        report.notes.push(`CONFLICT: singleton says pointsWin=${singletonSettings.pointsWin}, nested says pointsForWin=${nestedSettings.pointsForWin}. Using singleton value.`);
      }
    }

    // Write to settings/{leagueId}
    await setDoc(doc(db, 'settings', leagueId), settingsPayload, { merge: true });
    report.settingsMigrated = true;
    console.log(`  ✓ Written settings/${leagueId} with:`, JSON.stringify(settingsPayload));

    // ── Subscription Migration ──
    const nestedSub = leagueData.subscription ?? {};
    const subPayload: Record<string, any> = {
      plan: nestedSub.plan ?? 'free',
      status: nestedSub.active === true ? 'active' : (nestedSub.status ?? 'trial'),
      currentPeriodEnd: nestedSub.currentPeriodEnd ?? null,
    };
    await setDoc(doc(db, 'subscriptions', leagueId), subPayload, { merge: true });
    report.subscriptionMigrated = true;
    console.log(`  ✓ Written subscriptions/${leagueId} with:`, JSON.stringify(subPayload));

    // ── Remove nested fields from leagues/{leagueId} ──
    const fieldsToRemove: Record<string, any> = {};
    // Remove nested objects
    if ('settings' in leagueData) fieldsToRemove['settings'] = deleteFieldPlaceholder;
    if ('subscription' in leagueData) fieldsToRemove['subscription'] = deleteFieldPlaceholder;
    // Also remove flat setting fields that were duplicated into leagues (if they exist)
    const flatSettingFields = ['seasonName', 'inviteDeadline', 'leagueVenue', 'matchDay', 'defaultTime', 'pointsWin', 'pointsDraw', 'pointsLoss', 'yellowsPerBan'];
    for (const field of flatSettingFields) {
      if (field in leagueData && !['id', 'slug', 'name', 'leagueName', 'ownerId', 'adminIds', 'logoUrl', 'theme', 'createdAt'].includes(field)) {
        fieldsToRemove[field] = deleteFieldPlaceholder;
      }
    }

    if (Object.keys(fieldsToRemove).length > 0) {
      // Remove nested fields from leagues/{leagueId} using updateDoc with FieldValue.delete()
      const updateData: Record<string, any> = {};
      for (const key of Object.keys(fieldsToRemove)) {
        updateData[key] = deleteField();
      }
      await updateDoc(doc(db, 'leagues', leagueId), updateData);
      report.notes.push(`Removed fields from leagues/${leagueId}: ${Object.keys(fieldsToRemove).join(', ')}`);
      console.log(`  ✓ Removed nested fields from leagues/${leagueId}: ${Object.keys(fieldsToRemove).join(', ')}`);
    }

    report.nestedFieldsRemoved = true;
    reports.push(report);
    console.log('');
  }

  // ── Retire settings/league (after migration) ──
  console.log('--- Retiring settings/league singleton ---');
  if (oldSettingsSnap.exists()) {
    // Don't delete yet — mark for retirement. The old doc can stay as a tombstone.
    // Update it to indicate it's retired
    await setDoc(doc(db, 'settings', 'league'), {
      _migrated: true,
      _migratedAt: new Date().toISOString(),
      _note: 'This document is retired. See settings/{leagueId} for per-league settings.',
    }, { merge: true });
    console.log('  ✓ Marked settings/league as migrated (tombstone)');
    console.log('  ⚠ You may delete this document after confirming all references are updated.');
  } else {
    console.log('  - settings/league does not exist, nothing to retire.');
  }

  console.log('\n=== Migration Complete ===');
  console.log(JSON.stringify(reports, null, 2));
}

// Placeholder — we'll use field delete differently
const deleteFieldPlaceholder = '__DELETE__';

migrate().catch(console.error);
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─────────────────────────────────────────────────────────────
// One-time migration: seed team_history + current_team_id for
// players created before the transfer system existed.
//
// Usage:
//   node node_modules\jiti\lib\jiti-cli.mjs scripts\migrateToTeamHistory.ts          (dry-run)
//   node node_modules\jiti\lib\jiti-cli.mjs scripts\migrateToTeamHistory.ts --apply  (write)
// ─────────────────────────────────────────────────────────────

const PLAYERS_COLLECTION = 'players';
const BATCH_LIMIT = 400;

// Load credentials from .env, matching the project's existing scripts.
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    let v = trimmed.slice(eqIdx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

if (!rawKey || !clientEmail || !projectId) {
  console.error('Missing Firebase Admin credentials in .env');
  process.exit(1);
}

const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});
const db = getFirestore(app);

const isApply = process.argv.includes('--apply');

interface PlannedUpdate {
  ref: FirebaseFirestore.DocumentReference;
  updates: Record<string, unknown>;
}

function planUpdates(snap: FirebaseFirestore.QuerySnapshot): PlannedUpdate[] {
  const plans: PlannedUpdate[] = [];

  snap.forEach((doc) => {
    const data = doc.data();
    const teamId = data.team_id ?? data.teamId ?? null;

    const needsHistory = !Array.isArray(data.team_history);
    const needsAlias = data.current_team_id === undefined;

    if (!needsHistory && !needsAlias) return;

    const updates: Record<string, unknown> = {};
    if (needsAlias) updates.current_team_id = teamId;
    if (needsHistory) {
      updates.team_history = [
        {
          team_id: teamId,
          joined_at: data.createdAt ?? null,
          left_at: null,
          order: 0,
        },
      ];
    }
    plans.push({ ref: doc.ref, updates });
  });

  return plans;
}

async function main() {
  console.log('====================================================');
  console.log('PLAYER TEAM-HISTORY MIGRATION');
  console.log('====================================================');
  console.log(`Firebase Project ID: ${projectId}`);
  console.log(`Mode: ${isApply ? 'APPLY (Writing to database)' : 'DRY-RUN (No writes)'}`);
  console.log('====================================================\n');

  const snap = await db.collection(PLAYERS_COLLECTION).get();
  console.log(`Total player documents read: ${snap.size}`);

  const plans = planUpdates(snap);
  console.log(`Players needing migration: ${plans.length}\n`);

  plans.forEach((p) => {
    console.log(`  ${p.ref.id}: setting ${Object.keys(p.updates).join(', ')}`);
  });

  if (!isApply) {
    console.log('\nDRY-RUN complete. Re-run with --apply to write these changes.');
    return;
  }

  for (let i = 0; i < plans.length; i += BATCH_LIMIT) {
    const chunk = plans.slice(i, i + BATCH_LIMIT);
    const batch = db.batch();
    chunk.forEach((p) => batch.update(p.ref, p.updates));
    await batch.commit();
    console.log(`  Committed ${chunk.length} updates (${Math.min(i + BATCH_LIMIT, plans.length)}/${plans.length})`);
  }

  console.log('\nMigration complete.');
}

main().catch((err) => {
  console.error('Fatal error executing team-history migration:', err);
  process.exit(1);
});

// runMigration.ts
import { runRoleMigration } from '../lib/admin';

(async () => {
  console.log('Starting role migration...');
  const result = await runRoleMigration();
  console.log('Migration result:', result);
  process.exit(0);
})();

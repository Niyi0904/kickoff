// runMigration.ts
import { runRoleMigration, createLeagueDocument } from '../lib/admin';

(async () => {
  console.log('Starting role migration...');
  const roleResult = await runRoleMigration();
  console.log('Role migration result:', roleResult);

  console.log('Creating league document...');
  const leagueResult = await createLeagueDocument();
  console.log('League document result:', leagueResult);

  process.exit(0);
})();

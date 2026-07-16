const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const file = process.argv[2];

if (!file) {
  console.log("Usage:");
  console.log("node scripts/restore-firestore.js backups/your-backup.json");
  process.exit(1);
}

async function restore() {
  const backup = JSON.parse(fs.readFileSync(file));

  for (const collectionName of Object.keys(backup)) {
    console.log(`Restoring ${collectionName}...`);

    const docs = backup[collectionName];

    let batch = db.batch();
    let count = 0;

    for (const docId of Object.keys(docs)) {
      const ref = db.collection(collectionName).doc(docId);

      batch.set(ref, docs[docId]);

      count++;

      if (count === 500) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  }

  console.log("\nRestore complete!");
}

restore().catch(console.error);
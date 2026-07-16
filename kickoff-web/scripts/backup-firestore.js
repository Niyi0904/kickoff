const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backupCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();

  const data = {};

  snapshot.forEach((doc) => {
    data[doc.id] = doc.data();
  });

  return data;
}

async function backup() {
  const collections = await db.listCollections();

  const backup = {};

  for (const collection of collections) {
    console.log(`Backing up ${collection.id}...`);

    backup[collection.id] = await backupCollection(collection.id);
  }

  if (!fs.existsSync("backups")) {
    fs.mkdirSync("backups");
  }

  const filename = `firestore-${new Date()
    .toISOString()
    .replace(/:/g, "-")}.json`;

  const filepath = path.join("backups", filename);

  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

  console.log("\nBackup complete!");
  console.log(filepath);
}

backup().catch(console.error);
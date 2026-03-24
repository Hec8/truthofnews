import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value === "your_api_key_here" || value === "your_project_id") {
    throw new Error(`Variable manquante ou invalide: ${key}`);
  }
  return value;
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const email = getArg("email") ?? process.env.ADMIN_EMAIL;
  const password = getArg("password") ?? process.env.ADMIN_PASSWORD;
  const dryRun = hasFlag("dry-run");

  if (!email || !password) {
    throw new Error(
      "Usage: node --env-file=.env.local scripts/migrate-security-to-societe.mjs --email=admin@site.com --password=MotDePasseFort123 [--dry-run]"
    );
  }

  const firebaseConfig = {
    apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  const auth = getAuth();
  const db = getFirestore();

  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await user.getIdToken(true);

  const q = query(collection(db, "articles"), where("category", "==", "securite"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("✅ Aucun article à migrer (category='securite').");
    await signOut(auth);
    return;
  }

  console.log(`📦 ${snapshot.size} article(s) trouvé(s) à migrer vers 'societe'.`);

  if (dryRun) {
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      console.log(`- ${docSnap.id} | ${data.title ?? "(sans titre)"}`);
    });
    console.log("ℹ️ Dry-run terminé. Aucune écriture effectuée.");
    await signOut(auth);
    return;
  }

  const batches = chunk(snapshot.docs, 400);
  let updated = 0;

  for (const docsChunk of batches) {
    const batch = writeBatch(db);
    for (const docSnap of docsChunk) {
      batch.update(docSnap.ref, {
        category: "societe",
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    updated += docsChunk.length;
    console.log(`✅ Batch migré: ${updated}/${snapshot.size}`);
  }

  await signOut(auth);
  console.log("🎉 Migration terminée: toutes les catégories 'securite' sont passées à 'societe'.");
}

main().catch((error) => {
  console.error("❌ Erreur migration:", error?.message || error);
  process.exit(1);
});

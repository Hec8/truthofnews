import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
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
      "Usage: node --env-file=.env.local scripts/repair-article-metadata.mjs --email=admin@site.com --password=MotDePasseFort123 [--dry-run]"
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

  const [articlesSnapshot, commentsSnapshot] = await Promise.all([
    getDocs(collection(db, "articles")),
    getDocs(collection(db, "comments")),
  ]);

  const commentsByArticle = new Map();
  commentsSnapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const articleId = data.articleId;
    if (!articleId) return;
    commentsByArticle.set(articleId, (commentsByArticle.get(articleId) ?? 0) + 1);
  });

  const updates = [];

  articlesSnapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const next = {};

    const expectedCommentCount = commentsByArticle.get(docSnap.id) ?? 0;
    const currentCommentCount = Number(data.commentCount ?? 0);

    if (currentCommentCount !== expectedCommentCount) {
      next.commentCount = expectedCommentCount;
    }

    if (data.status === "published" && !data.publishedAt) {
      next.publishedAt = data.createdAt ?? serverTimestamp();
    }

    if (Object.keys(next).length > 0) {
      next.updatedAt = serverTimestamp();
      updates.push({ ref: docSnap.ref, id: docSnap.id, data, next });
    }
  });

  if (updates.length === 0) {
    console.log("✅ Aucune correction nécessaire.");
    await signOut(auth);
    return;
  }

  console.log(`📦 ${updates.length} article(s) à corriger.`);

  if (dryRun) {
    updates.slice(0, 50).forEach((item) => {
      const title = item.data.title ?? "(sans titre)";
      const fields = Object.keys(item.next).join(", ");
      console.log(`- ${item.id} | ${title} | champs: ${fields}`);
    });
    if (updates.length > 50) {
      console.log(`… ${updates.length - 50} autre(s) article(s)`);
    }
    console.log("ℹ️ Dry-run terminé. Aucune écriture effectuée.");
    await signOut(auth);
    return;
  }

  const batches = chunk(updates, 400);
  let processed = 0;

  for (const batchItems of batches) {
    const batch = writeBatch(db);
    for (const item of batchItems) {
      batch.update(item.ref, item.next);
    }
    await batch.commit();
    processed += batchItems.length;
    console.log(`✅ Batch appliqué: ${processed}/${updates.length}`);
  }

  await signOut(auth);
  console.log("🎉 Réparation terminée (commentCount + publishedAt). ");
}

main().catch((error) => {
  console.error("❌ Erreur réparation:", error?.message || error);
  process.exit(1);
});

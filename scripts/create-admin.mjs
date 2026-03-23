import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value === "your_api_key_here" || value === "your_project_id") {
    throw new Error(`Variable manquante ou invalide: ${key}`);
  }
  return value;
}

async function updateEnvAdminUid(uid) {
  const envPath = resolve(process.cwd(), ".env.local");
  const current = await readFile(envPath, "utf8");

  const line = `NEXT_PUBLIC_ADMIN_UID=${uid}`;
  const updated = current.includes("NEXT_PUBLIC_ADMIN_UID=")
    ? current.replace(/^NEXT_PUBLIC_ADMIN_UID=.*$/m, line)
    : `${current.trim()}\n${line}\n`;

  await writeFile(envPath, updated, "utf8");
}

async function main() {
  const email = getArg("email") ?? process.env.ADMIN_EMAIL;
  const password = getArg("password") ?? process.env.ADMIN_PASSWORD;
  const displayName = getArg("name") ?? process.env.ADMIN_DISPLAY_NAME ?? "Administrateur";

  if (!email || !password) {
    throw new Error(
      "Usage: node --env-file=.env.local scripts/create-admin.mjs --email=admin@site.com --password=MotDePasseFort123"
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

  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;
    console.log(`✅ Compte créé: ${email}`);
  } catch (error) {
    if (error?.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      user = cred.user;
      console.log(`ℹ️ Compte déjà existant, connexion réussie: ${email}`);
    } else {
      throw error;
    }
  }

  // Toujours enregistrer l'UID admin dans .env.local, même si Firestore bloque l'écriture.
  await updateEnvAdminUid(user.uid);
  console.log(`✅ NEXT_PUBLIC_ADMIN_UID mis à jour avec: ${user.uid}`);

  // Assure que le token utilisateur est bien disponible avant les écritures Firestore.
  await user.getIdToken(true);

  let roleAdminSet = false;
  let userDocCreated = false;
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email,
        displayName,
        photoURL: "",
        role: "admin",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    roleAdminSet = true;
    userDocCreated = true;
  } catch {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email,
          displayName,
          photoURL: "",
          role: "user",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      userDocCreated = true;
    } catch {
      userDocCreated = false;
    }
  }

  await signOut(auth);

  if (roleAdminSet) {
    console.log("✅ users/{uid}.role défini sur 'admin'");
  } else if (userDocCreated) {
    console.log("⚠️ users/{uid} créé avec role='user' (règles Firestore empêchent role='admin').");
    console.log("   Ouvrez Firebase Console > Firestore > users/{uid} > role='admin'.");
  } else {
    console.log("⚠️ Impossible de créer/mettre à jour users/{uid} (permissions Firestore).\n");
    console.log("   Actions à faire dans Firebase Console:");
    console.log(`   1) Collection users -> document ${user.uid}`);
    console.log("   2) Champs: uid, email, displayName, photoURL, role='admin'\n");
    console.log("   Le compte reste admin côté application grâce à NEXT_PUBLIC_ADMIN_UID.");
  }

  console.log("\n➡️ Redémarrez le serveur Next.js après mise à jour de .env.local");
}

main().catch((error) => {
  console.error("❌ Erreur:", error?.message || error);
  process.exit(1);
});

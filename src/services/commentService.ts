import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Comment } from "@/types";

// ─── Ajouter un commentaire ───────────────────────────────
export async function addComment(
  articleId: string,
  userId: string,
  userName: string,
  userPhotoURL: string,
  content: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "comments"), {
    articleId,
    userId,
    userName,
    userPhotoURL: userPhotoURL || "",
    content,
    createdAt: serverTimestamp(),
  });

  // Incrémenter le compteur de commentaires de l'article
  await updateDoc(doc(db, "articles", articleId), {
    commentCount: increment(1),
  });

  return docRef.id;
}

// ─── Supprimer un commentaire ─────────────────────────────
export async function deleteComment(
  commentId: string,
  articleId: string
): Promise<void> {
  await deleteDoc(doc(db, "comments", commentId));
  await updateDoc(doc(db, "articles", articleId), {
    commentCount: increment(-1),
  });
}

// ─── Écouter les commentaires en temps réel ───────────────
export function subscribeToComments(
  articleId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "comments"),
    where("articleId", "==", articleId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Comment)
    );
    callback(comments);
  });
}

// ─── Compter les commentaires total (admin) ───────────────
export async function getTotalCommentsCount(): Promise<number> {
  const { getDocs, collection: col } = await import("firebase/firestore");
  const snapshot = await getDocs(col(db, "comments"));
  return snapshot.size;
}

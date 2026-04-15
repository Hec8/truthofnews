import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article, ArticleCategory, ArticleFormData, ArticleStatus } from "@/types";

const ARTICLES_PER_PAGE = 10;

function isMissingIndexError(error: unknown): boolean {
  const message = String((error as { message?: string })?.message ?? "").toLowerCase();
  return message.includes("requires an index") || message.includes("failed-precondition");
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "object" && value !== null && "toDate" in (value as Record<string, unknown>)) {
    const d = (value as { toDate: () => Date }).toDate();
    return d.getTime();
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function sortByPublishedOrCreatedDesc(articles: Article[]): Article[] {
  return articles.sort((a, b) => {
    const aTime = toMillis(a.publishedAt) || toMillis(a.createdAt);
    const bTime = toMillis(b.publishedAt) || toMillis(b.createdAt);
    return bTime - aTime;
  });
}

function mergeAndSortArticles(
  primary: Article[],
  fallback: Article[],
  maxCount: number
): Article[] {
  const map = new Map<string, Article>();
  for (const article of [...primary, ...fallback]) {
    if (!map.has(article.id)) {
      map.set(article.id, article);
    }
  }

  return sortByPublishedOrCreatedDesc(Array.from(map.values())).slice(0, maxCount);
}

// ─── Créer un article ─────────────────────────────────────
export async function createArticle(
  data: ArticleFormData,
  authorId: string,
  authorName: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "articles"), {
    ...data,
    authorId,
    authorName,
    viewCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null,
  });
  return docRef.id;
}

// ─── Mettre à jour un article ─────────────────────────────
export async function updateArticle(
  id: string,
  data: Partial<ArticleFormData>,
  previousStatus?: ArticleStatus
): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.status === "published") {
    if (previousStatus !== "published") {
      updateData.publishedAt = serverTimestamp();
    } else {
      // Répare les anciens articles publiés qui n'ont pas de publishedAt
      const current = await getDoc(doc(db, "articles", id));
      if (current.exists() && !current.data().publishedAt) {
        updateData.publishedAt = serverTimestamp();
      }
    }
  }

  await updateDoc(doc(db, "articles", id), updateData);
}

// ─── Supprimer un article ─────────────────────────────────
export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, "articles", id));
}

// ─── Récupérer un article par ID ──────────────────────────
export async function getArticleById(id: string): Promise<Article | null> {
  const docSnap = await getDoc(doc(db, "articles", id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Article;
}

// ─── Récupérer un article par slug ────────────────────────
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const q = query(
    collection(db, "articles"),
    where("slug", "==", slug),
    where("status", "==", "published"),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Article;
}

// ─── Articles publiés (paginés) ───────────────────────────
export async function getPublishedArticles(
  lastDoc?: QueryDocumentSnapshot | null,
  pageSize = ARTICLES_PER_PAGE
): Promise<{ articles: Article[]; lastDoc: QueryDocumentSnapshot | null }> {
  try {
    let q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Article)
    );
    if (articles.length === 0) {
      const fallback = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        limit(pageSize)
      );
      const fallbackSnapshot = await getDocs(fallback);
      const fallbackArticles = sortByPublishedOrCreatedDesc(
        fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article))
      );
      return { articles: fallbackArticles, lastDoc: null };
    }
    // Certains articles publiés peuvent ne pas avoir publishedAt
    // et être exclus de orderBy("publishedAt").
    if (!lastDoc) {
      const fallback = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        limit(Math.max(pageSize * 3, 30))
      );
      const fallbackSnapshot = await getDocs(fallback);
      const fallbackArticles = fallbackSnapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Article)
      );

      const merged = mergeAndSortArticles(articles, fallbackArticles, pageSize);
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { articles: merged, lastDoc: newLastDoc };
    }

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    return { articles, lastDoc: newLastDoc };
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;

    const fallbackLimit = Math.max(pageSize * 3, 30);
    const fallback = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      limit(fallbackLimit)
    );
    const snapshot = await getDocs(fallback);
    const articles = sortByPublishedOrCreatedDesc(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article))
    ).slice(0, pageSize);

    return { articles, lastDoc: null };
  }
}

// ─── Articles par catégorie ───────────────────────────────
export async function getArticlesByCategory(
  category: ArticleCategory,
  lastDoc?: QueryDocumentSnapshot | null,
  pageSize = ARTICLES_PER_PAGE
): Promise<{ articles: Article[]; lastDoc: QueryDocumentSnapshot | null }> {
  const categoryFilter =
    category === "societe"
      ? where("category", "in", ["societe", "securite"])
      : where("category", "==", category);

  try {
    let q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      categoryFilter,
      orderBy("publishedAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        categoryFilter,
        orderBy("publishedAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Article)
    );
    if (articles.length === 0) {
      const fallback = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        categoryFilter,
        limit(pageSize)
      );
      const fallbackSnapshot = await getDocs(fallback);
      const fallbackArticles = sortByPublishedOrCreatedDesc(
        fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article))
      );
      return { articles: fallbackArticles, lastDoc: null };
    }
    if (!lastDoc) {
      const fallback = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        categoryFilter,
        limit(Math.max(pageSize * 3, 30))
      );
      const fallbackSnapshot = await getDocs(fallback);
      const fallbackArticles = fallbackSnapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Article)
      );

      const merged = mergeAndSortArticles(articles, fallbackArticles, pageSize);
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { articles: merged, lastDoc: newLastDoc };
    }

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    return { articles, lastDoc: newLastDoc };
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;

    const fallbackLimit = Math.max(pageSize * 3, 30);
    const fallback = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      categoryFilter,
      limit(fallbackLimit)
    );
    const snapshot = await getDocs(fallback);
    const articles = sortByPublishedOrCreatedDesc(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article))
    ).slice(0, pageSize);

    return { articles, lastDoc: null };
  }
}

// ─── Articles populaires ──────────────────────────────────
export async function getPopularArticles(count = 5): Promise<Article[]> {
  try {
    const q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("viewCount", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;

    const fallback = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      limit(count)
    );
    const snapshot = await getDocs(fallback);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Article))
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }
}

// ─── Articles récents ─────────────────────────────────────
export async function getRecentArticles(count = 5): Promise<Article[]> {
  try {
    const q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article));

    // Fusionne systématiquement avec un fallback sans orderBy pour inclure
    // les documents publiés sans publishedAt.
    const fallback = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      limit(Math.max(count * 3, 30))
    );
    const fallbackSnapshot = await getDocs(fallback);
    const fallbackArticles = fallbackSnapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Article)
    );

    return mergeAndSortArticles(articles, fallbackArticles, count);
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;

    const fallbackLimit = Math.max(count * 3, 30);
    const fallback = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      limit(fallbackLimit)
    );
    const snapshot = await getDocs(fallback);
    return sortByPublishedOrCreatedDesc(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article))
    ).slice(0, count);
  }
}

// ─── Tous les articles (admin) ────────────────────────────
export async function getAllArticlesAdmin(): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
}

// ─── Incrémenter les vues ─────────────────────────────────
export async function incrementViewCount(id: string): Promise<void> {
  await updateDoc(doc(db, "articles", id), {
    viewCount: increment(1),
  });
}

// ─── Recherche d'articles ─────────────────────────────────
export async function searchArticles(searchTerm: string): Promise<Article[]> {
  // Firestore ne supporte pas la recherche full-text nativement
  // On charge les articles récents et on filtre côté client
  let snapshot;
  try {
    const q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(100)
    );
    snapshot = await getDocs(q);
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;
    const fallback = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      limit(100)
    );
    snapshot = await getDocs(fallback);
  }

  const term = searchTerm.toLowerCase();
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Article))
    .sort((a, b) => {
      const aTime = toMillis(a.publishedAt) || toMillis(a.createdAt);
      const bTime = toMillis(b.publishedAt) || toMillis(b.createdAt);
      return bTime - aTime;
    })
    .filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.excerpt.toLowerCase().includes(term)
    );
}

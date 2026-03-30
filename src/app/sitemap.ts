import { MetadataRoute } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/types";

export const revalidate = 3600;

type FirestoreDateLike =
  | Date
  | { toDate?: () => Date; seconds?: number; nanoseconds?: number }
  | string
  | number
  | null
  | undefined;

interface SitemapArticle {
  slug?: string;
  updatedAt?: FirestoreDateLike;
  publishedAt?: FirestoreDateLike;
}

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://truthofnews.vercel.app").replace(/\/$/, "");
}

function toDate(value: FirestoreDateLike): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value === "object" && "seconds" in value) {
    const seconds = Number(value.seconds ?? 0);
    const nanoseconds = Number(value.nanoseconds ?? 0);
    const date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

async function getPublishedArticleEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const snapshot = await getDocs(
      query(collection(db, "articles"), where("status", "==", "published"))
    );

    return snapshot.docs
      .map((doc) => doc.data() as SitemapArticle)
      .filter((article) => Boolean(article.slug))
      .map((article) => ({
        url: `${baseUrl}/article/${article.slug}`,
        lastModified: toDate(article.updatedAt) ?? toDate(article.publishedAt) ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/recherche`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/categorie/${category.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const articlePages = await getPublishedArticleEntries(baseUrl);

  return [...staticPages, ...categoryPages, ...articlePages];
}

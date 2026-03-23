import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, Eye, Tag, User } from "lucide-react";
import {
  getArticleBySlug,
  getRecentArticles,
  getPopularArticles,
  incrementViewCount,
} from "@/services/articleService";
import CommentSection from "@/components/article/CommentSection";
import Sidebar from "@/components/layout/Sidebar";
import { CATEGORIES } from "@/types";
import { formatDate, getReadingTime } from "@/lib/utils";
import Link from "next/link";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function toIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === "object" && value !== null && "toDate" in (value as Record<string, unknown>)) {
    const d = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (typeof value === "object" && value !== null && "seconds" in (value as Record<string, unknown>)) {
    const seconds = Number((value as { seconds?: number }).seconds ?? 0);
    const nanoseconds = Number((value as { nanoseconds?: number }).nanoseconds ?? 0);
    const d = new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000));
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  return undefined;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article non trouvé" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
      type: "article",
      publishedTime: toIsoDate(article.publishedAt),
      authors: [article.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const [article, popularArticles, recentArticles] = await Promise.all([
    getArticleBySlug(slug),
    getPopularArticles(5),
    getRecentArticles(5),
  ]);

  if (!article) notFound();

  // Incrémenter les vues (best effort)
  incrementViewCount(article.id).catch(console.warn);

  const category = CATEGORIES.find((c) => c.id === article.category);
  const publishDate = article.publishedAt || article.createdAt;
  const readingTime = getReadingTime(article.content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article principal */}
        <article className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#94a3b8] mb-6">
            <Link href="/" className="hover:text-[#1a3a6b] dark:hover:text-[#6090fa] transition-colors">
              Accueil
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/categorie/${category.id}`}
                  className="hover:text-[#1a3a6b] dark:hover:text-[#6090fa] transition-colors"
                >
                  {category.label}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-[#64748b] line-clamp-1">{article.title}</span>
          </nav>

          {/* Catégorie */}
          {category && (
            <Link href={`/categorie/${category.id}`}>
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: category.color }}
              >
                {category.label}
              </span>
            </Link>
          )}

          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] dark:text-white font-serif leading-tight mb-4">
            {article.title}
          </h1>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748b] dark:text-[#94a3b8] mb-6 pb-6 border-b border-[#e2e8f0] dark:border-[#334155]">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(publishDate as Date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingTime} min de lecture
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {article.viewCount} vues
            </span>
          </div>

          {/* Image principale */}
          {article.imageUrl && (
            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Extrait */}
          {article.excerpt && (
            <blockquote className="text-lg text-[#374151] dark:text-[#d1d5db] font-medium border-l-4 border-[#1a3a6b] dark:border-[#3b6ef6] pl-5 mb-8 italic leading-relaxed">
              {article.excerpt}
            </blockquote>
          )}

          {/* Contenu */}
          <div
            className="article-content text-[#374151] dark:text-[#d1d5db]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-8 pt-8 border-t border-[#e2e8f0] dark:border-[#334155]">
              <Tag className="h-4 w-4 text-[#94a3b8]" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#f1f5f9] dark:bg-[#334155] text-sm text-[#64748b] dark:text-[#94a3b8]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Commentaires */}
          <CommentSection articleId={article.id} />
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Sidebar popularArticles={popularArticles} recentArticles={recentArticles} />
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Eye, MessageCircle } from "lucide-react";
import { Article, getCategoryById } from "@/types";
import { formatDate, getReadingTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "horizontal" | "featured" | "compact";
  className?: string;
}

export default function ArticleCard({
  article,
  variant = "default",
  className,
}: ArticleCardProps) {
  const category = getCategoryById(article.category);
  const readingTime = getReadingTime(article.content || article.excerpt);
  const publishDate = article.publishedAt || article.createdAt;

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`} className={cn("group block", className)}>
        <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-lg">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a3a6b] to-[#3b6ef6]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {category && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
                style={{ backgroundColor: category.color }}
              >
                {category.label}
              </span>
            )}
            <h2 className="text-white text-2xl font-bold font-serif leading-tight mb-2 group-hover:text-[#93b4fd] transition-colors">
              {article.title}
            </h2>
            <p className="text-white/75 text-sm line-clamp-2 mb-3">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 text-white/60 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(publishDate as Date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min de lecture
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${article.slug}`} className={cn("group flex gap-4", className)}>
        <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={128}
              height={96}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a3a6b] to-[#3b6ef6]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {category && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white mb-1.5"
              style={{ backgroundColor: category.color }}
            >
              {category.label}
            </span>
          )}
          <h3 className="font-semibold text-[#1e293b] dark:text-[#f8fafc] text-sm line-clamp-2 leading-snug group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors font-serif">
            {article.title}
          </h3>
          <p className="text-xs text-[#94a3b8] mt-1.5">
            {formatDate(publishDate as Date)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn(
          "group block p-4 rounded-xl border border-[#e2e8f0] dark:border-[#334155] hover:border-[#1a3a6b] dark:hover:border-[#3b6ef6] transition-all hover:shadow-md",
          className
        )}
      >
        <h3 className="font-medium text-[#1e293b] dark:text-[#f8fafc] text-sm line-clamp-2 group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-[#94a3b8] mt-2">{formatDate(publishDate as Date)}</p>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={`/article/${article.slug}`}
      className={cn(
        "group block bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden hover:shadow-lg hover:border-[#bfd3fe] dark:hover:border-[#3b6ef6] transition-all duration-300",
        className
      )}
    >
      <div className="relative h-48 overflow-hidden">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a3a6b] to-[#3b6ef6] flex items-center justify-center">
            <span className="text-4xl font-bold text-white/30 font-serif">B</span>
          </div>
        )}
        {category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: category.color }}
          >
            {category.label}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-[#1e293b] dark:text-[#f8fafc] text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors font-serif">
          {article.title}
        </h3>
        <p className="text-sm text-[#64748b] dark:text-[#94a3b8] line-clamp-2 mb-4">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-[#94a3b8]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(publishDate as Date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

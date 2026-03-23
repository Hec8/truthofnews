import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Clock } from "lucide-react";
import { Article, CATEGORIES } from "@/types";
import { formatDate } from "@/lib/utils";

interface SidebarProps {
  popularArticles: Article[];
  recentArticles: Article[];
}

export default function Sidebar({ popularArticles, recentArticles }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Articles populaires */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#c8a217]" />
          <h2 className="font-bold text-[#0f172a] dark:text-white font-serif">
            Articles Populaires
          </h2>
        </div>
        <div className="divide-y divide-[#f1f5f9] dark:divide-[#334155]">
          {popularArticles.length === 0 ? (
            <p className="p-5 text-sm text-[#64748b]">Aucun article</p>
          ) : (
            popularArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="flex gap-3 p-4 hover:bg-[#f8fafc] dark:hover:bg-[#334155] transition-colors group"
              >
                <span className="text-2xl font-bold text-[#e2e8f0] dark:text-[#334155] font-serif w-7 shrink-0 group-hover:text-[#1a3a6b] dark:group-hover:text-[#3b6ef6] transition-colors">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1e293b] dark:text-[#f8fafc] line-clamp-2 group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors leading-snug">
                    {article.title}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    {article.viewCount} vues
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Articles récents */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] dark:border-[#334155] flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#1a3a6b] dark:text-[#3b6ef6]" />
          <h2 className="font-bold text-[#0f172a] dark:text-white font-serif">
            Articles Récents
          </h2>
        </div>
        <div className="divide-y divide-[#f1f5f9] dark:divide-[#334155]">
          {recentArticles.length === 0 ? (
            <p className="p-5 text-sm text-[#64748b]">Aucun article</p>
          ) : (
            recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="flex gap-3 p-4 hover:bg-[#f8fafc] dark:hover:bg-[#334155] transition-colors group"
              >
                {article.imageUrl && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1e293b] dark:text-[#f8fafc] line-clamp-2 group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors leading-snug">
                    {article.title}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    {formatDate(article.publishedAt as Date || article.createdAt as Date)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Catégories */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] dark:border-[#334155]">
          <h2 className="font-bold text-[#0f172a] dark:text-white font-serif">
            Catégories
          </h2>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorie/${cat.id}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: cat.color }}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

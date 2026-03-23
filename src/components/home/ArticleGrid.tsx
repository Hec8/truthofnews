import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Article } from "@/types";
import ArticleCard from "@/components/common/ArticleCard";

interface ArticleGridProps {
  articles: Article[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
}

export default function ArticleGrid({
  articles,
  title = "Derniers Articles",
  showViewAll = false,
  viewAllHref = "/",
}: ArticleGridProps) {
  return (
    <section className="animate-slide-up">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-[#1a3a6b] dark:bg-[#3b6ef6] rounded-full" />
            <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white font-serif">
              {title}
            </h2>
          </div>
          {showViewAll && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-sm font-medium text-[#1a3a6b] dark:text-[#6090fa] hover:gap-2 transition-all"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="text-center py-16 text-[#94a3b8]">
          <p className="text-lg">Aucun article disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}

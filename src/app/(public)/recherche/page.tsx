"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { searchArticles } from "@/services/articleService";
import { Article } from "@/types";
import ArticleCard from "@/components/common/ArticleCard";
import SearchBar from "@/components/common/SearchBar";
import { SkeletonGrid } from "@/components/common/SkeletonCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResult, setSearchResult] = useState<{ query: string; articles: Article[] } | null>(null);

  useEffect(() => {
    if (!query) return;
    searchArticles(query).then((articles) => setSearchResult({ query, articles }));
  }, [query]);

  const hasSearched = searchResult?.query === query;
  const loading = !!query && !hasSearched;
  const articles = hasSearched ? searchResult!.articles : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white font-serif mb-2 text-center">
          Recherche
        </h1>
        {query && (
          <p className="text-[#64748b] text-center mb-6">
            Résultats pour : <span className="font-medium text-[#1a3a6b] dark:text-[#6090fa]">&ldquo;{query}&rdquo;</span>
          </p>
        )}
        <SearchBar initialQuery={query} />
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : hasSearched && articles.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-[#e2e8f0] dark:text-[#334155] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#0f172a] dark:text-white mb-2">
            Aucun résultat trouvé
          </h2>
          <p className="text-[#64748b]">
            Essayez avec d&apos;autres mots-clés ou parcourez nos catégories.
          </p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <p className="text-sm text-[#94a3b8] mb-6">
            {articles.length} article{articles.length > 1 ? "s" : ""} trouvé{articles.length > 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-[#e2e8f0] dark:text-[#334155] mx-auto mb-4" />
          <p className="text-[#64748b]">Entrez un terme de recherche pour commencer.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

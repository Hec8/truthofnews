import type { Metadata } from "next";
import { getRecentArticles, getPopularArticles } from "@/services/articleService";
import HeroSection from "@/components/home/HeroSection";
import ArticleGrid from "@/components/home/ArticleGrid";
import CategorySection from "@/components/home/CategorySection";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Truth of News – Actualités Politiques Bénin",
  description:
    "Votre source d'information fiable sur l'actualité politique du Bénin. Analyses, décryptages et reportages de terrain.",
};

// Revalidation toutes les 60 secondes (ISR)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recentArticles: Awaited<ReturnType<typeof getRecentArticles>> = [];
  let popularArticles: Awaited<ReturnType<typeof getPopularArticles>> = [];

  const [recentResult, popularResult] = await Promise.allSettled([
    getRecentArticles(10),
    getPopularArticles(5),
  ]);

  if (recentResult.status === "fulfilled") {
    recentArticles = recentResult.value;
  }

  if (popularResult.status === "fulfilled") {
    popularArticles = popularResult.value;
  }

  const featuredArticle = recentArticles[0] || null;
  const sideArticles = recentArticles.slice(1, 4);
  const gridArticles = recentArticles.slice(4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <HeroSection featuredArticle={featuredArticle} sideArticles={sideArticles} />

      {/* Catégories */}
      <CategorySection />

      {/* Grille + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ArticleGrid articles={gridArticles} title="Dernières actualités" />
        </div>
        <div className="lg:col-span-1">
          <Sidebar popularArticles={popularArticles} recentArticles={recentArticles.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw } from "lucide-react";
import { getAllArticlesAdmin } from "@/services/articleService";
import { getTotalCommentsCount } from "@/services/commentService";
import { Article, DashboardStats } from "@/types";
import StatsCards from "@/components/admin/StatsCards";
import ArticleList from "@/components/admin/ArticleList";
import { Button } from "@/components/ui/button";
import { SkeletonGrid } from "@/components/common/SkeletonCard";

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allArticles, totalComments] = await Promise.all([
        getAllArticlesAdmin(),
        getTotalCommentsCount(),
      ]);

      setArticles(allArticles);
      setStats({
        totalArticles: allArticles.length,
        publishedArticles: allArticles.filter((a) => a.status === "published").length,
        draftArticles: allArticles.filter((a) => a.status === "draft").length,
        totalComments,
        totalViews: allArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white font-serif">
            Dashboard
          </h1>
          <p className="text-[#64748b] dark:text-[#94a3b8] mt-1">
            Bienvenue sur votre espace d&apos;administration
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button variant="outline" size="icon" onClick={loadData} title="Actualiser" className="shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/articles/nouveau">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouvel article
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <StatsCards stats={stats} />

      {/* Liste des articles */}
      <div>
        <h2 className="text-xl font-bold text-[#0f172a] dark:text-white font-serif mb-4">
          Gestion des articles
        </h2>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : (
          <ArticleList articles={articles} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
}

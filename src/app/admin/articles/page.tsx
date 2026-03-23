"use client";

import { useEffect, useState } from "react";
import { getAllArticlesAdmin } from "@/services/articleService";
import { getTotalCommentsCount } from "@/services/commentService";
import { Article, DashboardStats } from "@/types";
import ArticleList from "@/components/admin/ArticleList";
import StatsCards from "@/components/admin/StatsCards";
import { SkeletonGrid } from "@/components/common/SkeletonCard";

export default function AdminArticlesPage() {
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
      <div>
        <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white font-serif">
          Articles
        </h1>
        <p className="text-[#64748b] dark:text-[#94a3b8] mt-1">
          Gérez tous vos articles
        </p>
      </div>

      <StatsCards stats={stats} />

      {loading ? (
        <SkeletonGrid count={3} />
      ) : (
        <ArticleList articles={articles} onRefresh={loadData} />
      )}
    </div>
  );
}

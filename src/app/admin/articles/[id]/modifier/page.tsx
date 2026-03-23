"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { getArticleById } from "@/services/articleService";
import { Article } from "@/types";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { SkeletonArticlePage } from "@/components/common/SkeletonCard";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    getArticleById(id)
      .then((data) => {
        if (!data) setNotFoundError(true);
        else setArticle(data);
      })
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (notFoundError) notFound();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <SkeletonArticlePage />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {article && <ArticleEditor article={article} />}
    </div>
  );
}

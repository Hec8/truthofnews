"use client";

import { useEffect } from "react";
import { incrementViewCount } from "@/services/articleService";

interface ArticleViewTrackerProps {
  articleId: string;
}

const VIEW_SESSION_KEY_PREFIX = "article-viewed:";

export default function ArticleViewTracker({ articleId }: ArticleViewTrackerProps) {
  useEffect(() => {
    if (!articleId) return;

    const key = `${VIEW_SESSION_KEY_PREFIX}${articleId}`;
    if (sessionStorage.getItem(key) === "1") return;

    const timer = window.setTimeout(async () => {
      try {
        await incrementViewCount(articleId);
        sessionStorage.setItem(key, "1");
      } catch (error) {
        console.warn("Impossible d'incrémenter les vues:", error);
      }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [articleId]);

  return null;
}
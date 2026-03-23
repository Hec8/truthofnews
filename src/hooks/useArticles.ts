"use client";

import { useState, useCallback } from "react";
import {
  getPublishedArticles,
  getArticlesByCategory,
  searchArticles,
} from "@/services/articleService";
import { Article, ArticleCategory } from "@/types";
import { QueryDocumentSnapshot } from "firebase/firestore";

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const docToUse = reset ? null : lastDoc;
      const { articles: newArticles, lastDoc: newLastDoc } =
        await getPublishedArticles(docToUse);

      setArticles((prev) => (reset ? newArticles : [...prev, ...newArticles]));
      setLastDoc(newLastDoc);
      setHasMore(newArticles.length === 10);
    } catch (err) {
      setError("Erreur lors du chargement des articles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  const fetchByCategory = useCallback(
    async (category: ArticleCategory, reset = false) => {
      setLoading(true);
      setError(null);
      try {
        const docToUse = reset ? null : lastDoc;
        const { articles: newArticles, lastDoc: newLastDoc } =
          await getArticlesByCategory(category, docToUse);

        setArticles((prev) =>
          reset ? newArticles : [...prev, ...newArticles]
        );
        setLastDoc(newLastDoc);
        setHasMore(newArticles.length === 10);
      } catch (err) {
        setError("Erreur lors du chargement des articles");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [lastDoc]
  );

  const search = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchArticles(term);
      setArticles(results);
      setHasMore(false);
    } catch (err) {
      setError("Erreur lors de la recherche");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    articles,
    loading,
    error,
    hasMore,
    fetchArticles,
    fetchByCategory,
    search,
  };
}

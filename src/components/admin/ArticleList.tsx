"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Eye, EyeOff, Search, Plus, ExternalLink } from "lucide-react";
import { Article, getCategoryById } from "@/types";
import { deleteArticle, updateArticle } from "@/services/articleService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import toast from "react-hot-toast";

interface ArticleListProps {
  articles: Article[];
  onRefresh: () => void;
}

export default function ArticleList({ articles, onRefresh }: ArticleListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (article: Article) => {
    if (!confirm(`Supprimer "${article.title}" ?`)) return;
    setDeleting(article.id);
    try {
      await deleteArticle(article.id);
      toast.success("Article supprimé");
      onRefresh();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const toggleStatus = async (article: Article) => {
    const newStatus = article.status === "published" ? "draft" : "published";
    try {
      await updateArticle(article.id, { status: newStatus }, article.status);
      toast.success(newStatus === "published" ? "Article publié !" : "Article mis en brouillon");
      onRefresh();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 h-10 rounded-lg border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-sm text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] dark:focus:ring-[#3b6ef6]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "draft"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? "bg-[#1a3a6b] text-white"
                  : "bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] text-[#374151] dark:text-[#d1d5db] hover:border-[#1a3a6b]"
              }`}
            >
              {status === "all" ? "Tous" : status === "published" ? "Publiés" : "Brouillons"}
            </button>
          ))}
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link href="/admin/articles/nouveau">
            <Plus className="h-4 w-4 mr-1" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155]">
          <p className="text-[#94a3b8]">Aucun article trouvé</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden sm:table-cell">
                    Catégorie
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#334155]">
                {filtered.map((article) => {
                  const cat = getCategoryById(article.category);
                  return (
                    <tr key={article.id} className="hover:bg-[#f8fafc] dark:hover:bg-[#0f172a] transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-[#1e293b] dark:text-[#f8fafc] line-clamp-1 max-w-xs">
                          {article.title}
                        </p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                          👁 {article.viewCount} · 💬 {article.commentCount}
                        </p>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        {cat && (
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm text-[#64748b]">
                          {formatDateShort(article.createdAt as Date)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={article.status === "published" ? "success" : "warning"}>
                          {article.status === "published" ? "Publié" : "Brouillon"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {article.status === "published" && (
                            <Link
                              href={`/article/${article.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-md text-[#64748b] hover:text-[#1a3a6b] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
                              title="Voir l'article"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => toggleStatus(article)}
                            className="p-1.5 rounded-md text-[#64748b] hover:text-[#1a3a6b] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
                            title={article.status === "published" ? "Mettre en brouillon" : "Publier"}
                          >
                            {article.status === "published" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/articles/${article.id}/modifier`}
                            className="p-1.5 rounded-md text-[#64748b] hover:text-[#1a3a6b] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(article)}
                            disabled={deleting === article.id}
                            className="p-1.5 rounded-md text-[#64748b] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

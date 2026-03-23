"use client";

import { useState } from "react";
import { Send, Trash2, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useComments } from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isAdmin } = useAuth();
  const { comments, loading, submitting, submitComment, removeComment } =
    useComments(articleId);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      toast.error("Vous devez être connecté pour commenter");
      return;
    }
    try {
      await submitComment(
        user.uid,
        user.displayName || "Anonyme",
        user.photoURL || "",
        content.trim()
      );
      setContent("");
      toast.success("Commentaire publié !");
    } catch {
      toast.error("Erreur lors de la publication");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      await removeComment(commentId);
      toast.success("Commentaire supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-[#e2e8f0] dark:border-[#334155]">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="h-6 w-6 text-[#1a3a6b] dark:text-[#3b6ef6]" />
        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white font-serif">
          Commentaires ({comments.length})
        </h2>
      </div>

      {/* Formulaire de commentaire */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a3a6b] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partagez votre opinion..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#94a3b8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] dark:focus:ring-[#3b6ef6] focus:border-transparent transition-colors"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" size="sm" loading={submitting} disabled={!content.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] text-center">
          <p className="text-[#64748b] dark:text-[#94a3b8] mb-4">
            Connectez-vous pour laisser un commentaire
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="sm">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-[#94a3b8]">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Soyez le premier à commenter cet article !</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a3a6b] to-[#3b6ef6] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {comment.userName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="bg-[#f8fafc] dark:bg-[#1e293b] rounded-xl px-4 py-3 border border-[#e2e8f0] dark:border-[#334155]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#1e293b] dark:text-[#f8fafc]">
                      {comment.userName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#94a3b8]">
                        {formatRelativeDate(comment.createdAt as Date)}
                      </span>
                      {(isAdmin || user?.uid === comment.userId) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-[#94a3b8] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#374151] dark:text-[#d1d5db] leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

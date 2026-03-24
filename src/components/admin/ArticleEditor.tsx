"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { Article, ArticleCategory, ArticleFormData, CATEGORIES } from "@/types";
import { createArticle, updateArticle } from "@/services/articleService";
import { generateSlug, generateUniqueSlug } from "@/lib/slugify";
import { generateExcerpt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-80 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a] animate-pulse" />
  ),
});

interface ArticleEditorProps {
  article?: Article;
}

const defaultForm: ArticleFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  imageAlt: "",
  category: "politique",
  status: "draft",
  tags: [],
};

function normalizeEditorCategory(category: ArticleCategory): ArticleCategory {
  return category === "securite" ? "societe" : category;
}

export default function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<ArticleFormData>(
    article
      ? {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          imageUrl: article.imageUrl,
          imageAlt: article.imageAlt || "",
          category: normalizeEditorCategory(article.category),
          status: article.status,
          tags: article.tags || [],
        }
      : defaultForm
  );
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(!!article);

  // Auto-génération du slug
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.title) }));
    }
  }, [form.title, slugManual]);

  // Auto-génération de l'extrait
  useEffect(() => {
    if (!form.excerpt && form.content) {
      setForm((prev) => ({
        ...prev,
        excerpt: generateExcerpt(form.content, 160),
      }));
    }
  }, [form.content, form.excerpt]);

  const handleSubmit = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (!form.content.trim() || form.content === "<p></p>") {
      toast.error("Le contenu est obligatoire");
      return;
    }
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setSaving(true);
    try {
      const finalSlug = form.slug || generateUniqueSlug(form.title);
      const data = { ...form, slug: finalSlug, status };
      const authorName = (user.displayName || "").trim();
      const publicAuthorName = !authorName || authorName.toLowerCase() === "admin"
        ? "La rédaction"
        : authorName;

      if (article) {
        await updateArticle(article.id, data, article.status);
        toast.success("Article mis à jour !");
      } else {
        await createArticle(
          data,
          user.uid,
          publicAuthorName
        );
        toast.success(status === "published" ? "Article publié !" : "Brouillon enregistré !");
      }
      router.push("/admin/articles");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof ArticleFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/articles">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white font-serif">
              {article ? "Modifier l'article" : "Nouvel article"}
            </h1>
            <p className="text-sm text-[#64748b]">
              {article ? `Modifié le ${new Date().toLocaleDateString("fr-FR")}` : "Créez un nouvel article"}
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            loading={saving}
          >
            <Save className="h-4 w-4 mr-1" />
            Brouillon
          </Button>
          <Button onClick={() => handleSubmit("published")} loading={saving}>
            <Eye className="h-4 w-4 mr-1" />
            Publier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titre */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6">
            <Input
              label="Titre de l'article *"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ex: La politique fiscale du Bénin en 2026..."
              className="text-lg"
            />
          </div>

          {/* Contenu */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6">
            <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-3">
              Contenu *
            </label>
            <RichTextEditor
              content={form.content}
              onChange={(content) => update("content", content)}
            />
          </div>

          {/* Résumé */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6">
            <Textarea
              label="Résumé (extrait)"
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Résumé court affiché dans les listes d'articles..."
              rows={3}
            />
            <p className="text-xs text-[#94a3b8] mt-1">
              {form.excerpt.length}/300 caractères · Généré automatiquement si vide
            </p>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Paramètres */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6 space-y-5">
            <h3 className="font-semibold text-[#0f172a] dark:text-white">Paramètres</h3>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Catégorie *
              </label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v as ArticleCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slug */}
            <div>
              <Input
                label="Slug (URL)"
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  update("slug", e.target.value);
                }}
                placeholder="mon-article-de-politique"
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                /article/<span className="font-mono">{form.slug || "..."}</span>
              </p>
            </div>

            {/* Alt image */}
            <Input
              label="Texte alternatif image"
              value={form.imageAlt}
              onChange={(e) => update("imageAlt", e.target.value)}
              placeholder="Description de l'image..."
            />
          </div>

          {/* Image principale */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-6">
            <h3 className="font-semibold text-[#0f172a] dark:text-white mb-4">
              Image principale
            </h3>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => update("imageUrl", url)}
              slug={form.slug}
            />
          </div>

          {/* Actions mobile */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => handleSubmit("draft")}
              loading={saving}
            >
              <Save className="h-4 w-4 mr-1" />
              Brouillon
            </Button>
            <Button className="w-full sm:flex-1" onClick={() => handleSubmit("published")} loading={saving}>
              <Eye className="h-4 w-4 mr-1" />
              Publier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

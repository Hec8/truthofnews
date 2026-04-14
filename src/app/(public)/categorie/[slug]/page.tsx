import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getArticlesByCategory, getPopularArticles, getRecentArticles } from "@/services/articleService";
import { getCategoryById, type ArticleCategory } from "@/types";
import ArticleCard from "@/components/common/ArticleCard";
import Sidebar from "@/components/layout/Sidebar";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryById(slug);
  if (!category) return { title: "Catégorie non trouvée" };
  return {
    title: `${category.label} – Truth of News`,
    description: `Toutes les actualités de la rubrique ${category.label} au Bénin.`,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  if (slug === "securite") {
    redirect("/categorie/societe");
  }

  const category = getCategoryById(slug);

  if (!category) notFound();

  const [{ articles }, popularArticles, recentArticles] = await Promise.all([
    getArticlesByCategory(slug as ArticleCategory),
    getPopularArticles(5),
    getRecentArticles(5),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#94a3b8] mb-8">
        <Link href="/" className="hover:text-[#1a3a6b] dark:hover:text-[#6090fa] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <span className="text-[#64748b]">{category.label}</span>
      </nav>

      {/* En-tête catégorie */}
      <div
        className="rounded-2xl p-8 mb-10 text-white"
        style={{ backgroundColor: category.color }}
      >
        <p className="text-white/70 text-sm mb-1 uppercase tracking-wider font-medium">Rubrique</p>
        <h1 className="text-4xl font-bold font-serif mb-2">{category.label}</h1>
        <p className="text-white/80">
          {articles.length} article{articles.length > 1 ? "s" : ""} dans cette rubrique
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles */}
        <div className="lg:col-span-2">
          {articles.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155]">
              <p className="text-[#94a3b8] text-lg mb-4">
                Aucun article dans cette catégorie pour le moment.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[#1a3a6b] dark:text-[#6090fa] font-medium hover:gap-2 transition-all"
              >
                Retour à l&apos;accueil <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar popularArticles={popularArticles} recentArticles={recentArticles} />
      </div>
    </div>
  );
}

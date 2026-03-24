import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Article, CATEGORIES } from "@/types";
import { formatAuthorName, formatDate } from "@/lib/utils";

interface HeroSectionProps {
  featuredArticle: Article | null;
  sideArticles: Article[];
}

export default function HeroSection({ featuredArticle, sideArticles }: HeroSectionProps) {
  if (!featuredArticle) {
    return (
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#2550eb] text-white py-20 px-4 rounded-2xl text-center mb-12">
        <h1 className="text-4xl font-bold font-serif mb-4">
          Truth of News – Actualités Politiques Bénin
        </h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">
          Votre source d&apos;information fiable sur la politique béninoise.
          Analyses, décryptages et reportages de terrain.
        </p>
      </section>
    );
  }

  const featuredCategory = CATEGORIES.find((c) => c.id === featuredArticle.category);

  return (
    <section className="mb-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article principal */}
        <Link
          href={`/article/${featuredArticle.slug}`}
          className="lg:col-span-2 group relative rounded-2xl overflow-hidden shadow-lg block"
        >
          <div className="relative h-[350px] sm:h-[420px]">
            {featuredArticle.imageUrl ? (
              <Image
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                fill
                className="object-cover lg:object-contain group-hover:scale-105 transition-transform duration-700 bg-[#0f172a]"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a3a6b] to-[#3b6ef6]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              {featuredCategory && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: featuredCategory.color }}
                >
                  {featuredCategory.label}
                </span>
              )}
              <span className="flex items-center gap-1 bg-[#c8a217] text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                <TrendingUp className="h-3 w-3" />
                À la une
              </span>
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold font-serif leading-tight mb-3 group-hover:text-[#93b4fd] transition-colors">
              {featuredArticle.title}
            </h1>
            <p className="text-white/75 text-sm sm:text-base line-clamp-2 mb-4">
              {featuredArticle.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-white/60 text-xs">
                Par <span className="text-white/80 font-medium">{formatAuthorName(featuredArticle.authorName)}</span>
                {" · "}
                {formatDate(featuredArticle.publishedAt as Date || featuredArticle.createdAt as Date)}
              </div>
              <span className="text-white text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Lire <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>

        {/* Articles secondaires */}
        <div className="flex flex-col gap-4">
          {sideArticles.slice(0, 3).map((article) => {
            const cat = CATEGORIES.find((c) => c.id === article.category);
            return (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group flex gap-4 bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2e8f0] dark:border-[#334155] p-4 hover:shadow-md hover:border-[#bfd3fe] dark:hover:border-[#3b6ef6] transition-all"
              >
                {article.imageUrl && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  {cat && (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-1.5"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.label}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-[#1e293b] dark:text-[#f8fafc] line-clamp-2 leading-snug group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors font-serif">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1.5">
                    {formatDate(article.publishedAt as Date || article.createdAt as Date)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

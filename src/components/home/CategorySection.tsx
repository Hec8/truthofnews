import Link from "next/link";
import { CATEGORIES } from "@/types";

export default function CategorySection() {
  const icons: Record<string, string> = {
    politique: "🏛️",
    gouvernement: "⚖️",
    elections: "🗳️",
    economie: "📈",
    societe: "👥",
    international: "🌍",
    sports: "⚽",
    culture: "🎭",
  };

  return (
    <section className="mb-12 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-[#c8a217] rounded-full" />
        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white font-serif">
          Rubriques
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorie/${cat.id}`}
            className="group flex flex-col items-center gap-2 p-5 rounded-xl border border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{
              borderBottomColor: cat.color,
              borderBottomWidth: "3px",
            }}
          >
            <span className="text-3xl">{icons[cat.id]}</span>
            <span className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db] group-hover:text-[#1a3a6b] dark:group-hover:text-[#6090fa] transition-colors text-center">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

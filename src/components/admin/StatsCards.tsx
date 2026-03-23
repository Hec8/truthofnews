import { FileText, CheckCircle, FileEdit, MessageCircle, Eye } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Articles",
      value: stats.totalArticles,
      icon: FileText,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Publiés",
      value: stats.publishedArticles,
      icon: CheckCircle,
      color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      label: "Brouillons",
      value: stats.draftArticles,
      icon: FileEdit,
      color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      label: "Commentaires",
      value: stats.totalComments,
      icon: MessageCircle,
      color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      label: "Vues totales",
      value: stats.totalViews.toLocaleString("fr-FR"),
      icon: Eye,
      color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-white dark:bg-[#1e293b] rounded-xl border ${card.borderColor} p-5 flex flex-col gap-3`}
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0f172a] dark:text-white font-serif">
                {card.value}
              </p>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

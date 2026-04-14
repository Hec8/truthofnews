"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LogOut,
  Home,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/services/authService";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/articles/nouveau", label: "Nouvel article", icon: PlusCircle },
];

interface AdminSidebarProps {
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
  userName?: string | null;
}

function AdminSidebar({ pathname, onClose, onLogout, userName }: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#334155]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#3b6ef6] flex items-center justify-center text-white font-bold font-serif">
            T
          </div>
          <div>
            <span className="text-white font-bold font-serif text-sm">Truth of News</span>
            <span className="block text-[#94a3b8] text-[10px]">Administration</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-[#3b6ef6] text-white shadow-sm"
                  : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#334155] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          Voir le blog
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
        <div className="px-4 py-2">
          <p className="text-xs text-[#64748b]">Connecté en tant que</p>
          <p className="text-sm font-medium text-[#f8fafc] truncate">{userName}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a3a6b] flex items-center justify-center text-white font-bold text-xl font-serif animate-pulse">
            T
          </div>
          <p className="text-[#64748b] text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Déconnexion réussie");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#0f172a]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0f172a] border-r border-[#334155] fixed inset-y-0 left-0 z-40">
        <AdminSidebar
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          userName={user?.displayName}
        />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative h-full w-[85%] max-w-xs bg-[#0f172a] shadow-2xl">
            <AdminSidebar
              pathname={pathname}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              userName={user?.displayName}
            />
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-64">
        {/* Topbar mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-[#1e293b] border-b border-[#e2e8f0] dark:border-[#334155] px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#64748b] hover:bg-[#f8fafc] dark:hover:bg-[#334155]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-[#1a3a6b] dark:text-white font-serif">
            Administration
          </span>
          <div className="w-9 h-9 rounded-full bg-[#1a3a6b] flex items-center justify-center text-white text-sm font-bold">
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

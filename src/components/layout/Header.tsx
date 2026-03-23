"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import { Menu, X, Search, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import toast from "react-hot-toast";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Déconnexion réussie");
      setDropdownOpen(false);
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/categorie/politique", label: "Politique" },
    { href: "/categorie/elections", label: "Élections" },
    { href: "/categorie/economie", label: "Économie" },
    { href: "/categorie/societe", label: "Société" },
    { href: "/categorie/international", label: "International" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md shadow-md"
          : "bg-white dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#334155]"
      )}
    >
      {/* Bande couleurs Bénin */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#008751]" />
        <div className="flex-1 bg-[#fcd116]" />
        <div className="flex-1 bg-[#e8112d]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-16 w-44 ">
              <Image
                src="/Logo2.jpg.jpeg"
                alt="Logo tn"
                fill
                className="object-contain object-left"
              />
            </div>
            <div>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#eff4ff] text-[#1a3a6b] dark:bg-[#1e293b] dark:text-[#6090fa]"
                    : "text-[#374151] dark:text-[#d1d5db] hover:text-[#1a3a6b] hover:bg-[#f8fafc] dark:hover:text-white dark:hover:bg-[#1e293b]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            <Link
              href="/recherche"
              className="p-2 rounded-md text-[#64748b] hover:text-[#1a3a6b] hover:bg-[#f8fafc] dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-[#1e293b] transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>

            <button
              onClick={() => setTheme((resolvedTheme ?? "light") === "dark" ? "light" : "dark")}
              className="p-2 rounded-md text-[#64748b] hover:text-[#1a3a6b] hover:bg-[#f8fafc] dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-[#1e293b] transition-colors"
              aria-label="Changer le thème"
              type="button"
            >
              <Sun className="hidden h-5 w-5 dark:block" />
              <Moon className="block h-5 w-5 dark:hidden" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#374151] dark:text-[#d1d5db] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1a3a6b] flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline">{user.displayName}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#e2e8f0] bg-white dark:bg-[#1e293b] dark:border-[#334155] shadow-lg py-1 z-50 animate-fade-in">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#374151] dark:text-[#d1d5db] hover:bg-[#f8fafc] dark:hover:bg-[#334155] transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </div>
            )}

            {/* Menu burger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-md text-[#64748b] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[#e2e8f0] dark:border-[#334155] py-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-[#eff4ff] text-[#1a3a6b] dark:bg-[#1e293b]"
                      : "text-[#374151] dark:text-[#d1d5db] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
                  <Button asChild variant="outline" size="sm" className="w-full flex-1">
                    <Link href="/login">Se connecter</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full flex-1">
                    <Link href="/register">S&apos;inscrire</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

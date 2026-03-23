import Link from "next/link";
import { Facebook, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import Image from 'next/image';
import { CATEGORIES } from "@/types";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white mt-16">
      {/* Bande couleurs Bénin */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#008751]" />
        <div className="flex-1 bg-[#fcd116]" />
        <div className="flex-1 bg-[#e8112d]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative h-16 w-44">
                            <Image 
                                src="/Logo2.jpg.jpeg"
                                alt="Logo tn"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
            </Link>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">
              Votre source d&apos;information fiable sur l&apos;actualité politique du Bénin.
              Analyses, décryptages et informations de terrain.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center hover:bg-[#3b6ef6] transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center hover:bg-[#1da1f2] transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center hover:bg-[#ff0000] transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Catégories
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categorie/${cat.id}`}
                    className="text-[#94a3b8] text-sm hover:text-white transition-colors hover:pl-1 block"
                  >
                    → {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Liens utiles
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/recherche", label: "Recherche" },
                { href: "/login", label: "Connexion" },
                { href: "/register", label: "Inscription" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#94a3b8] text-sm hover:text-white transition-colors hover:pl-1 block"
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[#94a3b8] text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#c8a217]" />
                <span>Cotonou, République du Bénin</span>
              </li>
              <li className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <Mail className="h-4 w-4 shrink-0 text-[#c8a217]" />
                <a href="#" className="hover:text-white transition-colors">
                  
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#94a3b8] text-sm">
                <Phone className="h-4 w-4 shrink-0 text-[#c8a217]" />
                <span>+229 96 12 97 48</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#64748b] text-sm text-center">
            © {currentYear} Truth of News. Tous droits réservés.
          </p>
          <p className="text-[#64748b] text-xs text-center">
            Actualités du Bénin
          </p>
        </div>
      </div>
    </footer>
  );
}

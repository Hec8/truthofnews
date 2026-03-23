import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-[#e2e8f0] dark:text-[#334155] font-serif mb-4 select-none">
          404
        </div>
        <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white font-serif mb-3">
          Page introuvable
        </h1>
        <p className="text-[#64748b] dark:text-[#94a3b8] mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

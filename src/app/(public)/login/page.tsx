"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { loginUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "L'email est obligatoire";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Le mot de passe est obligatoire";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      toast.success("Connexion réussie !");
      router.push(redirect);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Email ou mot de passe incorrect");
      } else {
        toast.error("Erreur de connexion. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative h-16 w-44 ">
            <Image
              src="/Logo2.jpg.jpeg"
              alt="Logo tn"
              fill
              className="object-contain object-left"
            />
          </div>
        </Link>

        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-[#e2e8f0] dark:border-[#334155] shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white font-serif mb-1">
              Connexion
            </h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] text-sm">
              Accédez à votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setErrors({ ...errors, email: "" });
              }}
              placeholder="votre@email.com"
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setErrors({ ...errors, password: "" });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 h-10 rounded-lg border ${errors.password ? "border-red-500" : "border-[#e2e8f0] dark:border-[#334155]"} bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#94a3b8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] dark:focus:ring-[#3b6ef6] focus:border-transparent transition-colors`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full h-11">
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-medium text-[#1a3a6b] dark:text-[#6090fa] hover:underline"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#94a3b8] mt-6">
          <Link href="/" className="hover:text-[#1a3a6b] dark:hover:text-[#6090fa]">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

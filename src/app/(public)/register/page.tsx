"use client";

import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from "lucide-react";
import { registerUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.displayName.trim()) e.displayName = "Le nom est obligatoire";
    if (!form.email) e.email = "L'email est obligatoire";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Le mot de passe est obligatoire";
    else if (form.password.length < 6) e.password = "Minimum 6 caractères";
    if (form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
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
      await registerUser(form.email, form.password, form.displayName.trim());
      toast.success("Compte créé avec succès ! Bienvenue !");
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error("Erreur lors de la création du compte");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
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
              Créer un compte
            </h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] text-sm">
              Rejoignez la communauté pour commenter
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nom complet"
              type="text"
              value={form.displayName}
              onChange={(e) => {
                setForm({ ...form, displayName: e.target.value });
                setErrors({ ...errors, displayName: "" });
              }}
              placeholder="Jean Kossou"
              error={errors.displayName}
              icon={<User className="h-4 w-4" />}
              autoComplete="name"
            />

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
                  placeholder="Minimum 6 caractères"
                  className={`w-full pl-10 pr-10 h-10 rounded-lg border ${errors.password ? "border-red-500" : "border-[#e2e8f0] dark:border-[#334155]"} bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#94a3b8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] dark:focus:ring-[#3b6ef6] focus:border-transparent transition-colors`}
                  autoComplete="new-password"
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

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => {
                    setForm({ ...form, confirm: e.target.value });
                    setErrors({ ...errors, confirm: "" });
                  }}
                  placeholder="Répétez le mot de passe"
                  className={`w-full pl-10 h-10 rounded-lg border ${errors.confirm ? "border-red-500" : "border-[#e2e8f0] dark:border-[#334155]"} bg-white dark:bg-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#94a3b8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] dark:focus:ring-[#3b6ef6] focus:border-transparent transition-colors`}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full h-11">
              <UserPlus className="h-4 w-4 mr-2" />
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-medium text-[#1a3a6b] dark:text-[#6090fa] hover:underline"
              >
                Se connecter
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

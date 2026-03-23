import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Truth of News – Actualités Politiques Bénin",
    template: "%s | Truth of News",
  },
  description:
    "Votre source d'information fiable sur l'actualité politique du Bénin. Analyses, décryptages et reportages de terrain.",
  keywords: ["Bénin", "politique", "actualités", "Cotonou", "élections", "gouvernement"],
  authors: [{ name: "Truth of News" }],
  creator: "Truth of News",
  metadataBase: new URL("https://blogtonton.bj"),
  openGraph: {
    type: "website",
    locale: "fr_BJ",
    url: "https://blogtonton.bj",
    siteName: "Truth of News",
    title: "Truth of News – Actualités Politiques Bénin",
    description: "Votre source d'information fiable sur l'actualité politique du Bénin.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Truth of News" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Truth of News – Actualités Politiques Bénin",
    description: "Actualités politiques du Bénin",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#1e293b",
                  color: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

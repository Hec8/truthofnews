import { MetadataRoute } from "next";

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://truthofnews.vercel.app").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
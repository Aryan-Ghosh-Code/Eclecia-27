import type { MetadataRoute } from "next";
import { ROUTES } from "@/constants/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
    : "";
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: baseUrl ? `${baseUrl}${route.path}` : route.path || "/",
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

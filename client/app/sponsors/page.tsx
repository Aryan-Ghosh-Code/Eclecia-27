import type { Metadata } from "next";
import { SponsorsView } from "@/components/sponsors/SponsorsView";
import { getBreadcrumbJsonLd, ROUTES } from "@/constants/seo";

const route = ROUTES.find((r) => r.path === "/sponsors")!;

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: {
    canonical: "/sponsors",
  },
  openGraph: {
    title: route.title,
    description: route.description,
    url: "/sponsors",
    type: "website",
  },
};

export default function SponsorsPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    "/sponsors",
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SponsorsView />
    </>
  );
}

import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";
import { getBreadcrumbJsonLd, ROUTES } from "@/constants/seo";

const route = ROUTES.find((r) => r.path === "/team")!;

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: {
    canonical: "/team",
  },
  openGraph: {
    title: route.title,
    description: route.description,
    url: "/team",
    type: "website",
  },
};

export default function TeamPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    "/team",
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ComingSoon
        eyebrow="The Team"
        note="Meet the passionate organizers, leads, and student committee behind Eclecia'27."
      />
    </>
  );
}

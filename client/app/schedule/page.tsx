import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";
import { getBreadcrumbJsonLd, ROUTES } from "@/constants/seo";

const route = ROUTES.find((r) => r.path === "/schedule")!;

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: {
    canonical: "/schedule",
  },
  openGraph: {
    title: route.title,
    description: route.description,
    url: "/schedule",
    type: "website",
  },
};

export default function SchedulePage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    "/schedule",
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ComingSoon
        eyebrow="Schedule"
        note="Day-wise event timings, performance slots and stage schedules are coming soon."
      />
    </>
  );
}

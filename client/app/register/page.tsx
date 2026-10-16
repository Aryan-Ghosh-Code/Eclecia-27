import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";
import { getBreadcrumbJsonLd, ROUTES } from "@/constants/seo";

const route = ROUTES.find((r) => r.path === "/register")!;

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: route.title,
    description: route.description,
    url: "/register",
    type: "website",
  },
};

export default function RegisterPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    "/register",
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ComingSoon
        eyebrow="Registrations"
        note="Registrations open soon. Follow @eclecia_hitk for the announcement."
      />
    </>
  );
}

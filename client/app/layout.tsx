import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { ASSETS } from "@/constants/assets";
import { SEO_KEYWORDS, getStructuredData, getBreadcrumbJsonLd } from "@/constants/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const nasyhama = localFont({
  src: "../public/fonts/Nasyhama.woff2",
  variable: "--font-nasyhama",
  display: "swap",
});

const taiganja = localFont({
  src: "../public/fonts/Taiganja.woff2",
  variable: "--font-taiganja",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : null,
  title: {
    default:
      "Eclecia'27: The Annual Cultural Fest of Heritage Institute of Technology | 15-17 January 2027",
    template: "%s",
  },
  description:
    "Welcome to Eclecia'27: The Annual Cultural Fest of Heritage Institute of Technology, Kolkata. 15-17 January 2027. Music, Dance, Drama, Art, Fashion and Literary events across 40+ colleges. Uniting talent, igniting culture.",
  keywords: SEO_KEYWORDS,
  authors: [{ name: "Heritage Institute of Technology, Kolkata" }],
  creator: "Eclecia Tech Team",
  publisher: "Heritage Institute of Technology, Kolkata",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/icons/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/icons/android-chrome-512x512.png",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Eclecia'27: The Annual Cultural Fest of Heritage Institute of Technology | 15-17 January 2027",
    description:
      "Welcome to Eclecia'27: The Annual Cultural Fest of Heritage Institute of Technology, Kolkata. 15-17 January 2027. Music, Dance, Drama, Art, Fashion and Literary events across 40+ colleges. Uniting talent, igniting culture.",
    url: "/",
    siteName: "Eclecia'27",
    images: [
      {
        url: ASSETS.cloudinary.ogImage,
        width: 1200,
        height: 630,
        alt: "Eclecia'27 - Heritage Institute of Technology, Kolkata | 15-17 January 2027",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Eclecia'27: The Annual Cultural Fest of Heritage Institute of Technology | 15-17 January 2027",
    description:
      "The annual cultural fest of Heritage Institute of Technology, Kolkata. 15-17 January 2027.",
    images: [ASSETS.cloudinary.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { eventJsonLd, websiteJsonLd, organizationJsonLd } = getStructuredData(
    process.env.NEXT_PUBLIC_SITE_URL,
  );
  const breadcrumbJsonLd = getBreadcrumbJsonLd(
    "/",
    process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${nasyhama.variable} ${taiganja.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />

        {/* Hero layers first: they are the LCP; everything else streams behind them. */}
        <link
          rel="preload"
          as="image"
          href={ASSETS.cloudinary.bg}
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href={ASSETS.cloudinary.mainart}
          fetchPriority="high"
        />
        <link rel="preload" as="image" href={ASSETS.cloudinary.suncover} />
        <link rel="preload" as="image" href={ASSETS.cloudinary.blacksun2} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

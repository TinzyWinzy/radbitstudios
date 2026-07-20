import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { getLocale } from 'next-intl/server';
import { organizationSchema, websiteSchema, localBusinessSchema, faqPageSchema, FAQ_DATA } from "@/lib/seo";
import { aggregateRatingSchema } from "@/data/testimonials";
import { CookieBanner } from "@/components/cookie-banner";
import { GA4Script } from "@/components/analytics/ga4";
import { DeviceProvider } from "@/contexts/device-context";
import { PwaLifecycle } from "@/components/pwa-lifecycle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Radbit Studios | Systems & AI for African Business",
    template: "%s | Radbit Studios",
  },
  description:
    "Systems architecture, AI integration, and compliance systems for African businesses. Cloud infrastructure, automation workflows, and software systems that work.",
  keywords: [
    "systems architecture Zimbabwe", "AI integration Zimbabwe",
    "cloud infrastructure Zimbabwe", "Radbit Studios",
    "software development Zimbabwe", "compliance automation",
    "Zimbabwe tech studio", "RAG pipelines Zimbabwe",
    "tender intelligence Zimbabwe", "ZIMRA compliance",
  ],
  other: {
    'norton-safeweb': 'not applicable',
  },
  openGraph: {
    title: "Radbit Studios | Systems & AI for African Business",
    description: "Systems architecture, AI integration, and compliance systems for African businesses.",
    url: SITE_URL,
    siteName: "Radbit Studios",
    locale: "en_ZW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit Studios | Systems & AI for African Business",
    description: "Systems architecture, AI integration, and compliance systems for African businesses.",
    site: "@radbitzw",
    creator: "@radbitzw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'XuoZg3JKm--RR2ak1v3OosORY7Gz0f_xJxxPAViBNfE',
  },
  applicationName: "Radbit Studios",
  category: "business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Radbit",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A8A7A',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="alternate" type="application/rss+xml" title="Radbit Blog RSS Feed" href="/blog/feed.xml" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <GA4Script />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8600120936743760"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(FAQ_DATA)) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema()) }} />
      </head>
      <body className={`${inter.variable} ${syne.variable} font-body antialiased`}>
        <DeviceProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to main content
        </a>
        {children}
        <CookieBanner />
        </DeviceProvider>
        <PwaLifecycle />
      </body>
    </html>
  );
}

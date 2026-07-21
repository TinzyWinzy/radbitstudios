import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { getLocale } from 'next-intl/server';
import { organizationSchema, websiteSchema, localBusinessSchema } from "@/lib/seo";
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
    default: "Radbit Studios | Software & AI Systems for Zimbabwean Business",
    template: "%s | Radbit Studios Zimbabwe",
  },
  description:
    "Zimbabwean software development and AI systems company. Custom business software, compliance automation, tender intelligence and AI workflows for Zimbabwean SMEs and enterprises.",
  keywords: [
    "software development Zimbabwe", "AI integration Zimbabwe",
    "Radbit Studios", "Radbit Zimbabwe",
    "Zimbabwe tech company", "business automation Zimbabwe",
    "custom software Zimbabwe", "ZIMRA compliance system",
    "tender intelligence Zimbabwe", "PRAZ compliance Zimbabwe",
    "Zimbabwe SME software", "business systems Zimbabwe",
    "compliance automation Zimbabwe", "Harare software company",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en-ZW': SITE_URL,
    },
  },
  other: {
    'norton-safeweb': 'not applicable',
    'google': 'notranslate',
  },
  openGraph: {
    title: "Radbit Studios | Software & AI Systems for Zimbabwean Business",
    description: "Zimbabwean software development and AI systems company. Custom business software, compliance automation, and AI workflows.",
    url: SITE_URL,
    siteName: "Radbit Studios",
    locale: "en_ZW",
    type: "website",
    countryName: "Zimbabwe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit Studios | Software & AI Systems for Zimbabwean Business",
    description: "Zimbabwean software development and AI systems company. Custom business software, compliance automation, and AI workflows.",
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
    other: { 'msvalidate.01': 'C20E454F7F62316E2798EEA1FAEDF700' },
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

import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { getLocale } from 'next-intl/server';
import { organizationSchema, websiteSchema, faqPageSchema, FAQ_DATA } from "@/lib/seo";
import { CookieBanner } from "@/components/cookie-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

export const metadata: Metadata = {
  title: {
    default: "Radbit SME Hub — AI Tools, Assessments & Tender Intelligence for Zimbabwean Enterprises",
    template: "%s | Radbit SME Hub",
  },
  description:
    "AI-powered business platform for Zimbabwean SMEs. Digital Readiness Assessment, AI toolkit, tender matching, community forum, and WhatsApp notifications. Free to start.",
  keywords: [
    "Zimbabwe SME", "small business Zimbabwe", "digital readiness assessment",
    "AI business tools Zimbabwe", "tender matching Zimbabwe", "ZIMGS tenders",
    "SADC export guide", "EcoCash business", "PACRA registration Zimbabwe",
    "ZIMRA tax guide SMEs", "VAT calculator Zimbabwe", "business plan generator",
    "SME community Zimbabwe", "AI mentor Zimbabwe", "radbit SME hub",
  ],
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      sn: '/sn',
      nd: '/nd',
      pt: '/pt',
    },
  },
  openGraph: {
    title: "Radbit SME Hub — Build. Scale. Own Your Future.",
    description: "AI tools, assessments, community & tender intelligence for Zimbabwean entrepreneurs. Free to start.",
    url: SITE_URL,
    siteName: "Radbit SME Hub",
    locale: "en_ZW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radbit SME Hub — Build. Scale. Own Your Future.",
    description: "AI tools, assessments, community & tender intelligence for Zimbabwean entrepreneurs.",
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
    google: 'GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN',
  },
  applicationName: "Radbit SME Hub",
  category: "business",
};

export const viewport: Viewport = {
  themeColor: '#B8860B',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" title="Radbit SME Hub Blog RSS Feed" href="/blog/feed.xml" />
        {/*
          FAQPage JSON-LD — homepage gets rich "People also ask" AI-overview box
          WebSite schema  — Google Site Search rich result
          Organization   — knowledge-panel / rich-cards coverage
        */}
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(FAQ_DATA)) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
      </head>
      <body className={`${inter.variable} ${syne.variable} font-body antialiased`}>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8600120936743760"
          crossOrigin="anonymous"
        />
        {children}
        <CookieBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

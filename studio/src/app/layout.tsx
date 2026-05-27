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
    "PRAZ compliance Zimbabwe", "tender starter Zimbabwe", "government tenders Zimbabwe",
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
  other: {
    'norton-safeweb': 'not applicable',
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
    google: 'XuoZg3JKm--RR2ak1v3OosORY7Gz0f_xJxxPAViBNfE',
  },
  applicationName: "Radbit SME Hub",
  category: "business",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C2410C',
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
        <link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" title="Radbit SME Hub Blog RSS Feed" href="/blog/feed.xml" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(FAQ_DATA)) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
        <script type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
      </head>
      <body className={`${inter.variable} ${syne.variable} font-body antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to main content
        </a>
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

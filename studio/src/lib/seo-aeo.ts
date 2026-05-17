/* ── AEO : Answer Engine Optimization ─────────────────────────────────
 *  Generates structured data types that answer engines
 *  (Google AI Overview, Bing Chat, Perplexity, etc.) prefer:
 *  1. QAPage   — "Q&A" page for a single topic
 *  2. AnswerBlock — inline answered-question element
 *  3. DefinedTerm — glossary / definition pages
 *  4. TakeAction  — explicit "how to do X" action steps
 * ─────────────────────────────────────────────────────────────────── */

import type { Metadata } from "next";

/* ── QAPage schema ─────────────────────────────────────────────────── */
export function qaPageSchema(params: {
  headline: string;
  url: string;
  questions: { question: string; answer: string; authorName?: string; datePublished?: string }[];
}) {
  const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw').replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    name: params.headline,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    mainEntity: params.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      dateCreated: q.datePublished,
      author: q.authorName ? { '@type': 'Person', name: q.authorName } : undefined,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
        author: q.authorName ? { '@type': 'Person', name: q.authorName } : undefined,
      },
    })),
  };
}

/* ── TakeAction schema ──────────────────────────────────────────────── */
export function takeActionSchema(params: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
}) {
  const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw').replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    step: params.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
  };
}

/* ── DefinedTerm schema (glossary / topic pages) ───────────────────── */
export function definedTermSchema(params: {
  term: string;
  definition: string;
  url: string;
}) {
  const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw').replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: params.term,
    definition: params.definition,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    inLanguage: 'en',
  };
}

/* ── AEO page helper: returns AEO-focused Metadata for a guide / FAQ ── */
export function aeoPageMetadata(params: {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
}): Metadata {
  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords,
    alternates: { canonical: params.canonicalPath },
    openGraph: {
      title: params.title,
      description: params.description,
      type: 'article',
      url: params.canonicalPath.startsWith('http')
        ? params.canonicalPath
        : `${process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw'}${params.canonicalPath}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
  };
}

/* ── Breadcrumb metadata helper ─────────────────────────────────────── */
export function breadcrumbMetadata(items: { name: string; url: string }[]) {
  const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitsmehub.co.zw').replace(/\/$/, '');
  return items.map((item) => ({
    type: 'website' as const,
    url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    title: item.name,
  }));
}

/* ── SEO structured data generators ──────────────────────────────────
   All schemas use process.env.FRONTEND_URL so they stay correct
   across staging / production without hard-coded domains.
   ───────────────────────────────────────────────────────────────────

   BRAND NOTE: Radbit Studios is a B2B SaaS platform for Zimbabwean SMEs
   (AI tools, tender intelligence, assessments, PRAZ compliance).
   This is NOT related to "Bad Rabbit Studio" — an award-winning Zimbabwean
   film production company (documentaries, conservation storytelling, video).
   For AdWords / SEM: add negative keywords → documentary, film, video
   production, conservation, storytelling, wildlife, YouTube series. */

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

/* ──────────────────────────── Organization ──────────────────────────── */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Radbit SME Hub',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-192x192.png`,
    description: 'AI-powered business platform for Zimbabwean entrepreneurs — readiness assessment, AI tools, tender matching, and community.',
    foundingDate: '2025',
    areaServed: [
      { '@type': 'Country', name: 'Zimbabwe' },
      { '@type': 'Country', name: 'South Africa' },
      { '@type': 'Country', name: 'Botswana' },
      { '@type': 'Country', name: 'Zambia' },
      { '@type': 'Country', name: 'Mozambique' },
      { '@type': 'Country', name: 'Namibia' },
    ],
    knowsLanguage: ['en', 'sn', 'nd', 'pt'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@radbitstudios.co.zw',
    },
    sameAs: [
      'https://www.facebook.com/people/Radbit-Studios/61573716592102/',
      'https://x.com/radbitzw',
      'https://www.linkedin.com/company/radbit-studios/',
      'https://www.instagram.com/radbitstudios/',
      'https://wa.me/263786344899',
    ],
  };
}

/* ──────────────────────────── WebSite (search box) ─────────────────── */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Radbit SME Hub',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      queryInput: 'required name=search_term_string',
    },
    inLanguage: 'en',
  };
}

/* ──────────────────────────── FAQPage ───────────────────────────────── */
export function faqPageSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

/* ──────────────────────────── BreadcrumbList ────────────────────────── */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/* ──────────────────────────── Service (3 core offerings) ────────────── */
export function serviceSchema(overrides: {
  name: string;
  description: string;
  url: string;
  serviceOutput?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'Organization', name: 'Radbit SME Hub', url: SITE_URL },
    name: overrides.name,
    description: overrides.description,
    url: overrides.url,
    serviceOutput: overrides.serviceOutput,
    areaServed: { '@type': 'Country', name: 'Zimbabwe' },
  };
}

/* ──────────────────────────── HowTo (guides) ────────────────────────── */
export function howToSchema(params: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    step: params.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/* ──────────────────────────── Article (blog posts) ──────────────────── */
export function articleSchema(params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  authorName: string;
  publishedTime: string;
  modifiedTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    image: params.image,
    author: { '@type': 'Person', name: params.authorName },
    publisher: {
      '@type': 'Organization',
      name: 'Radbit SME Hub',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/icon-192x192.png` },
    },
    datePublished: params.publishedTime,
    dateModified: params.modifiedTime || params.publishedTime,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': params.url },
  };
}

/* ────────────────────────── Static FAQ dataset ──────────────────────── */
export const FAQ_DATA = [
  {
    question: 'What is Radbit SME Hub?',
    answer: 'Radbit SME Hub is a digital platform that helps Zimbabwean small and medium enterprises assess their digital readiness, apply for tenders, use AI-powered business tools, and connect with other entrepreneurs.',
  },
  {
    question: 'How much does Radbit SME Hub cost?',
    answer: 'Radbit SME Hub has a Free plan with basic features, a Growth plan at $5/month, and a Pro plan at $15/month. Upgrade or cancel anytime.',
  },
  {
    question: 'Do I need a credit card to sign up?',
    answer: 'No. The Free plan requires no credit card or bank card. You can sign up with just your phone number via Firebase Auth and explore the platform before choosing a paid plan.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'Zimbabwe: EcoCash and PayNow card payments. South Africa: PayFast. Global: Stripe card payments.',
  },
  {
    question: 'Is Radbit SME Hub available in my language?',
    answer: 'Currently available in English. Shona (chiShona), Ndebele (isiNdebele), and Portuguese support are in development.',
  },
  {
    question: 'How does the AI business assessment work?',
    answer: 'The assessment is a 15-minute radar-chart analysis of your digital maturity. Answer questions about your business operations, and Radbit gives you a scorecard highlighting your strengths, gaps, and a personalised growth roadmap.',
  },
  {
    question: 'Can I use the AI toolkit offline?',
    answer: 'The app installs as a PWA, so the interface loads offline. Your assessment answers are auto-saved to IndexedDB every 30 seconds and sync when you reconnect. AI-generated content requires an internet connection.',
  },
  {
    question: 'Where does tender data come from?',
    answer: 'Radbit curates tenders from government procurement portals (ZIMGS, PRAZ, PPRA) and private tender boards across Zimbabwe and the SADC region. AI filters for relevance based on your business profile.',
  },
];

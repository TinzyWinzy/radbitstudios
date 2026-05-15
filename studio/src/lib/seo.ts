// SEO structured data generators

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Radbit SME Hub',
    url: process.env.FRONTEND_URL || 'https://app.radbitsmehub.co.zw',
    description: 'Digital platform empowering Zimbabwean SMEs with AI tools, assessments, and community.',
    foundingDate: '2025',
    areaServed: ['ZW', 'ZA', 'ZM', 'BW', 'MZ', 'NA'],
    knowsLanguage: ['en', 'sn', 'nd', 'pt'],
    offers: {
      '@type': 'AggregateOffer',
      offerCount: '3',
      lowPrice: '0',
      highPrice: '15',
      priceCurrency: 'USD',
    },
  };
}

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

export const FAQ_DATA = [
  { question: 'What is Radbit SME Hub?', answer: 'Radbit SME Hub is a digital platform that helps Zimbabwean small businesses assess their digital readiness, apply for tenders, use AI tools, and connect with other entrepreneurs.' },
  { question: 'How much does it cost?', answer: 'Radbit SME Hub offers a Free plan with basic features, a Growth plan at $5/month, and a Pro plan at $15/month. You can upgrade or cancel anytime.' },
  { question: 'Do I need a bank card to sign up?', answer: 'No. The Free plan requires no payment. You can sign up with just your phone number and explore the platform before choosing a paid plan.' },
  { question: 'What payment methods are accepted?', answer: 'We accept EcoCash, OneMoney, bank transfers (ZIPIT/RTGS), and international cards via Stripe. South African users can pay via PayFast.' },
  { question: 'Is Radbit SME Hub available in my language?', answer: 'Currently available in English, with Shona, Ndebele, and Portuguese support in development.' },
];

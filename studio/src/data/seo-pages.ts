/* ── Programmatic SEO Data ─────────────────────────────────────────────
   Each entry generates a static landing page targeting high-value keywords.
   Pages are generated at build time via generateStaticParams().
   ─────────────────────────────────────────────────────────────────── */

export interface IndustryPage {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  problems: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
  features: string[];
  cta: string;
  keywords: string[];
}

export interface UseCasePage {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  steps: { title: string; description: string }[];
  benefits: string[];
  cta: string;
  keywords: string[];
}

const SITE_URL = (process.env.FRONTEND_URL || 'https://radbitstudios.co.zw').replace(/\/$/, '');

/* ── Industry Pages ──────────────────────────────────────────────────── */
export const industries: IndustryPage[] = [
  {
    slug: 'retail-ecommerce',
    title: 'Retail & E-commerce Business Software Zimbabwe | Radbit',
    metaDescription: 'AI-powered POS, inventory management, and direct sales tools for Zimbabwean retailers and e-commerce businesses. Cut costs, automate stock, grow online.',
    h1: 'Retail & E-commerce Tools for Zimbabwean Businesses',
    intro: 'Running a retail shop or online store in Zimbabwe means dealing with currency swings, unreliable power, and customers who expect WhatsApp ordering. Radbit gives you the digital tools to compete — from POS to delivery tracking.',
    problems: [
      { title: 'Manual stock counting', description: 'Physical stock takes hours and errors cost thousands. Lost inventory means lost profit.' },
      { title: 'Currency confusion', description: 'Multi-currency pricing (USD, ZWL, Rand) creates headaches at checkout and in accounting.' },
      { title: 'No online presence', description: 'Customers search Google for products you sell, but find competitors instead.' },
      { title: 'Load-shedding downtime', description: 'Power cuts kill POS systems and you lose sales during peak hours.' },
    ],
    solutions: [
      { title: 'Digital Inventory Management', description: 'Track stock across locations with real-time alerts for low inventory. Barcode scanning via phone camera.' },
      { title: 'Multi-Currency POS', description: 'Accept USD, ZWL, EcoCash, OneMoney, and card payments. Auto-convert at live rates.' },
      { title: 'WhatsApp Store Integration', description: 'Catalog products on WhatsApp Business. Customers order via chat, you fulfill from inventory.' },
      { title: 'Offline-First Design', description: 'Radbit works offline and syncs when power returns. No lost sales during load-shedding.' },
    ],
    features: ['POS system', 'Inventory tracking', 'WhatsApp ordering', 'Multi-currency', 'Offline mode', 'Sales analytics'],
    cta: 'Start selling smarter — sign up free',
    keywords: ['retail POS Zimbabwe', 'ecommerce platform Zimbabwe', 'inventory management Zimbabwe', 'WhatsApp ordering Zimbabwe', 'retail software Zimbabwe'],
  },
  {
    slug: 'professional-services',
    title: 'Professional Services Business Software Zimbabwe | Radbit',
    metaDescription: 'Client management, invoicing, and project tracking for Zimbabwean accountants, lawyers, consultants, and agencies. Automate admin, win more clients.',
    h1: 'Professional Services Tools for Zimbabwean Firms',
    intro: 'Whether you run an accounting firm, law practice, or consulting agency in Zimbabwe, your time is money. Radbit automates the admin — invoicing, client tracking, compliance — so you can focus on billable work.',
    problems: [
      { title: 'Chasing payments', description: 'Clients delay invoices and you spend hours following up. Cash flow suffers.' },
      { title: 'Compliance overhead', description: 'ZIMRA filings, PRAZ renewals, and regulatory updates eat into productive hours.' },
      { title: 'No client portal', description: 'Clients call and WhatsApp for updates instead of self-serving.' },
      { title: 'Proposal writing', description: 'Crafting tenders and proposals manually takes days, not hours.' },
    ],
    solutions: [
      { title: 'Automated Invoicing', description: 'Generate professional invoices, send via WhatsApp/email, and track payment status. EcoCash and PayNow integration.' },
      { title: 'Compliance Calendar', description: 'Automated reminders for ZIMRA QPD, VAT, PRAZ renewals, and annual returns. Never miss a deadline.' },
      { title: 'Client Portal', description: 'Give clients a self-service portal for documents, invoices, and project status. Reduces admin calls by 60%.' },
      { title: 'AI Bid Writer', description: 'Generate tender proposals in minutes using your company profile and past performance data.' },
    ],
    features: ['Invoicing', 'Client portal', 'Compliance calendar', 'AI bid writer', 'Time tracking', 'Document management'],
    cta: 'Automate your practice — sign up free',
    keywords: ['accounting software Zimbabwe', 'law firm management Zimbabwe', 'consulting CRM Zimbabwe', 'invoicing software Zimbabwe', 'professional services tools'],
  },
  {
    slug: 'construction',
    title: 'Construction & Contracting Business Software Zimbabwe | Radbit',
    metaDescription: 'Tender tracking, project management, and compliance tools for Zimbabwean construction companies and contractors. Win more government contracts.',
    h1: 'Construction & Contracting Tools for Zimbabwe',
    intro: 'Zimbabwe\'s construction industry runs on tenders, compliance, and tight margins. Radbit helps you find tenders faster, stay PRAZ-compliant, and manage projects from a single dashboard.',
    problems: [
      { title: 'Missed tenders', description: 'Government and private tenders are published across dozens of portals. By the time you find them, the deadline has passed.' },
      { title: 'PRAZ compliance gaps', description: 'Lapsed registrations or missing documents disqualify you from bidding.' },
      { title: 'Subcontractor chaos', description: 'Tracking payments, deliveries, and quality across multiple sites is manual and error-prone.' },
      { title: 'Cash flow timing', description: 'Progress payments are delayed but suppliers need cash now.' },
    ],
    solutions: [
      { title: 'AI Tender Matching', description: 'Radbit scans ZIMGS, PRAZ, PPRA, and private boards daily. Get alerts for tenders matching your CIDB grade and specialization.' },
      { title: 'PRAZ Compliance Tracker', description: 'Track registration expiry dates, required documents, and renewal deadlines. Auto-reminders 30 days before.' },
      { title: 'Project Dashboard', description: 'Track milestones, budgets, and deliverables across all active sites. Photo documentation and progress reports.' },
      { title: 'Payment Scheduling', description: 'Map progress payment schedules to cash flow projections. Know when money arrives and when bills are due.' },
    ],
    features: ['Tender alerts', 'PRAZ tracker', 'Project dashboard', 'Subcontractor management', 'Payment scheduling', 'Document vault'],
    cta: 'Win more tenders — sign up free',
    keywords: ['construction management Zimbabwe', 'tender tracking Zimbabwe', 'PRAZ compliance', 'contractor software Zimbabwe', 'building company tools'],
  },
  {
    slug: 'healthcare',
    title: 'Healthcare & Clinic Management Software Zimbabwe | Radbit',
    metaDescription: 'Patient management, appointment scheduling, and billing tools for Zimbabwean clinics, pharmacies, and healthcare providers. HIPPO-compliant.',
    h1: 'Healthcare Management Tools for Zimbabwe',
    intro: 'Running a clinic or pharmacy in Zimbabwe means balancing patient care with regulatory compliance, stock management, and load-shedding. Radbit digitizes your operations so you can focus on patients.',
    problems: [
      { title: 'Paper patient records', description: 'Paper files get lost, damaged, or are impossible to search when a patient returns.' },
      { title: 'Medicine stock-outs', description: 'Running out of critical medications loses patients and revenue.' },
      { title: 'Appointment no-shows', description: 'Patients forget appointments and you lose productive hours.' },
      { title: 'Regulatory reporting', description: 'MOH reporting requirements add admin burden to already stretched staff.' },
    ],
    solutions: [
      { title: 'Digital Patient Records', description: 'Secure, searchable patient records accessible from any device. Offline mode for areas with poor connectivity.' },
      { title: 'Pharmacy Inventory', description: 'Track medication stock with expiry date alerts, auto-reorder points, and supplier management.' },
      { title: 'SMS/WhatsApp Reminders', description: 'Automated appointment reminders reduce no-shows by up to 40%.' },
      { title: 'MOH Reporting', description: 'Auto-generate monthly MOH reports from your patient and dispensing data.' },
    ],
    features: ['Patient records', 'Appointment booking', 'Pharmacy inventory', 'Billing', 'MOH reporting', 'SMS reminders'],
    cta: 'Digitize your practice — sign up free',
    keywords: ['clinic management software Zimbabwe', 'pharmacy management Zimbabwe', 'patient records system', 'healthcare ERP Zimbabwe', 'medical practice software'],
  },
  {
    slug: 'education',
    title: 'School & Education Management Software Zimbabwe | Radbit',
    metaDescription: 'Student management, fee tracking, and parent communication tools for Zimbabwean schools, colleges, and training centers. Automate admin, engage parents.',
    h1: 'Education Management Tools for Zimbabwe',
    intro: 'Zimbabwean schools juggle fee collection, exam records, parent communication, and MOE reporting — often on paper. Radbit digitizes school admin so teachers can teach.',
    problems: [
      { title: 'Fee collection delays', description: 'Tracking which students have paid and chasing arrears is manual and time-consuming.' },
      { title: 'Exam record management', description: 'Grade books, report cards, and transcripts are created manually each term.' },
      { title: 'Parent communication', description: 'Circulars get lost in school bags. Parents don\'t know about events until it\'s too late.' },
      { title: 'MOE reporting', description: 'Termly returns and statistical reports take days to compile from paper records.' },
    ],
    solutions: [
      { title: 'Fee Management', description: 'Track fees by student, send payment reminders via WhatsApp/SMS, and generate arrears reports. EcoCash and PayNow integration.' },
      { title: 'Digital Gradebook', description: 'Enter marks, calculate averages, generate report cards, and create transcripts — all in one place.' },
      { title: 'Parent Portal', description: 'Parents receive announcements, view grades, check fee balance, and book parent-teacher meetings via WhatsApp.' },
      { title: 'MOE Reporting', description: 'Auto-generate termly returns, enrollment statistics, and performance reports for the Ministry of Education.' },
    ],
    features: ['Fee tracking', 'Gradebook', 'Parent portal', 'Attendance', 'MOE reporting', 'Timetable'],
    cta: 'Modernize your school — sign up free',
    keywords: ['school management system Zimbabwe', 'education ERP', 'student information system', 'school fee tracking', 'parent communication platform'],
  },
  {
    slug: 'financial-services',
    title: 'Financial Services & Microfinance Software Zimbabwe | Radbit',
    metaDescription: 'Loan management, client onboarding, and compliance tools for Zimbabwean microfinance institutions, SACCOs, and financial service providers.',
    h1: 'Financial Services Tools for Zimbabwe',
    intro: 'Zimbabwe\'s financial services sector — from microfinance to SACCOs — needs robust digital tools to manage loans, compliance, and client relationships. Radbit provides enterprise-grade tools at SME prices.',
    problems: [
      { title: 'Loan tracking spreadsheets', description: 'Excel-based loan portfolios are error-prone and don\'t scale beyond 100 clients.' },
      { title: 'KYC compliance', description: 'FICA and RBZ compliance requirements add overhead to every new client onboarding.' },
      { title: 'Collections management', description: 'Tracking arrears and following up on late payments is manual and inconsistent.' },
      { title: 'Reporting burden', description: 'RBZ returns and audit preparation consume weeks of staff time each quarter.' },
    ],
    solutions: [
      { title: 'Loan Management System', description: 'Track loan applications, approvals, disbursements, and repayments. Automated interest calculations and penalty tracking.' },
      { title: 'Digital KYC', description: 'Onboard clients digitally with ID verification, address proof, and reference checks. FICA-compliant workflows.' },
      { title: 'Collections Automation', description: 'Automated payment reminders via SMS/WhatsApp. Escalation workflows for arrears. Legal notice templates.' },
      { title: 'RBZ Reporting', description: 'Auto-generate quarterly returns, portfolio quality reports, and compliance documentation for RBZ audits.' },
    ],
    features: ['Loan management', 'KYC onboarding', 'Collections', 'RBZ reporting', 'Client portal', 'Risk assessment'],
    cta: 'Scale your lending — sign up free',
    keywords: ['microfinance software Zimbabwe', 'SACCO management system', 'loan management Zimbabwe', 'financial services ERP', 'lending platform Zimbabwe'],
  },
];

/* ── Use Case Pages ──────────────────────────────────────────────────── */
export const useCases: UseCasePage[] = [
  {
    slug: 'tender-matching',
    title: 'AI Tender Matching for Zimbabwean Businesses | Radbit',
    metaDescription: 'Find government and private tenders automatically. AI scans ZIMGS, PRAZ, PPRA daily and alerts you to contracts matching your business profile.',
    h1: 'Never Miss a Tender Again — AI-Powered Tender Matching',
    intro: 'Zimbabwean businesses lose thousands of dollars in missed tenders every month. Radbit\'s AI scans all major procurement portals daily and sends you alerts for contracts that match your industry, location, and capacity.',
    steps: [
      { title: 'Create your business profile', description: 'Tell us your industry, CIDB grade, location, and capacity. Takes 5 minutes.' },
      { title: 'AI scans procurement portals', description: 'Radbit monitors ZIMGS, PRAZ, PPRA, CBZ, FBC, NMB, Econet, NetOne, and more — 19 sources daily.' },
      { title: 'Get matched tenders', description: 'Receive relevant tenders via email, WhatsApp, or in-app notifications. Filtered by your profile.' },
      { title: 'Apply with AI assistance', description: 'Use the AI Bid Writer to generate proposals in minutes, not days.' },
    ],
    benefits: ['Save 10+ hours per week on tender searches', 'Never miss a deadline with auto-reminders', 'Win more contracts with AI-assisted proposals', 'Stay PRAZ-compliant with automated tracking'],
    cta: 'Start finding tenders — sign up free',
    keywords: ['tender matching Zimbabwe', 'government tenders Zimbabwe', 'ZIMGS tenders', 'PRAZ tenders', 'procurement alerts Zimbabwe'],
  },
  {
    slug: 'business-assessment',
    title: 'Free Digital Readiness Assessment for Zimbabwean SMEs | Radbit',
    metaDescription: 'Assess your business\'s digital maturity in 15 minutes. Get a personalized roadmap for growth with AI-powered recommendations tailored to Zimbabwean SMEs.',
    h1: 'How Digitally Ready Is Your Business? Find Out in 15 Minutes',
    intro: 'Most Zimbabwean SMEs don\'t know where they stand digitally. Radbit\'s free assessment scores your business across 8 dimensions and gives you a clear roadmap for improvement.',
    steps: [
      { title: 'Answer 30 questions', description: 'Cover operations, marketing, finance, compliance, and technology. No jargon — plain business questions.' },
      { title: 'Get your digital maturity score', description: 'A radar chart showing your strengths and gaps across 8 business dimensions.' },
      { title: 'Receive your roadmap', description: 'AI-generated recommendations prioritized by impact and cost. What to do first, what can wait.' },
      { title: 'Track your progress', description: 'Re-assess quarterly and watch your score improve as you implement recommendations.' },
    ],
    benefits: ['Identify your biggest digital gaps', 'Get a prioritized action plan', 'Benchmark against industry peers', 'Track improvement over time'],
    cta: 'Take the free assessment',
    keywords: ['digital readiness assessment', 'business assessment Zimbabwe', 'SME digital maturity', 'digital transformation Zimbabwe', 'business scorecard'],
  },
  {
    slug: 'praz-compliance',
    title: 'PRAZ Compliance Guide for Zimbabwean Businesses | Radbit',
    metaDescription: 'Stay PRAZ-compliant with automated registration tracking, document management, and renewal reminders. Never miss a PRAZ deadline again.',
    h1: 'PRAZ Compliance Made Simple — Track, Renew, Comply',
    intro: 'PRAZ registration is mandatory for businesses bidding on government tenders in Zimbabwe. But tracking expiry dates, required documents, and renewal deadlines across multiple registrations is a nightmare. Radbit automates it all.',
    steps: [
      { title: 'Add your registrations', description: 'Enter your PRAZ, CIDB, MOH, EMA, and other regulatory registrations. Upload supporting documents.' },
      { title: 'Set renewal reminders', description: 'Radbit calculates expiry dates and sends reminders 60, 30, and 7 days before each renewal is due.' },
      { title: 'Track compliance status', description: 'See all your registrations at a glance — which are active, which need renewal, which are expired.' },
      { title: 'Generate compliance reports', description: 'One-click reports for tender applications showing all active registrations and certifications.' },
    ],
    benefits: ['Never miss a PRAZ renewal deadline', 'Reduce compliance admin by 80%', 'Generate compliance reports instantly', 'Track multiple registrations in one place'],
    cta: 'Stay compliant — sign up free',
    keywords: ['PRAZ compliance Zimbabwe', 'PRAZ registration', 'procurement compliance', 'government tender requirements', 'CIDB registration Zimbabwe'],
  },
  {
    slug: 'ai-business-tools',
    title: 'AI Business Tools for Zimbabwean Entrepreneurs | Radbit',
    metaDescription: 'AI-powered business plan generator, bid writer, tax copilot, and more. Built specifically for Zimbabwean business realities. Free to start.',
    h1: 'AI Tools Built for Zimbabwean Business Realities',
    intro: 'Generic AI tools don\'t understand Zimbabwe — our tax system, our payment methods, our regulatory environment. Radbit\'s AI tools are trained on Zimbabwean business data and built for local realities.',
    steps: [
      { title: 'AI Business Plan Generator', description: 'Generate a professional business plan tailored to Zimbabwean market conditions. Includes financial projections in USD/ZWL.' },
      { title: 'AI Bid Writer', description: 'Create tender proposals in minutes. Paste the tender requirements, and the AI drafts a response using your company profile.' },
      { title: 'AI Tax Copilot', description: 'Get answers to ZIMRA questions, calculate VAT, and understand your tax obligations in plain language.' },
      { title: 'AI Business Mentor', description: 'Ask any business question and get advice tailored to Zimbabwean SME realities — not generic Silicon Valley advice.' },
    ],
    benefits: ['Generate business plans in 10 minutes', 'Write tender proposals 5x faster', 'Understand your tax obligations clearly', 'Get Zimbabwe-specific business advice'],
    cta: 'Try AI tools free',
    keywords: ['AI business tools Zimbabwe', 'business plan generator', 'AI bid writer', 'ZIMRA tax AI', 'business mentor Zimbabwe'],
  },
];

/* ── Helper: generate full URL ────────────────────────────────────────── */
export function getPageUrl(type: 'industry' | 'use-case', slug: string): string {
  return `${SITE_URL}/${type === 'industry' ? 'solutions' : 'use-cases'}/${slug}`;
}

/* ── Schema generators ──────────────────────────────────────────────── */
export function industryServiceSchema(page: IndustryPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: { '@type': 'Organization', name: 'Radbit SME Hub', url: SITE_URL },
    name: page.h1,
    description: page.metaDescription,
    url: getPageUrl('industry', page.slug),
    areaServed: { '@type': 'Country', name: 'Zimbabwe' },
    serviceType: 'Business Software',
  };
}

export function useCaseHowToSchema(page: UseCasePage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: page.h1,
    description: page.metaDescription,
    url: getPageUrl('use-case', page.slug),
    step: page.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

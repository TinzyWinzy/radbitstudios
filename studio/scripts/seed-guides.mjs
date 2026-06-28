import dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config({ path: './.env.local' });

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
    });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

const guides = [
  {
    slug: 'register-business-zimbabwe',
    title: 'Register a Business in Zimbabwe',
    excerpt: 'A practical, no-nonsense guide to PACRA, tax registration, council licences, and the real costs involved in formalising your business.',
    icon: 'Building2',
    readTime: '8 min read',
    category: 'Registration',
    steps: [
      { icon: 'Search', title: 'Choose a business name', body: 'Check availability with the Deeds Registry and prepare at least three alternatives in case your first choice is taken.' },
      { icon: 'FileText', title: 'Prepare incorporation documents', body: 'Work with a registered secretarial firm to prepare the Memorandum and Articles and complete the required company forms.' },
      { icon: 'BadgeCheck', title: 'Register for tax and compliance', body: 'Register for income tax, VAT where applicable, PAYE if you have employees, and make sure your company records are in order.' },
    ],
    tips: [
      'Keep copies of every filing and payment receipt.',
      'Budget for registration, secretarial, and licence fees rather than assuming everything is free.',
      'Start the process before you need to trade so you do not lose momentum.',
    ],
    faq: [
      { q: 'How long does registration take?', a: 'Most straightforward registrations take three to eight weeks, but delays can happen if documents are incomplete.' },
      { q: 'Do I need a secretarial firm?', a: 'Not always, but using one reduces mistakes and usually saves time.' },
    ],
    content: null,
    published: true,
  },
  {
    slug: 'zimra-tax-guide-smes',
    title: 'ZIMRA Tax Guide for SMEs',
    excerpt: 'Understand the basics of VAT, PAYE, QPD and the common tax obligations that catch small businesses off guard.',
    icon: 'ReceiptText',
    readTime: '7 min read',
    category: 'Tax',
    steps: [
      { icon: 'Calculator', title: 'Know your tax obligations', body: 'Identify whether your business must register for VAT, PAYE or income tax based on turnover and structure.' },
      { icon: 'CalendarDays', title: 'Track your deadlines', body: 'Mark your QPD dates, VAT return deadlines and annual return dates in a calendar or reminder system.' },
      { icon: 'FileCheck', title: 'Keep records clean', body: 'Separate business income and expenditure clearly so filings are easier and less stressful.' },
    ],
    tips: [
      'Set aside a portion of income for tax instead of waiting until the due date.',
      'If you are unsure, consult a registered tax practitioner for advice.',
      'Do not rely on memory for filing deadlines.',
    ],
    faq: [
      { q: 'What is a QPD?', a: 'QPD stands for quarterly payment date, which is the schedule used for interim tax payments.' },
      { q: 'Do I need to register for VAT?', a: 'If your annual turnover exceeds the threshold, VAT registration is generally required.' },
    ],
    content: null,
    published: true,
  },
  {
    slug: 'sadc-export-guide',
    title: 'SADC Export Guide for Zimbabwean SMEs',
    excerpt: 'A practical overview of export planning, compliance, paperwork and the basics of shipping goods into the region.',
    icon: 'Plane',
    readTime: '6 min read',
    category: 'Exports',
    steps: [
      { icon: 'Compass', title: 'Choose your market', body: 'Start with a market where you understand the buyer, the standards and the route to delivery.' },
      { icon: 'ClipboardList', title: 'Prepare documentation', body: 'Gather invoices, certificates, permits and logistics information before you ship anything.' },
      { icon: 'ShieldCheck', title: 'Check compliance', body: 'Review customs requirements, product rules and any regional obligations before confirming the sale.' },
    ],
    tips: [
      'Get your paperwork ready before you secure the buyer.',
      'Use a freight partner that understands regional trade corridors.',
      'Keep samples and invoices organised from the start.',
    ],
    faq: [
      { q: 'Do I need special licences to export?', a: 'It depends on the product and destination; some goods need permits or certificates.' },
      { q: 'Is it expensive to start exporting?', a: 'It can be, but starting small and using a reliable freight partner keeps costs manageable.' },
    ],
    content: null,
    published: true,
  },
  {
    slug: 'ecocash-business-vs-personal',
    title: 'EcoCash Business vs Personal: When to Use What',
    excerpt: 'Learn when EcoCash Business is the right tool for your operations and when a bank account is better for larger payments.',
    icon: 'Wallet',
    readTime: '5 min read',
    category: 'Payments',
    steps: [
      { icon: 'Coins', title: 'Understand your transaction mix', body: 'Break down daily payments by size, frequency and whether customers expect mobile money.' },
      { icon: 'Banknote', title: 'Match the payment method', body: 'Use EcoCash for small, frequent transactions and a bank account for larger or formal transfers.' },
      { icon: 'BookOpen', title: 'Keep records', body: 'Capture payment references and reconcile them weekly so your books stay accurate.' },
    ],
    tips: [
      'A business account keeps your cash flow clearer than a personal account.',
      'Use both systems together rather than forcing everything through one channel.',
      'Keep a small EcoCash float for everyday operations.',
    ],
    faq: [
      { q: 'Is EcoCash Business free?', a: 'It is generally low-cost, but fees apply depending on transaction types and amounts.' },
      { q: 'Do I need a bank account if I use EcoCash?', a: 'Not always, but a bank account helps with larger, more formal business transactions.' },
    ],
    content: null,
    published: true,
  },
  {
    slug: 'load-shedding-solutions-smes',
    title: 'Load-Shedding Solutions for SMEs',
    excerpt: 'A practical look at backup power, payment continuity and the low-cost fixes that keep a small business operating during outages.',
    icon: 'Zap',
    readTime: '6 min read',
    category: 'Operations',
    steps: [
      { icon: 'BatteryCharging', title: 'Plan for outages', body: 'Build a simple operating plan for sales, payment and communications so power cuts do not stall operations.' },
      { icon: 'PlugZap', title: 'Pick the right backup tool', body: 'Choose between an inverter, power bank or generator based on what you need to run during outages.' },
      { icon: 'PhoneCall', title: 'Keep customers informed', body: 'Make it easy for customers to know whether you are accepting payments, taking orders or operating with reduced hours.' },
    ],
    tips: [
      'Keep your phone charged and ready as your first line of continuity.',
      'Use basic manual processes for sales when the power is out.',
      'Review your backup plan every quarter as your needs change.',
    ],
    faq: [
      { q: 'What is the cheapest backup option?', a: 'A small inverter and battery setup is often the most affordable starting point for basic operations.' },
      { q: 'Do customers understand outages?', a: 'They usually do, but clear communication helps preserve trust.' },
    ],
    content: null,
    published: true,
  },
  {
    slug: 'zim-business-planning',
    title: 'Business Planning in Zimbabwe',
    excerpt: 'Use this guide to build a business plan that fits local realities, from cash flow to customer assumptions and market conditions.',
    icon: 'NotebookPen',
    readTime: '7 min read',
    category: 'Planning',
    steps: [
      { icon: 'Target', title: 'Define your market', body: 'Describe who you serve, what problem you solve and why they would choose you over a competitor.' },
      { icon: 'TrendingUp', title: 'Map your cash flow', body: 'Include realistic monthly revenue, costs and the working capital you will need to survive seasonal swings.' },
      { icon: 'Lightbulb', title: 'Add practical assumptions', body: 'Reference local costs, supplier lead times and the realities of power, transport and customer behaviour.' },
    ],
    tips: [
      'A good plan should be useful to you, not just attractive to lenders.',
      'Keep your assumptions grounded in real numbers, not hope.',
      'Review the plan every quarter so it remains relevant.',
    ],
    faq: [
      { q: 'Do I need a formal business plan?', a: 'Not always, but it helps with clarity, fundraising and decision-making.' },
      { q: 'How long should the plan be?', a: 'Keep it focused and useful; a concise plan is usually more effective than a long one.' },
    ],
    content: null,
    published: true,
  },
];

async function seedGuides() {
  const collectionRef = db.collection('guides');
  let inserted = 0;
  let updated = 0;

  for (const guide of guides) {
    const existing = await collectionRef.where('slug', '==', guide.slug).limit(1).get();
    const payload = {
      ...guide,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: existing.empty ? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
    };

    if (existing.empty) {
      await collectionRef.add(payload);
      inserted += 1;
    } else {
      await existing.docs[0].ref.set(payload, { merge: true });
      updated += 1;
    }
  }

  console.log(`Seeded guides complete. Added: ${inserted}, updated: ${updated}`);
}

seedGuides().catch((error) => {
  console.error('Guide seeding failed:', error);
  process.exitCode = 1;
});

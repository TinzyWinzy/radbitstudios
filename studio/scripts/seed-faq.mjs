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

const faqItems = [
  // ── Account & Getting Started ──
  { category: "Account & Getting Started", question: "What is Radbit?", answer: "Radbit is an all-in-one enterprise platform for Zimbabwean SMEs. It combines AI-powered tools, business guides, invoicing, tender management, and compliance tracking in a single dashboard.", order: 1, published: true },
  { category: "Account & Getting Started", question: "How do I create an account?", answer: "Click 'Get Started Free' on the homepage. You will need your email, business name, and industry. Registration takes about two minutes.", order: 2, published: true },
  { category: "Account & Getting Started", question: "Is Radbit free to use?", answer: "Yes—Radbit has a Free plan with core tools. Paid plans (Growth, Tender Starter, Pro, Enterprise) unlock advanced features, team seats, and priority support.", order: 3, published: true },
  { category: "Account & Getting Started", question: "Can I change my plan later?", answer: "Yes. You can upgrade or downgrade anytime from your billing settings. Changes take effect at the start of the next billing cycle.", order: 4, published: true },

  // ── Features & Tools ──
  { category: "Features & Tools", question: "What tools does Radbit offer?", answer: "Radbit includes an AI Mentor for business advice, a VAT calculator, a business name generator, pillar guides on registration and tax, tender tracking, invoicing, and document management.", order: 5, published: true },
  { category: "Features & Tools", question: "How does the AI Mentor work?", answer: "The AI Mentor answers business questions using models fine-tuned for Zimbabwean regulations, tax rules, and market conditions. It is available on paid plans.", order: 6, published: true },
  { category: "Features & Tools", question: "Do you have a mobile app?", answer: "Radbit is a web-based platform optimised for mobile browsers. A native mobile app is in development.", order: 7, published: true },

  // ── Compliance & Security ──
  { category: "Compliance & Security", question: "Is my data secure?", answer: "Yes. Data is encrypted in transit (TLS 1.3) and at rest (AES-256). We follow industry-standard security practices and undergo regular audits.", order: 8, published: true },
  { category: "Compliance & Security", question: "Where is my data stored?", answer: "Data is stored on Google Cloud servers. We comply with Zimbabwe's data protection regulations and applicable international standards.", order: 9, published: true },
  { category: "Compliance & Security", question: "Do you share my data with third parties?", answer: "We do not sell your data. Limited data sharing occurs only with service providers essential to platform operations (e.g., payment processors), under strict data processing agreements.", order: 10, published: true },

  // ── Billing & Payments ──
  { category: "Billing & Payments", question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, EcoCash, PayNow, and bank transfers. All prices are in USD unless otherwise indicated.", order: 11, published: true },
  { category: "Billing & Payments", question: "Can I pay with EcoCash?", answer: "Yes. EcoCash is available as a payment method at checkout.", order: 12, published: true },
  { category: "Billing & Payments", question: "Do you offer refunds?", answer: "We offer a 14-day refund on annual plans. Monthly plans can be cancelled at any time and will remain active until the end of the billing period.", order: 13, published: true },
  { category: "Billing & Payments", question: "What happens if my payment fails?", answer: "Your account will remain accessible during a short grace period. If payment is not resolved, access to paid features will be paused until the balance is cleared.", order: 14, published: true },
];

async function seedFaq() {
  const collectionRef = db.collection('faq_items');
  let inserted = 0;
  let updated = 0;

  for (const item of faqItems) {
    const existing = await collectionRef.where('question', '==', item.question).limit(1).get();
    const payload = {
      ...item,
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

  console.log(`Seeded FAQ complete. Added: ${inserted}, updated: ${updated}`);
}

seedFaq().catch((error) => {
  console.error('FAQ seeding failed:', error);
  process.exitCode = 1;
});

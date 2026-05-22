import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

const partners = [
  {
    code: 'EXPO2026',
    partnerName: 'Zimbabwe Business Expo 2026',
    partnerType: 'other' as const,
    discountPercent: 15,
    maxUses: 500,
  },
  {
    code: 'IMPACT25',
    partnerName: 'Impact Hub Harare',
    partnerType: 'other' as const,
    discountPercent: 25,
    maxUses: 200,
  },
  {
    code: 'MOTO20',
    partnerName: 'Moto Republik',
    partnerType: 'other' as const,
    discountPercent: 20,
    maxUses: 200,
  },
  {
    code: 'TECHHUB30',
    partnerName: 'Tech Hub Harare',
    partnerType: 'tech_hub' as const,
    discountPercent: 30,
    maxUses: 300,
  },
];

async function seed() {
  console.log('Seeding partner codes...');

  let created = 0;
  for (const p of partners) {
    const existing = await db.collection('partner_codes').doc(p.code).get();
    if (existing.exists) {
      console.log(`  Skipping "${p.code}" — already exists`);
      continue;
    }

    await db.collection('partner_codes').doc(p.code).set({
      ...p,
      usageCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`  Created "${p.code}" — ${p.partnerName}, ${p.discountPercent}% off, ${p.maxUses} max uses`);
    created++;
  }

  console.log(`\nDone. Created ${created} new partner codes.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

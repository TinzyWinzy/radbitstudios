import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

if (!getApps().length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) initializeApp({ credential: cert(JSON.parse(key)) });
  else initializeApp();
}

const db = getFirestore();
const mode = process.argv.includes('--fix') ? 'fix' : 'scan';

const fixes = [
  {
    id: 'qpd-month-list',
    re: /on\s*25\s*March,\s*June,\s*September,\s*and\s*December/gi,
    to: 'on 25 March, 25 June, 25 September, and 20 December',
  },
  {
    id: 'paye-vat-25th',
    re: /PAYE\s+by\s+the\s+10th\s+and\s+VAT\s+by\s+the\s+25th/gi,
    to: 'monthly PAYE by the 10th and VAT returns by the 10th (with payment by the 15th)',
  },
  {
    id: 'vat-due-25th',
    re: /VAT\s+returns\s+and\s+payments\s+are\s+due\s+on\s+the\s+25th\s+of\s+each\s+month/gi,
    to: 'VAT returns are due on the 10th of each month, with payment shortly afterwards (recent 2026 notices: the 15th)',
  },
  {
    id: 'qpd4-25dec',
    re: /(QPD\s*4\s*[:.-]\s*)25(?:th|st|nd|rd)?\s*(?:of\s+)?December\b/gi,
    to: undefined,
  },
  {
    id: 'vat-rate-15-40k',
    re: /(\*\*VAT\*\*: )15 percent on goods and services\. Registration is mandatory if annual turnover exceeds USD 40,000\. Returns are due every two months\./gi,
    to: '${1}15.5 percent on goods and services since 1 January 2026. Registration is mandatory if annual turnover exceeds USD 25,000 (or the ZiG equivalent). Returns are due by the 10th of the month following each period, with payment shortly afterwards — some categories file a combined return for a two-month period, so confirm your filing category.',
  },
  {
    id: 'diaspora-vat-40k',
    re: /(Not registering for VAT when turnover exceeds )USD 40,000/gi,
    to: '${1}USD 25,000',
  },
  {
    id: 'tcc-validity',
    re: /The certificate is valid for 12 months\./gi,
    to: 'The certificate is valid for 6 months for large taxpayers and 3 months for medium and small taxpayers (tiered validity since 22 December 2025).',
  },
];

function applyReplacement(content) {
  let changed = false;
  let out = content;
  for (const f of fixes) {
    if (f.to !== undefined) {
      f.re.lastIndex = 0;
      if (f.re.test(out)) {
        f.re.lastIndex = 0;
        out = out.replace(f.re, f.to);
        changed = true;
      }
    } else {
      f.re.lastIndex = 0;
      if (f.re.test(out)) {
        f.re.lastIndex = 0;
        out = out.replace(f.re, (m, p1) => `${p1}20 December`);
        changed = true;
      }
    }
  }
  return { out, changed };
}

const snap = await db.collection('blog_posts').get();
console.log(`Docs scanned: ${snap.size}`);

let touched = 0;
for (const d of snap.docs) {
  const data = d.data();
  if (typeof data.content !== 'string') continue;

  const before = data.content;
  const { out, changed } = applyReplacement(before);
  if (!changed) continue;

  if (mode === 'scan') {
    console.log(`\n[scan] ${d.id} | slug=${data.slug} | title=${data.title.slice(0, 60)}`);
    for (const f of fixes) {
      f.re.lastIndex = 0;
      const m = f.re.exec(before);
      if (m) {
        const ctx = before.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).replace(/\s+/g, ' ');
        console.log(`  - ${f.id}: ...${ctx}...`);
        f.re.lastIndex = m.index + m[0].length;
      }
    }
  } else {
    await d.ref.update({
      content: out,
      lastZimraCorrection: '2026-08-30: VAT returns 10th / payment 15th (SI 81/2025); VAT 15.5%, threshold USD 25k; TCC tiered 6/3 months',
      updatedAt: FieldValue.serverTimestamp(),
    });
    touched++;
    console.log(`[fix] ${d.id} (slug=${data.slug}) updated`);
  }
}

console.log(mode === 'fix' ? `\nUpdated ${touched} document(s).` : `\n${touched} document(s) would change. Run with --fix to apply.`);
process.exit(0);
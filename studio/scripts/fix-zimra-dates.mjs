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
    to: '$115.5 percent on goods and services since 1 January 2026. Registration is mandatory if annual turnover exceeds USD 25,000 (or the ZiG equivalent). Returns are due by the 10th of the month following each period, with payment shortly afterwards — some categories file a combined return for a two-month period, so confirm your filing category.',
  },
  {
    id: 'diaspora-vat-40k',
    re: /(Not registering for VAT when turnover exceeds )USD 40,000/gi,
    to: '$1USD 25,000',
  },
  {
    id: 'tcc-validity',
    re: /The certificate is valid for 12 months\./gi,
    to: 'The certificate is valid for 6 months for large taxpayers and 3 months for medium and small taxpayers (tiered validity since 22 December 2025).',
  },
  {
    id: 'legal-fees-vat',
    re: /VAT on legal fees: 15 percent \(USD 375\)/gi,
    to: 'VAT on legal fees: 15.5 percent (USD 387.50)',
  },
  {
    id: 'underpayment-interest-3pct',
    re: /interest at 3 percent per month/gi,
    to: 'interest at the prescribed rate (SI 26 of 2025): 10 percent per annum on foreign-currency debt, or the Bank Policy Rate plus 5 percentage points on local-currency debt',
  },
  {
    id: 'penalty-200-30day',
    re: /The penalty is USD 200 per month per overdue return\./gi,
    to: 'The penalty is up to USD 30 per day per overdue return (capped at 181 days), plus interest',
  },
  {
    id: 'transfer-duty-6pct',
    re: /Transfer duty: 6 percent \(USD 6,000\)/gi,
    to: 'Transfer duty: 3 percent (USD 3,000)',
  },
  {
    id: 'closing-costs-total',
    re: /Total closing costs: approximately USD 11,387\.50/gi,
    to: 'Total closing costs: approximately USD 8,387.50',
  },
  {
    id: 'costs-10pct-6pct',
    re: /The costs are roughly 10 percent of the purchase price — 6 percent transfer duty, 2 percent legal fees, and 2 percent agency fees\./gi,
    to: 'The costs are roughly 8 percent of the purchase price — 3 percent transfer duty, 2 percent legal fees, and 2 percent agency fees.',
  },
  {
    id: 'presumptive-rental-20net',
    re: /The tax rate is 20 percent on net rental income\. You can deduct expenses like maintenance, agent fees, and insurance\./gi,
    to: 'For commercial and business premises, a presumptive rental income tax applies from 1 January 2026: 15 percent of gross rent, a final tax with no deductions (Public Notice 08 of 2026). Residential rentals are excluded and follow the normal income tax rules. Non-resident landlords must appoint a resident representative in Zimbabwe.',
  },
  {
    id: 'rental-20-netprofit',
    re: /Rental income is taxed at 20 percent of net profit \(gross rent minus allowable expenses\)\./gi,
    to: 'Rental income from residential property is taxed under the normal income tax rules — the new presumptive rental income tax applies to commercial and business premises from 1 January 2026 at 15 percent of gross rent with no deductions (Public Notice 08 of 2026). You report the profit (gross rent minus allowable expenses) through a ZIMRA return.',
  },
  {
    id: 'tender-wht-10',
    re: /Tender payments \(government\) 10%/gi,
    to: 'Tender payments (government) 30% under Section 80 where the payee has no valid tax clearance',
  },
  {
    id: 'dswt-15',
    re: /Digital Services Withholding Tax of 15%/gi,
    to: 'Digital Services Withholding Tax (DSWT): 15.5% where the non-resident supplier is not registered for VAT in Zimbabwe, or a 3/23 tax fraction of the payment where the supplier is VAT-registered (Public Notice 5 of 2026; the 2026 Budget announcement said 15%)',
  },
  {
    id: 'rereg-2026',
    re: /by 20 April 2026/gi,
    to: 'by 20 April 2028 (SI 76 of 2026 extended the original 20 April 2026 deadline under SI 108 of 2025)',
  },
  {
    id: 'treasury-12-25',
    re: /Yields are attractive — between 12 and 25 percent in local currency/gi,
    to: 'Returns have at times been high in local currency, but they vary by instrument and holding period',
  },
  {
    id: 'mortgage-15-25-a',
    re: /Zimbabwean banks offer mortgage facilities to diaspora buyers, but interest rates are high — 15 to 25 percent in local currency\./gi,
    to: 'Zimbabwean banks offer mortgage facilities to diaspora buyers, but local-currency interest rates have been high in recent years.',
  },
  {
    id: 'mortgage-15-25-b',
    re: /Most diaspora buyers pay cash because Zimbabwe mortgage rates are high \(15 to 25 percent in local currency\)\./gi,
    to: 'Most diaspora buyers pay cash because Zimbabwe mortgage rates have been high in local currency in recent years.',
  },
  {
    id: 'zse-min-100',
    re: /The minimum investment is about USD 100\./gi,
    to: 'Minimum account funding is set by each stockbroking firm — confirm the current minimum with your chosen broker.',
  },
  {
    id: 'presumptive-10-turnover',
    re: /Presumptive Tax: 10% of turnover for qualifying small businesses\./gi,
    to: 'Presumptive Tax: payable by informal traders and operators who do not keep proper books, based on assessed categories set by ZIMRA (confirm the current rate for your category).',
  },
  {
    id: 'penalty-latefiling-100',
    re: /Late filing of returns: up to 100% of tax \+ interest/gi,
    to: 'Late filing: US$30 per day per overdue return, capped at 181 days (SI 97 of 2013), plus interest',
  },
  {
    id: 'penalty-latepayment-15',
    re: /Late payment: 15% penalty \+ interest/gi,
    to: 'Late payment interest: 10% per annum on foreign-currency amounts; for ZiG, the Bank Policy Rate plus 5 percentage points (SI 26 of 2025)',
  },
  {
    id: 'penalty-latevat-25',
    re: /Late VAT return: 25% of VAT \+ interest/gi,
    to: 'Under-assessed amounts (on audit or where returns are not filed): additional tax up to 100% of the amount at stake (200% for repeat offences), plus interest',
  },
  {
    id: 'cabs-15-zwg',
    re: /Interest rate around 15 percent in ZWG\./gi,
    to: 'Interest rates vary with prevailing market conditions and are often quoted in ZWG.',
  },
  {
    id: 'zida-1m',
    re: /The USD 1 million threshold applies to ZIDA licensing requirements, not to the ability to invest\./gi,
    to: 'ZIDA licensing applies above certain investment thresholds, so confirm the current threshold with ZIDA — most diaspora investments do not need a licence.',
  },
  {
    id: 'cgt-2yr',
    re: /if you hold the property for more than two years and are a Zimbabwean resident abroad, you may qualify for exemptions\./gi,
    to: 'exemptions exist in limited circumstances, such as the principal-residence relief, so confirm whether you qualify with a tax consultant',
  },
];

const CORRECTION_NOTE =
  '2026-08-30: Round 3 - re-registration deadline 20 Apr 2028 (SI 76/2026); DSWT 15.5%/3/23 (PN 5/2026); tender WHT 30% (Section 80); presumptive rental income tax 15% gross on commercial premises (PN 08/2026); penalties US$30/day cap 181 days (SI 97/2013), QPD 10%, interest 10% p.a. FX / BPR+5% ZiG (SI 26/2025); export tax 10% lithium ore/antimony, 5% ferro-chrome, 0% lithium sulphate; hedged mortgage/treasury/ZSE/ZIDA figures';

function transformNode(node, path, hits) {
  if (typeof node === 'string') {
    let out = node;
    for (const f of fixes) {
      f.re.lastIndex = 0;
      if (f.re.test(out)) {
        f.re.lastIndex = 0;
        out = out.replace(f.re, f.to === undefined ? (m, p1) => `${p1}20 December` : f.to);
        hits.push({ field: path, fix: f.id });
      }
    }
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      node[i] = transformNode(item, `${path}[${i}]`, hits);
    });
    return node;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      node[k] = transformNode(node[k], `${path}.${k}`, hits);
    }
  }
  return node;
}

const collections = ['blog_posts', 'seo_pages', 'guides'];
let scanned = 0;
let touched = 0;

for (const collection of collections) {
  const snap = await db.collection(collection).get();
  scanned += snap.size;
  console.log(`[${collection}] Docs scanned: ${snap.size}`);

  for (const d of snap.docs) {
    const data = { ...d.data() };
    const hits = [];
    const out = transformNode(data, '$', hits);
    if (hits.length === 0) continue;
    touched++;

    const label = `${d.id} | slug=${data.slug ?? '-'} | title=${(data.title ?? '').slice(0, 60)}`;

    if (mode === 'scan') {
      console.log(`\n[scan] ${label}`);
      for (const h of hits) console.log(`  - ${h.fix} @ ${h.field}`);
    } else {
      await d.ref.set(
        {
          ...out,
          lastZimraCorrection: CORRECTION_NOTE,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      console.log(`[fix] ${label}`);
    }
  }
}

console.log(mode === 'fix' ? `\nUpdated ${touched} document(s) across ${collections.length} collections.` : `\n${touched} document(s) would change. Run with --fix to apply.`);
process.exit(0);
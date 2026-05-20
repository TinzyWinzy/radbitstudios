import { config } from 'dotenv';
config();

import { indexDocument } from '@/services/ai/rag';

const ZIMRA_KNOWLEDGE = [
  {
    title: "QPD – Quarterly Payment Declaration",
    content: "All registered taxpayers must submit QPD returns quarterly (March, June, September, December). The QPD is used to declare and pay provisional taxes for income not subject to third-party withholding. Returns must be filed by the 10th day of the month following the quarter end. Late submissions attract a penalty of 5% of the tax due plus interest at the prescribed rate. SMEs can file online via the ZIMRA e-services portal or visit any ZIMRA office. Supporting documents include proof of income and expense records for the quarter.",
    category: "zimra-qpd",
    source: "ZIMRA Guidelines",
  },
  {
    title: "VAT Registration Thresholds",
    content: "Businesses with annual turnover exceeding USD 40,000 must register for VAT with ZIMRA. Voluntary registration is permitted for businesses below the threshold. VAT is charged at the standard rate of 14.5% on taxable supplies. Zero-rated supplies include exported goods and certain basic commodities. Exempt supplies include financial services and certain educational services. Registered businesses must file VAT returns monthly by the 10th of the following month. Input VAT can be claimed on qualifying business purchases, but not on exempt supplies. Non-compliance penalties include a 5% late filing penalty and interest on outstanding amounts.",
    category: "zimra-vat",
    source: "ZIMRA Guidelines",
  },
  {
    title: "PAYE – Pay As You Earn",
    content: "Employers must deduct PAYE from employees' remuneration monthly and remit to ZIMRA by the 10th of the following month. PAYE is calculated using a graduated tax table with tax-free thresholds. For 2024, the tax-free threshold is approximately ZWL 100,000 per month (adjusted periodically for inflation). Employers must register for PAYE within 30 days of becoming an employer. Monthly PAYE returns must include employee details, gross remuneration, deductions, and tax calculated. Failure to deduct or remit PAYE attracts penalties of up to 100% of the tax due plus interest. Employers must also issue annual tax certificates (ITF 263) to employees.",
    category: "zimra-paye",
    source: "ZIMRA Guidelines",
  },
  {
    title: "Corporate Income Tax (CIT)",
    content: "Companies registered in Zimbabwe pay CIT at 24.72% of taxable income (including AIDS levy). The tax year runs from 1 January to 31 December. Provisional tax payments are due quarterly: 10 March, 10 June, 10 September, and 10 December. Final tax returns (ITF 12C) are due by 30 April following the tax year. SMEs with annual turnover below USD 500,000 may qualify for simplified tax regimes. Deductible expenses include operating costs, depreciation, interest, and repairs. Non-deductible expenses include fines, penalties, and donations (unless through approved channels). Losses can be carried forward for up to 6 years.",
    category: "zimra-cit",
    source: "ZIMRA Guidelines",
  },
  {
    title: "Presumptive Tax for SMEs",
    content: "Small businesses in certain sectors pay presumptive tax instead of normal income tax. Affected sectors include commuter omnibuses, taxis, hair salons, bottle stores, tuck shops, and spaza shops. Presumptive tax is a fixed amount based on the type and size of business, not actual profits. Rates are gazetted annually by ZIMRA and vary by sector and vehicle capacity (for transport). Payment is made quarterly or annually at ZIMRA offices or through designated banks. Presumptive tax is final and no further income tax return is required for that business income. However, businesses may opt out of presumptive tax and elect to be taxed under normal CIT rules if they maintain proper records.",
    category: "zimra-presumptive",
    source: "ZIMRA Guidelines",
  },
  {
    title: "Customs Duties for Cross-Border Trade",
    content: "Goods imported into Zimbabwe attract customs duty calculated on the CIF (Cost, Insurance, Freight) value. Duty rates vary from 0% to 40% depending on the product classification under the Harmonized System (HS) code. Raw materials and capital equipment attract lower duties, while finished consumer goods attract higher rates. SMEs engaged in cross-border trade must register as importers/exporters with ZIMRA. Required documentation includes a bill of entry, commercial invoice, packing list, certificate of origin, and import license (for regulated goods). Customs duty must be paid before goods are released. Penalties for under-declaration or misclassification include seizure of goods and fines up to three times the duty evaded. Zimbabwe is a member of the SADC FTA and COMESA, which offer preferential duty rates for goods meeting rules of origin requirements.",
    category: "zimra-customs",
    source: "ZIMRA Customs",
  },
  {
    title: "Withholding Tax",
    content: "Payments to non-residents for certain services attract withholding tax at rates specified in the Zimbabwe tax legislation or applicable Double Taxation Agreements (DTAs). Withholding tax rates for residents include: 10% on dividends, 15% on interest (20% for non-residents), 10% on royalties, 10% on management/consultancy fees, and 15% on commissions paid to agents. The person making the payment must deduct the tax at source and remit to ZIMRA within 10 days of the month following payment. A withholding tax certificate (ITF 5) must be issued to the recipient. Failure to withhold and remit attracts a penalty of 100% of the tax not withheld. SMEs engaging foreign consultants or paying dividends must ensure compliance.",
    category: "zimra-withholding",
    source: "ZIMRA Guidelines",
  },
  {
    title: "Tax Clearance Certificate",
    content: "A valid tax clearance certificate (TCC) is required for government tenders, import/export clearance, license renewals, and bank financing. TCCs are valid for 6 months from the date of issue. To qualify, a business must have filed all tax returns and paid all amounts due, or have a valid payment plan. Applications are submitted online through the ZIMRA e-services portal. ZIMRA will verify compliance across all tax types (CIT, PAYE, VAT, withholding tax). Processing typically takes 5-10 working days. SMEs must ensure all returns are up to date before applying. A TCC can be revoked if new tax liabilities arise and are not settled. There is no fee for the TCC itself, but all outstanding taxes must be paid first.",
    category: "zimra-compliance",
    source: "ZIMRA Guidelines",
  },
  {
    title: "SADC Rules of Origin",
    content: "Under SADC FTA, goods originating from member states qualify for preferential duty rates. Origin criteria include: wholly produced in a member state, or sufficiently processed/ manufactured with at least 35% local value addition (or change in tariff heading). Key products from Zimbabwe benefiting include tobacco, sugar, horticulture, textiles, and processed foods. The SADC Certificate of Origin (Form SAD 100) must be issued by an approved certifying authority in Zimbabwe (typically ZIMRA or the Chamber of Commerce). Importers must present the certificate at the point of entry to claim preferential treatment. Post-importation verification audits may be conducted by the importing country's customs authority. SMEs exporting within SADC should maintain production records to support origin claims.",
    category: "sadc-trade",
    source: "SADC Trade Protocol",
  },
  {
    title: "AfCFTA Tariff Elimination",
    content: "Under the African Continental Free Trade Area (AfCFTA), tariffs on 90% of goods traded between African Union member states will be eliminated over 5-10 years. Phase 1 covers tariff removal for non-sensitive products (57% of tariff lines) within 5 years. Phase 2 covers sensitive products (43%) within 10 years. Zimbabwe ratified the AfCFTA agreement and is participating in guided trade initiatives. Rules of origin require at least 35% regional value content for manufactured goods. The AfCFTA also covers trade in services across 5 priority sectors: transport, communications, finance, tourism, and professional services. SMEs can benefit from access to a market of 1.3 billion people with a combined GDP of USD 3.4 trillion. Key requirements include obtaining an AfCFTA Certificate of Origin and ensuring compliance with product standards and technical regulations.",
    category: "afcfta",
    source: "AfCFTA Agreement",
  },
];

async function main() {
  console.log('Seeding ZIMRA knowledge base...\n');

  for (const doc of ZIMRA_KNOWLEDGE) {
    try {
      const docId = await indexDocument(
        doc.title,
        doc.content,
        doc.source,
        doc.category,
        'en',
      );
      console.log(`  ✓ Indexed: ${doc.title} (ID: ${docId})`);
    } catch (err) {
      console.error(`  ✗ Failed to index: ${doc.title}`, err);
    }
  }

  console.log('\nSeeding complete.');
}

main().catch(console.error);

import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });

import { indexDocument } from '@/services/ai/rag.server';

const ZIMRA_KNOWLEDGE = [
  {
    title: "QPD – Quarterly Payment Declaration",
    content: "All taxpayers liable to provisional tax must submit QPD returns each quarter to declare and pay income tax instalments for income not covered by third-party withholding. The 2026 QPD calendar: QPD 1 due 25 March (10%), QPD 2 due 25 June (25%), QPD 3 due 25 September (30%), QPD 4 due 20 December (35%) of estimated annual tax. Under SI 81 of 2025 returns and payments are filed separately: the QPD return (ITF12B) is due by the 20th of each payment month, with the payment falling due on the 25th (20 December for QPD 4) — see Public Notice 17 of 2026 and the ZIMRA Tax Payment Calendar. Underestimating annual tax by more than 10% attracts interest on the shortfall; a late QPD instalment attracts a 10% penalty plus interest. SMEs can file online via the ZIMRA e-services portal (TaRMS) or visit any ZIMRA office. Supporting documents include proof of income and expense records for the quarter.",
    category: "zimra-qpd",
    source: "ZIMRA Tax Payment Calendar; SI 81 of 2025; Public Notice 17 of 2026",
  },
  {
    title: "VAT Registration Thresholds",
    content: "Businesses with annual turnover exceeding USD 25,000 (or the equivalent in ZiG) in any consecutive 12-month period must register for VAT with ZIMRA — effective 1 January 2024. Registration thresholds vary by category (Category C: USD 240,000; Category D: USD 120,000) and voluntary registration is possible below the threshold. VAT is charged at the standard rate of 15.5% on taxable supplies from 1 January 2026 (Finance Act No. 7 of 2025; Public Notice 7 of 2026). Zero-rated supplies include exported goods and certain basic commodities; exempt supplies include financial and certain educational services. Under SI 81 of 2025 the VAT return is due by the 10th of the month following the tax period, and the payment shortly afterwards (recent 2026 notices: the 15th — confirm the current month's notice in TaRMS). Filing frequency depends on the taxpayer category; some categories file a combined return for a two-month period. Input VAT can be claimed on qualifying business purchases but not on exempt supplies. Non-compliance penalties: a late VAT return attracts up to 25% penalty plus interest, and late payment 15% plus interest.",
    category: "zimra-vat",
    source: "ZIMRA VAT Registration page; Finance Act No. 7 of 2025; Public Notice 7 of 2026; SI 81 of 2025",
  },
  {
    title: "PAYE – Pay As You Earn",
    content: "Employers must deduct PAYE from employees' remuneration each month and remit it to ZIMRA by the 10th day of the following month. The 2026 PAYE structure: a tax-free threshold of US$1,200 per year (about US$100 per month), then progressive marginal rates up to a top rate of 40%, plus a 3% AIDS levy. Employers must register for PAYE within 30 days of becoming an employer and file the monthly PAYE return (REV5) with employee details, gross remuneration, deductions and tax calculated. Failure to deduct or remit PAYE attracts penalties of up to 100% of the tax due plus interest. Employers must also issue annual tax certificates (ITF263) to employees.",
    category: "zimra-paye",
    source: "ZIMRA Employer Compliance Guidelines (2026)",
  },
  {
    title: "Corporate Income Tax (CIT)",
    content: "Companies registered in Zimbabwe pay corporate income tax at 24.72% of taxable income (24% CIT plus 3% AIDS levy). The tax year runs from 1 January to 31 December. Provisional tax is paid in quarterly instalments on the QPD calendar — 25 March, 25 June, 25 September and 20 December — with the accompanying ITF12B return due by the 20th of each of those months (SI 81 of 2025). The final income tax return (ITF 12C) is due by 30 April following the tax year. Qualifying small businesses may elect the BKPO regime at a flat 15% CIT. Deductible expenses include operating costs, depreciation, interest and repairs; fines, penalties and most donations are not deductible. Tax losses can be carried forward for up to 6 years.",
    category: "zimra-cit",
    source: "ZIMRA Corporate Tax Guidelines; SI 81 of 2025",
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
    content: "Payments to residents and non-residents for certain services attract withholding tax at the rates in the Income Tax Act or an applicable Double Taxation Agreement (DTA). Common resident rates include 15% on interest, 10% on royalties, and withholding on dividends, management/consultancy fees and commissions; non-resident and DTA rates differ, so confirm the current rate. The person making the payment must deduct the tax at source and remit it to ZIMRA within 10 days of the payment or credit date, and issue a withholding tax certificate (ITF 5) to the recipient. Failure to withhold and remit attracts a penalty of 100% of the tax not withheld. Under SI 81 of 2025 withholding tax returns have their own due dates — confirm in TaRMS. SMEs engaging foreign consultants or paying dividends must ensure compliance.",
    category: "zimra-withholding",
    source: "ZIMRA Guidelines; SI 81 of 2025",
  },
  {
    title: "Tax Clearance Certificate",
    content: "A valid tax clearance certificate (ITF 263) is required for government tenders, import/export clearance, license renewals, and bank financing. Since the reversal of Public Notice 69 of 2025 (22 December 2025), TCC validity is tiered: 6 months for large taxpayers and 3 months for medium and small taxpayers. To qualify, a business must have filed all tax returns and paid all amounts due, or have a valid payment plan. Applications are submitted online through the ZIMRA e-services portal. ZIMRA will verify compliance across all tax types (CIT, PAYE, VAT, withholding tax). Processing typically takes 5-10 working days. SMEs must ensure all returns are up to date before applying. A TCC can be revoked if new tax liabilities arise and are not settled. There is no fee for the TCC itself, but all outstanding taxes must be paid first.",
    category: "zimra-compliance",
    source: "ZIMRA Guidelines; Public Notice 69 of 2025 and its reversal (22 December 2025)",
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
  {
    title: "ZIMRA Tenders 2026",
    content: "ZIMRA publishes tenders across multiple categories including security services, IT equipment, marine, aviation, branding, events, insurance, promotional materials, fire safety, PPE, transport, and automotive services. Active 2026 tenders include: NCB 12/2026 Supply and Delivery of a Brand New Boat; NCB 21/2026 Intelligent Flight Batteries and Battery Stations; NCB 08/2026 Security Services; NCB 07/2026 Fire Extinguisher Servicing; NCB 06/2026 PPE Supply and Delivery; NCB 05/2026 ZITF Promotional Materials; NCB 04/2026 ZITF Stand Design and Commissioning; and Disposal of Goods by Informal Tender. Carryover tenders from 2025 include IT equipment, branding, SAP consulting, insurance, vehicle services, and agricultural show stand design. All tender documents available as PDF downloads from www.zimra.co.zw/tenders.",
    category: "zimra-tenders",
    source: "ZIMRA Tenders Portal",
  },
  {
    title: "ZIMRA Public Notices 2026 - Key Compliance Deadlines",
    content: "ZIMRA public notices across 2026 (PN 1 to PN 44) set monthly compliance deadlines under SI 81 of 2025, which separates return filing dates from payment dates. VAT returns are generally due the 10th of the following month (PN 23, 28, 43) with payments due 10th-15th per the month's notice (PN 43: payment 15 August 2026). Value Added Withholding Tax returns are due by the 5th (PN 33, 27, 22). QPD returns (ITF12B) are due the 20th of the payment month with payments on 25 Mar, 25 Jun, 25 Sep and 20 Dec (PN 17, 36). Income Tax Returns (ITF12C) for the tax year ended 31 December 2025 have an extended deadline per PN 26. Excise Special Surtax Returns have multiple due dates (PN 21, 29, 31, 36, 39). Other notices: PN 37 - New FDMS Support Emails per Region; PN 35 - Confirmation of Customs Clearance Details for Motor Vehicles Before Purchase; PN 32 - Forfeiture of Unclaimed Funds; PN 25 - Voluntary Disclosure program; PN 24 - Obligations to account for tax on payments to non-residents; PN 30 - WhatsApp channel change. Always confirm the current month's notice in TaRMS.",
    category: "zimra-public-notices",
    source: "ZIMRA Public Notices 2026; SI 81 of 2025",
  },
  {
    title: "ZIDA Q1 2026 Quarterly Report",
    content: "The Zimbabwe Investment and Development Agency (ZIDA) Q1 2026 report covers: 146 new licences issued (US$723.74m projected value), total licensed value US$1,924.68m (up 62% QoQ). Domestic Direct Investment surged 2,406% to US$102.38m. Licence renewals up 53%. Capital structure: 46% equipment imports, 25% foreign cash, 22% foreign loans. Energy was highest value sector; Mining had most licences. Fee reductions under SI 17/2026 (GI) and SI 18/2026 (SEZ): GI Licence $5,000->$4,000, SEZ Designation $50,000->$25,000, Developer Permit $10,000->$1,000, SEZ Operator $20,000->$10,000, Investor Licence $10,000->$4,000. BKPO Framework launched: 15% flat CIT, duty-free capital goods, youth employment tax credit. PPP Guidelines approved by Cabinet. 162 investors engaged with US$1.413bn committed. New prospectus projects: Hunyani Estates Solar, Eagle Heights Victoria Falls. MOUs signed with WFP (agriculture PPPs) and UNDP (SDG investment mapping). Regulatory changes: Cotton Finance (SI 23), Tobacco Finance (SI 24), Luggage Ware duty suspension (SI 30), Printing & Packaging (SI 31), Electrical Manufacturers (SI 32), Pipelines Amendment Act.",
    category: "zida-quarterly",
    source: "ZIDA Q1 2026 Report",
  },
];

async function main() {
  console.log('Seeding knowledge base (ZIMRA + ZIDA + regulatory)...\n');

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
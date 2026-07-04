export interface ZidaSector {
  id: string;
  name: string;
  description: string;
  opportunities: string[];
  stats: Record<string, string>;
}

export interface ZidaInvestmentPathway {
  type: string;
  title: string;
  description: string;
  ownership: string;
  link: string;
}

export const ZIDA_SECTORS: ZidaSector[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Zimbabwe\'s agricultural sector contributes 15% to GDP, employs 60% of the population, and generates 30% of export earnings. The sector has grown at a 94.8% CAGR since 2019, from US$5B to US$7.2B in 2023.',
    opportunities: ['Dairy Farming and Dairy Value Chain', 'Horticulture', 'Floriculture', 'Coffee', 'Sugar', 'Soyabean', 'Leather', 'Cotton', 'Cereal Milling'],
    stats: { 'GDP Contribution': '15%', 'Employment': '60% of population', 'Export Earnings': '30%', 'Sector Value (2023)': 'US$7.2B', 'CAGR (2019-2023)': '94.8%', 'Raw Materials to Manufacturing': '63%' },
  },
  {
    id: 'mining',
    name: 'Mining',
    description: 'Zimbabwe is among the top 10 mineral producing countries in Africa. Mining contributes 70% of FDI, 80% of exports, 19% of government revenues, and 13.5% of national income. The government targets US$12B in mining output.',
    opportunities: ['Gold exploration and production', 'Platinum Group Metals (PGMs)', 'Lithium mining and processing', 'Chrome and steel production', 'Coal mining (thermal and metallurgical)', 'Diamond production', 'Mineral processing and value addition', 'Mining equipment dealerships'],
    stats: { 'FDI Contribution': '70%', 'Export Contribution': '80%', 'GDP Contribution': '12-13.5%', 'Government Revenue': '19%', 'Mineral Types': '40+', 'PGM Reserves': '3rd largest globally (2.8B tons)', 'Lithium': 'Largest deposits in Africa (11M tons at Bikita)', 'Chrome': '80% of world resource' },
  },
  {
    id: 'tourism',
    name: 'Tourism',
    description: 'Zimbabwe offers world-class attractions including Victoria Falls, Mana Pools, Great Zimbabwe, and the Eastern Highlands. The sector is recognized as a key pillar alongside agriculture, mining, and manufacturing in NDS1 and Vision 2030.',
    opportunities: ['Integrated Resorts', 'Golf Estates and Casinos', 'Hotels and Lodges', 'Convention Centres and Exhibition Parks', 'Theme Amusement Parks', 'Shopping Malls and Restaurants'],
    stats: { 'Tourist Arrivals Peak (2018)': '2,579,974', 'Tourism Receipts Target': 'US$3B+', 'Recovery Growth (H1 2023)': '50% increase in arrivals', 'Investment Growth (H1 2023)': '100% increase' },
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Zimbabwe has significant renewable energy potential: solar, wind (39GW), hydro (5GW+ along Zambezi), and geothermal (50MW). The government targets 2,100MW of renewable capacity by 2030. Total power demand is estimated at 4,000MW annually.',
    opportunities: ['Independent Power Producers (IPPs) for solar, wind, hydro', 'Investment into existing IPP projects', 'Public-Private Partnerships for energy infrastructure', 'Energy equipment supply and maintenance'],
    stats: { 'Renewable Target (2030)': '2,100MW (26.5% of generation)', 'Solar Potential': 'Excellent (World Bank Solar Atlas)', 'Wind Potential': '39GW', 'Hydro Potential': '5GW+', 'Geothermal': '50MW', 'Current Capacity': '2,600MW installed (1,500MW actual)', 'Power Demand': '4,000MW per annum', 'SAPP Market': '340M people, US$700B+ economy' },
  },
  {
    id: 'sez',
    name: 'Special Economic Zones',
    description: 'ZIDA oversees the designation, licensing, and regulation of Special Economic Zones (SEZs) with over 6,000 hectares designated. SEZs offer fiscal incentives including tax holidays, duty-free imports, and 100% profit repatriation.',
    opportunities: ['Develop or operate an SEZ', 'Establish businesses within designated zones', 'BKPO (Business and Knowledge Process Outsourcing) operations'],
    stats: { 'Designated Land': '6,000+ hectares', 'Foreign Ownership': '100% allowed', 'Profit Repatriation': '100%', 'Tax Holidays': 'Available for BOT/BOOT deals' },
  },
  {
    id: 'bkpo',
    name: 'Business & Knowledge Process Outsourcing (BKPO) SEZ',
    description: 'Launched in Q1 2026, the BKPO Framework positions Zimbabwe as a premier outsourcing hub leveraging 93.7% literacy, 30,000+ graduates/year, English-speaking workforce, and strategic timezone bridging Europe and Asia.',
    opportunities: ['Set up a BKPO SEZ facility', 'Operate BPO/KPO services from designated zones', 'Provide outsourcing services in finance, HR, IT, customer service'],
    stats: { 'Literacy Rate': '93.7%', 'Graduates/Year': '30,000+', 'Corporate Tax': '15% flat', 'Duty Free': 'Capital goods importation', 'Capital Allowance': '100% first year', 'Youth Employment Tax Credit': 'Available' },
  },
];

export const ZIDA_INVESTMENT_PATHWAYS: ZidaInvestmentPathway[] = [
  {
    type: 'general_investment',
    title: 'General Investment License',
    description: 'Establish a private business with up to 100% foreign ownership. The standard route for most foreign investors.',
    ownership: 'Up to 100%',
    link: 'https://zidainvest.com/general-investment-license/',
  },
  {
    type: 'ppp',
    title: 'Public-Private Partnership',
    description: 'Invest in partnership with Government, local authorities, or SOEs to deliver infrastructure and public service projects.',
    ownership: 'Negotiable',
    link: 'https://zidainvest.com/public-private-partnerships/',
  },
  {
    type: 'sez',
    title: 'Special Economic Zone',
    description: 'Establish operations in designated SEZs with fiscal incentives including tax holidays and duty-free imports.',
    ownership: 'Up to 100%',
    link: 'https://zidainvest.com/special-economic-zone/',
  },
];

export const ZIDA_KEY_FACTS = {
  q12026: {
    newLicences: 146,
    projectedValue: '$723.74m',
    totalLicensedValue: '$1,924.68m',
    valueChangeYoY: '-59.6%',
    valueChangeQoQ: '+62%',
    domesticDirectInvestment: '$102.38m (+2,406% YoY)',
    licenceRenewals: '+53% total renewals, 22% timely',
    capitalStructure: '46% equipment, 25% foreign cash, 22% foreign loans',
    topSectorValue: 'Energy',
    topSectorLicences: 'Mining',
    provinces: { Harare: { licences: 66, value: '$708.81m' }, 'Mash West': { licences: 14, value: '$710.42m' }, Midlands: { licences: 20, value: '$159.60m' } },
    investorsEngaged: 162,
    committedValue: '$1.413bn',
    leads: { renewableEnergy: 8, infrastructure: 7, agriculture: 6, ict: 6, manufacturing: 3 },
    feeReductions: 'SI 17 & 18 of 2026 — GI fee $5k->$4k, SEZ Designation $50k->$25k, Developer Permit $10k->$1k, SEZ Operator $20k->$10k, Investor Licence $10k->$4k',
    newProjects: 'Hunyani Estates Solar, Eagle Heights Victoria Falls',
    pppGuidelines: 'Approved by Cabinet Q1 2026',
    mois: 'WFP (agriculture PPPs), UNDP (SDG investment mapping)',
    internationalEngagements: 'Kenya JPCC, Ghana JPCC, EU-ESA5 EPA negotiations, WTO MC14 Yaoundé',
    webTraffic: { Zimbabwe: 1875, USA: 355, SouthAfrica: 257, China: 201, UK: 95 },
    socialGrowth: { linkedin: '+1,684', facebook: '+592', x: '+307' },
  },
  q32025: '21% jump in investment licences in Q3 valued at US$39 billion',
  diyPortal: 'https://zidainvest.com/zida-diy-investor-licensing-portal/',
  contact: { phone: '+263 8688002639-42', email: 'info@zidainvest.com', address: 'Cnr Jason Moyo & Sam Nujoma St, ZB Life Towers, 1st Floor, Harare' },
  eregulations: 'https://eregulations.zidainvest.com/',
};

export function getZidaContextForPrompt(): string {
  return `ZIMBABWE INVESTMENT AND DEVELOPMENT AGENCY (ZIDA) KNOWLEDGE

ZIDA is Zimbabwe's investment promotion agency, operating under the ZIDA Act (Chapter 14:40). CEO: Tafadzwa Chinamo.

=== Q1 2026 PERFORMANCE ===
- 146 new licences issued (down 32.2% YoY), projected value US$723.74m
- Total licensed value: US$1,924.68m (up 62% QoQ in value — fewer but larger deals)
- Domestic Direct Investment surged 2,406% to US$102.38m
- Licence renewals up 53%, timely renewals improved to 22%
- Capital structure: 46% equipment imports, 25% foreign cash, 22% foreign loans
- Highest value sector: Energy; Highest # licences: Mining
- 162 investors engaged, committed value US$1.413bn
- Leads: Renewable Energy (8), Infrastructure (7), Agriculture (6), ICT (6)
- New prospectus: Hunyani Estates Solar (AISEZ), Eagle Heights Victoria Falls

=== FEE REDUCTIONS (SI 17 & 18 of 2026) ===
- GI Licence: $5k -> $4k | SEZ Designation: $50k -> $25k | Developer Permit: $10k -> $1k | SEZ Operator: $20k -> $10k | Investor Licence: $10k -> $4k

=== BKPO FRAMEWORK (Launched Q1 2026) ===
- Positions Zim as premier outsourcing hub (93.7% literacy, 30k+ graduates/yr)
- Facility-based SEZ model: 15% flat CIT, duty-free capital goods, youth employment tax credit, 100% capital allowance

=== PPP GUIDELINES (Approved by Cabinet Q1 2026) ===
- Standardised framework for PPP preparation, appraisal, and implementation

=== KEY SECTORS ===

Agriculture (15% GDP, 60% employment, 30% exports): US$7.2B at 94.8% CAGR (2019-2023).
Mining (12-13.5% GDP, 70% FDI, 80% exports): 3rd largest PGM reserves, largest lithium in Africa, US$12B target.
Tourism: Victoria Falls, Mana Pools, Great Zimbabwe; targeting US$3B+ receipts.
Energy: 2,100MW renewable target by 2030; wind (39GW), hydro (5GW+), IPPs can sell to ZETDC/SAPP.
SEZ & BKPO: 6,000+ha designated; BKPO offers 15% CIT, duty-free capital goods.

=== 2026 REGULATORY CHANGES ===
- Cotton Finance (SI 23/2026): Merchants access offshore/onshore funds
- Tobacco Finance (SI 24/2026): Buyers deemed exporters, net surrender
- Luggage Ware, Printing & Packaging, Electrical Manufacturers duty suspensions (SI 30-32/2026)
- Pipelines Amendment Act: Prohibited construction/blasting within pipeline reserves

=== MOUs Q1 2026 ===
- WFP: PPPs for agriculture & food systems
- UNDP: SDG Impact Investment Mapping Tools

=== INTERNATIONAL ===
- Kenya & Ghana JPCCs, EU-ESA5 EPA negotiations, WTO MC14 (Cameroon), Mining Indaba 2026

DOING BUSINESS:
- DIY Portal: https://zidainvest.com/zida-diy-investor-licensing-portal/
- eRegulations: https://eregulations.zidainvest.com/
- Contact: +263 8688002639-42, info@zidainvest.com
- Address: Cnr Jason Moyo & Sam Nujoma St, ZB Life Towers, 1st Floor, Harare`;
}

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
  q12026Investment: 'US$1.4 billion in investment licences issued in Q1 2026',
  q32025Licences: '21% jump in investment licences in Q3 valued at US$39 billion',
  totalFDI: 'Zimbabwe lured US$1.4bn investment in Q1 2026 per ZIDA',
  diyPortal: 'https://zidainvest.com/zida-diy-investor-licensing-portal/',
  contact: { phone: '+263 8688002639-42', email: 'info@zidainvest.com', address: 'Cnr Jason Moyo & Sam Nujoma St, ZB Life Towers, 1st Floor, Harare' },
  eregulations: 'https://eregulations.zidainvest.com/',
};

export function getZidaContextForPrompt(): string {
  return `ZIMBABWE INVESTMENT AND DEVELOPMENT AGENCY (ZIDA) KNOWLEDGE

ZIDA is Zimbabwe's investment promotion agency, operating under the ZIDA Act (Chapter 14:40). Key facts:
- Zim lured US$1.4 billion in investment in Q1 2026 per ZIDA reports
- Investors can own up to 100% of businesses through General Investment Licenses
- Three investment pathways: General License, PPP, and SEZ
- Over 6,000 hectares designated for Special Economic Zones

KEY SECTORS:

Agriculture (15% GDP, 60% employment, 30% exports):
- US$7.2B sector growing at 94.8% CAGR (2019-2023)
- Opportunities: dairy, horticulture, floriculture, coffee, sugar, soyabean, leather, cotton, cereal milling
- Enabling policies: Command Agriculture, TSP, Vision 2030, Horticulture Recovery Growth Plan

Mining (12-13.5% GDP, 70% FDI, 80% exports):
- US$12B government target
- 3rd largest PGM reserves globally (2.8B tons)
- Largest lithium deposits in Africa (11M tons at Bikita)
- 80% of world chromite resource
- US$1.5B Manhize steel plant now producing rebars
- 100% foreign ownership allowed in mining
- Opportunities: gold, PGM, lithium, chrome, coal, diamonds, mineral processing, mining equipment

Tourism:
- Victoria Falls, Mana Pools (UNESCO), Great Zimbabwe, Eastern Highlands, Hwange, Matopos
- Recovering to 2018 peak of 2.58M arrivals
- Targeting US$3B+ in receipts
- 100% foreign ownership allowed
- ZIDA Tourism Matchmaking Platform available

Energy (renewable focus):
- 2,100MW renewable target by 2030
- Solar, wind (39GW), hydro (5GW+), geothermal (50MW)
- 4,000MW annual power demand
- SAPP regional market: 340M people, US$700B+ economy
- IPPs can sell to ZETDC, SAPP, or Intensive Energy Users
- Tax holidays for BOT/BOOT, 100% profit repatriation, duty-free RE equipment imports

Special Economic Zones:
- 6,000+ hectares designated
- Fiscal incentives including tax holidays and duty-free imports
- BKPO (Business and Knowledge Process Outsourcing) framework available

DOING BUSINESS:
- DIY Investor Licensing Portal: https://zidainvest.com/zida-diy-investor-licensing-portal/
- eRegulations Portal: https://eregulations.zidainvest.com/
- ZIDA Contact: +263 8688002639-42, info@zidainvest.com
- Address: Cnr Jason Moyo & Sam Nujoma St, ZB Life Towers, 1st Floor, Harare`;
}

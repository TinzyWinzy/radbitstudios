export type SadcCountry = {
  code: string;
  name: string;
  slug: string;
  currency: string;
  capital: string;
  language: string;
  dialCode: string;
  region: 'sadc' | 'diaspora';
  description: string;
};

export type DiasporaHub = {
  code: string;
  name: string;
  slug: string;
  language: string;
  description: string;
};

export const SADC_COUNTRIES: SadcCountry[] = [
  { code: 'ZA', name: 'South Africa', slug: 'south-africa', currency: 'ZAR', capital: 'Pretoria', language: 'en', dialCode: '+27', region: 'sadc', description: 'South Africa offers the most developed business infrastructure in SADC, with sophisticated financial systems, established supply chains, and the continent\'s most liquid stock exchange.' },
  { code: 'BW', name: 'Botswana', slug: 'botswana', currency: 'BWP', capital: 'Gaborone', language: 'en', dialCode: '+267', region: 'sadc', description: 'Botswana has one of Africa\'s most stable economies, transparent governance, and the lowest perceived corruption in mainland SADC.' },
  { code: 'ZM', name: 'Zambia', slug: 'zambia', currency: 'ZMW', capital: 'Lusaka', language: 'en', dialCode: '+260', region: 'sadc', description: 'Zambia is a growing mining and agriculture economy with increasing digital adoption and ambitious SME support programmes.' },
  { code: 'MZ', name: 'Mozambique', slug: 'mozambique', currency: 'MZN', capital: 'Maputo', language: 'pt', dialCode: '+258', region: 'sadc', description: 'Mozambique\'s economy is driven by natural gas, mining, and agriculture with Portuguese as the business language and growing tech adoption.' },
  { code: 'NA', name: 'Namibia', slug: 'namibia', currency: 'NAD', capital: 'Windhoek', language: 'en', dialCode: '+264', region: 'sadc', description: 'Namibia offers political stability, a well-regulated financial sector, and strong trade links with South Africa and the EU.' },
  { code: 'MW', name: 'Malawi', slug: 'malawi', currency: 'MWK', capital: 'Lilongwe', language: 'en', dialCode: '+265', region: 'sadc', description: 'Malawi has a growing digital economy with increasing mobile money adoption and a young, entrepreneurial population.' },
  { code: 'LS', name: 'Lesotho', slug: 'lesotho', currency: 'LSL', capital: 'Maseru', language: 'en', dialCode: '+266', region: 'sadc', description: 'Lesotho\'s economy is closely linked to South Africa, with opportunities in textiles, water, and digital services.' },
  { code: 'SZ', name: 'Eswatini', slug: 'eswatini', currency: 'SZL', capital: 'Mbabane', language: 'en', dialCode: '+268', region: 'sadc', description: 'Eswatini offers a stable business environment with strong trade preferences under SACU and AGOA.' },
  { code: 'AO', name: 'Angola', slug: 'angola', currency: 'AOA', capital: 'Luanda', language: 'pt', dialCode: '+244', region: 'sadc', description: 'Angola is a resource-rich economy rebuilding its business infrastructure after decades of investment in diversification beyond oil.' },
  { code: 'CD', name: 'DRC', slug: 'drc', currency: 'CDF', capital: 'Kinshasa', language: 'fr', dialCode: '+243', region: 'sadc', description: 'The DRC is Africa\'s largest country by landmass in Sub-Saharan Africa, rich in minerals with growing tech and services sectors.' },
  { code: 'TZ', name: 'Tanzania', slug: 'tanzania', currency: 'TZS', capital: 'Dodoma', language: 'en', dialCode: '+255', region: 'sadc', description: 'Tanzania offers a stable political environment, growing tourism sector, and increasing digital transformation initiatives.' },
  { code: 'MG', name: 'Madagascar', slug: 'madagascar', currency: 'MGA', capital: 'Antananarivo', language: 'mg', dialCode: '+261', region: 'sadc', description: 'Madagascar has unique biodiversity-related industries, textile manufacturing under AGOA, and a growing tech outsourcing sector.' },
  { code: 'MU', name: 'Mauritius', slug: 'mauritius', currency: 'MUR', capital: 'Port Louis', language: 'en', dialCode: '+230', region: 'sadc', description: 'Mauritius is Africa\'s most business-friendly jurisdiction, with sophisticated financial services and a thriving tech ecosystem.' },
  { code: 'SC', name: 'Seychelles', slug: 'seychelles', currency: 'SCR', capital: 'Victoria', language: 'en', dialCode: '+248', region: 'sadc', description: 'Seychelles has a high-income economy driven by tourism and offshore financial services with strong internet penetration.' },
  { code: 'KM', name: 'Comoros', slug: 'comoros', currency: 'KMF', capital: 'Moroni', language: 'ar', dialCode: '+269', region: 'sadc', description: 'Comoros is an island nation with opportunities in fisheries, tourism, and remittance-linked services.' },
];

export const ZIMBABWE: SadcCountry = {
  code: 'ZW', name: 'Zimbabwe', slug: 'zimbabwe', currency: 'ZiG', capital: 'Harare', language: 'en', dialCode: '+263', region: 'sadc', description: 'Zimbabwe has a resilient private sector, growing tech ecosystem, and the most educated workforce in SADC per capita.'
};

export const DIASPORA_HUBS: DiasporaHub[] = [
  { code: 'GB', name: 'United Kingdom', slug: 'uk', language: 'en', description: 'The UK hosts the largest Zimbabwean diaspora community in Europe, with strong business and investment links to Zimbabwe.' },
  { code: 'US', name: 'United States', slug: 'usa', language: 'en', description: 'The US is home to a growing Zimbabwean diaspora with significant investment in Zimbabwean real estate and business.' },
  { code: 'CA', name: 'Canada', slug: 'canada', language: 'en', description: 'Canada has an active Zimbabwean community with increasing interest in diaspora investment and business setup in Zimbabwe.' },
  { code: 'AU', name: 'Australia', slug: 'australia', language: 'en', description: 'Australia\'s Zimbabwean diaspora is engaged in mining, agriculture, and professional services with strong ties to Zimbabwe.' },
  { code: 'ZA', name: 'South Africa', slug: 'south-africa', language: 'en', description: 'South Africa hosts the largest Zimbabwean diaspora community, with deep cross-border trade and business integration.' },
  { code: 'DE', name: 'Germany', slug: 'germany', language: 'de', description: 'Germany has a growing Zimbabwean professional diaspora with interest in business and investment opportunities back home.' },
  { code: 'NL', name: 'Netherlands', slug: 'netherlands', language: 'nl', description: 'The Netherlands hosts a small but active Zimbabwean diaspora community with business links to SADC.' },
  { code: 'AE', name: 'UAE', slug: 'uae', language: 'en', description: 'The UAE is a key hub for Zimbabwean diaspora business, trade, and investment, particularly Dubai\'s free trade zones.' },
];

export const ALL_SADC = [...SADC_COUNTRIES, ZIMBABWE];

export function getCountryBySlug(slug: string): SadcCountry | undefined {
  return ALL_SADC.find(c => c.slug === slug);
}

export function getDiasporaHubBySlug(slug: string): DiasporaHub | undefined {
  return DIASPORA_HUBS.find(h => h.slug === slug);
}

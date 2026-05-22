export type EntityType = 'municipality' | 'healthcare' | 'state_enterprise' | 'mining';
export type ScraperMethod = 'rss' | 'html' | 'pdf' | 'praz_feed';

export interface ProcuringEntity {
  id: string;
  name: string;
  type: EntityType;
  location?: string;
  tenderUrl?: string;
  scraperMethod: ScraperMethod;
  selectors?: {
    container?: string;
    title?: string;
    deadline?: string;
    link?: string;
  };
  keywords?: string[];
  active: boolean;
}

export const PROCURING_ENTITIES: ProcuringEntity[] = [
  // ── Municipalities ────────────────────────────────────────────────
  {
    id: 'city_harare',
    name: 'City of Harare',
    type: 'municipality',
    location: 'Harare',
    tenderUrl: 'https://www.hararecity.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement', 'supply', 'bid'],
    active: true,
  },
  {
    id: 'city_bulawayo',
    name: 'City of Bulawayo',
    type: 'municipality',
    location: 'Bulawayo',
    tenderUrl: 'https://www.citybyo.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'city_gweru',
    name: 'City of Gweru',
    type: 'municipality',
    location: 'Gweru',
    tenderUrl: 'https://www.gwerucity.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'city_kadoma',
    name: 'City of Kadoma',
    type: 'municipality',
    location: 'Kadoma',
    tenderUrl: 'https://www.kadomacity.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'city_mutare',
    name: 'City of Mutare',
    type: 'municipality',
    location: 'Mutare',
    tenderUrl: 'https://www.cityofmutare.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'chitungwiza_municipality',
    name: 'Chitungwiza Municipality',
    type: 'municipality',
    location: 'Chitungwiza',
    tenderUrl: 'https://www.chitungwizamunicipality.org.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'chivi_rural',
    name: 'Chivi Rural District Council',
    type: 'municipality',
    location: 'Chivi',
    tenderUrl: 'https://www.chivirdc.co.zw/procurement',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  // ── Healthcare ────────────────────────────────────────────────────
  {
    id: 'chitungwiza_hospital',
    name: 'Chitungwiza Central Hospital',
    type: 'healthcare',
    location: 'Chitungwiza',
    tenderUrl: 'https://www.chitungwizahospital.co.zw/procurement',
    scraperMethod: 'html',
    keywords: ['tender', 'supply', 'procurement', 'medical'],
    active: true,
  },
  {
    id: 'chivhu_hospital',
    name: 'Chivhu General Hospital',
    type: 'healthcare',
    location: 'Chivhu',
    tenderUrl: 'https://www.chivhuhospital.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'chivi_hospital',
    name: 'Chivi District Hospital',
    type: 'healthcare',
    location: 'Chivi',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'health', 'medical'],
    active: true,
  },
  {
    id: 'concession_hospital',
    name: 'Concession District Hospital',
    type: 'healthcare',
    location: 'Concession',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'health', 'medical'],
    active: true,
  },
  {
    id: 'drefontein_hospital',
    name: 'Drefontein Mission Hospital',
    type: 'healthcare',
    location: 'Drefontein',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'health', 'mission'],
    active: true,
  },
  // ── State Enterprises ─────────────────────────────────────────────
  {
    id: 'caaz',
    name: 'Civil Aviation Authority of Zimbabwe',
    type: 'state_enterprise',
    location: 'Harare',
    tenderUrl: 'https://www.caaz.co.zw/procurement',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement', 'aviation'],
    active: true,
  },
  {
    id: 'cold_storage',
    name: 'Cold Storage Company',
    type: 'state_enterprise',
    location: 'Bulawayo',
    tenderUrl: 'https://www.csc.co.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement', 'meat', 'cold storage'],
    active: true,
  },
  {
    id: 'competition_commission',
    name: 'Competition and Tariffs Commission',
    type: 'state_enterprise',
    location: 'Harare',
    tenderUrl: 'https://www.compcomm.co.zw/procurement',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'consumer_council',
    name: 'Consumer Council of Zimbabwe',
    type: 'state_enterprise',
    location: 'Harare',
    tenderUrl: 'https://www.ccz.org.zw/tenders',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement'],
    active: true,
  },
  {
    id: 'deposit_protection',
    name: 'Deposit Protection Corporation',
    type: 'state_enterprise',
    location: 'Harare',
    tenderUrl: 'https://www.dpc.co.zw/procurement',
    scraperMethod: 'html',
    keywords: ['tender', 'procurement', 'banking'],
    active: true,
  },
  // ── Industrial / Mining ───────────────────────────────────────────
  {
    id: 'defold_mine',
    name: 'Defold Mine',
    type: 'mining',
    location: 'Defold',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'mining', 'defold'],
    active: true,
  },
  {
    id: 'dorowa_minerals',
    name: 'Dorowa Minerals Limited',
    type: 'mining',
    location: 'Dorowa',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'mining', 'minerals'],
    active: true,
  },
  {
    id: 'deven_engineering',
    name: 'Deven Engineering',
    type: 'mining',
    location: 'Harare',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'engineering', 'mining'],
    active: true,
  },
];

export function getEntitiesByType(type: EntityType): ProcuringEntity[] {
  return PROCURING_ENTITIES.filter(e => e.type === type && e.active);
}

export function getEntityById(id: string): ProcuringEntity | undefined {
  return PROCURING_ENTITIES.find(e => e.id === id && e.active);
}

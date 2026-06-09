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
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'supply', 'bid', 'harare'],
    active: true,
  },
  {
    id: 'city_bulawayo',
    name: 'City of Bulawayo',
    type: 'municipality',
    location: 'Bulawayo',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'bulawayo'],
    active: true,
  },
  {
    id: 'city_gweru',
    name: 'City of Gweru',
    type: 'municipality',
    location: 'Gweru',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'gweru'],
    active: true,
  },
  {
    id: 'city_kadoma',
    name: 'City of Kadoma',
    type: 'municipality',
    location: 'Kadoma',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'kadoma'],
    active: true,
  },
  {
    id: 'city_mutare',
    name: 'City of Mutare',
    type: 'municipality',
    location: 'Mutare',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'mutare'],
    active: true,
  },
  {
    id: 'chitungwiza_municipality',
    name: 'Chitungwiza Municipality',
    type: 'municipality',
    location: 'Chitungwiza',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'chitungwiza'],
    active: true,
  },
  {
    id: 'chivi_rural',
    name: 'Chivi Rural District Council',
    type: 'municipality',
    location: 'Chivi',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'chivi'],
    active: true,
  },
  // ── Healthcare ────────────────────────────────────────────────────
  {
    id: 'chitungwiza_hospital',
    name: 'Chitungwiza Central Hospital',
    type: 'healthcare',
    location: 'Chitungwiza',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'supply', 'procurement', 'medical', 'chitungwiza'],
    active: true,
  },
  {
    id: 'chivhu_hospital',
    name: 'Chivhu General Hospital',
    type: 'healthcare',
    location: 'Chivhu',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'chivhu', 'health'],
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
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'aviation', 'caaz'],
    active: true,
  },
  {
    id: 'cold_storage',
    name: 'Cold Storage Company',
    type: 'state_enterprise',
    location: 'Bulawayo',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'cold storage', 'meat'],
    active: true,
  },
  {
    id: 'competition_commission',
    name: 'Competition and Tariffs Commission',
    type: 'state_enterprise',
    location: 'Harare',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'competition'],
    active: true,
  },
  {
    id: 'consumer_council',
    name: 'Consumer Council of Zimbabwe',
    type: 'state_enterprise',
    location: 'Harare',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'consumer'],
    active: true,
  },
  {
    id: 'deposit_protection',
    name: 'Deposit Protection Corporation',
    type: 'state_enterprise',
    location: 'Harare',
    scraperMethod: 'praz_feed',
    keywords: ['tender', 'procurement', 'deposit', 'banking'],
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

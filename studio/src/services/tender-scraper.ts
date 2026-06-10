/**
 * Re-export barrel — all tender scraper logic now lives in ./tender/
 * This file exists so existing imports like `@/services/tender-scraper` continue to work.
 */
export { type Tender, type TenderSourceConfig, type ScrapeStrategy } from '@/services/tender/types';
export { SECTOR_KEYWORDS, classifySector, determineStatus, enrichTender, isQualityTender, MOCK_TENDERS } from '@/services/tender/types';
export { scrapeSource } from '@/services/tender/scrape-engine';
export { TENDER_SOURCES } from '@/services/tender/configs';
export { scrapeAllTenders, getLatestTenders, getTendersForUser } from '@/services/tender/orchestrator';

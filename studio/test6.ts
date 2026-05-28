import { scrapeAllTenders } from './src/services/tender-scraper';

async function test() {
  const result = await scrapeAllTenders();
  console.log('Tenders scraped:', result.scraped);
  console.log('Errors:', result.errors);
  console.log('Sample:', result.tenders.map(t => t.sourceName));
}

test();

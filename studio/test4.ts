import { getLatestTenders } from './src/services/tender-scraper';

async function test() {
  try {
    const tenders1 = await getLatestTenders({ limit: 100 });
    console.log(`No sector filter: ${tenders1.length} tenders items.`);

    const tenders2 = await getLatestTenders({ limit: 100, sector: 'Technology' });
    console.log(`Technology filter: ${tenders2.length} tenders items.`);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();

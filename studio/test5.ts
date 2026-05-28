import { getLatestTenders } from './src/services/tender-scraper';

async function test() {
  try {
    const tenders = await getLatestTenders({ limit: 100 });
    console.log(tenders.map(t => ({ id: t.id, region: t.region, status: t.status })));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();

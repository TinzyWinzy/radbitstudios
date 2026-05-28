import { getLatestNews } from './src/services/news-scraper';

async function test() {
  try {
    const news1 = await getLatestNews({ limit: 100 });
    console.log(`No industry filter: ${news1.length} news items.`);

    const news2 = await getLatestNews({ limit: 100, industry: 'Technology' });
    console.log(`Technology filter: ${news2.length} news items.`);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();

import { loadNews } from './src/lib/scraper-storage';

async function test() {
  try {
    const news = await loadNews();
    console.log(`Loaded ${news.length} news items from DB.`);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();

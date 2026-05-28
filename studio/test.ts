import { scrapeAllFeeds } from './src/services/news-scraper';
import { loadNews } from './src/lib/scraper-storage';

async function test() {
  try {
    const res = await scrapeAllFeeds();
    console.log(`Scraped: ${res.scraped}, Errors: ${res.errors}`);
    
    const news = await loadNews();
    console.log(`Loaded ${news.length} news items from DB.`);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();

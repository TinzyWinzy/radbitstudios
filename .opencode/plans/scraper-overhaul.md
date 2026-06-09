# Scraper Overhaul Plan

## Overview

Current scrapers produce low-quality output — only 1 of 25+ news sources yields articles, tender data is mostly PDF links not actual tenders, classification is weak, and there's no automated scheduling.

**Location:** `studio/src/services/news-scraper.ts`, `studio/src/services/tender-scraper.ts`

---

## Phase 1: Fix Data Quality Issues

### 1.1 Fix Source Names & Feed URLs (News)

| Problem | Fix |
|---------|-----|
| `heraldonline.co.zw` feed mapped as "Business Weekly Zimbabwe" | Review `FEEDS` array at `news-scraper.ts:39-363` — verify each `url`, `sourceName`, and `region` against actual RSS output |
| All articles come from one feed | Check RSS parser is working for other feeds; add error logging per feed to see failures |

**Checklist:**
- [ ] Verify each of the 25+ feed URLs by testing them manually
- [ ] Confirm `sourceName` and `region` match the actual source
- [ ] Remove or replace dead feeds

### 1.2 Improve News Category Classification

**File:** `news-scraper.ts:400-406`

Current approach: keyword matching against `feed.industryMapping`. Many articles fall to `"general"`.

**Fix:**
- Add more keywords per category (especially finance terms like "ZiG", "ZWG", "$")
- For articles classified as `general`, do a second pass against a global keyword set (not just per-feed)
- Consider using the AI scoring system (`content-scorer`) for classification as a fallback

**Checklist:**
- [ ] Expand keyword lists in each feed's `industryMapping`
- [ ] Add fallback global classification for `general` articles
- [ ] Verify with real article titles

### 1.3 Improve Industry Tags Extraction

**File:** `news-scraper.ts:408-414`

Current: matches exact sector names or first-word of sector name (e.g., "Technology" from "Technology"). Too narrow.

**Fix:**
- Add synonym mapping (e.g., "farming" → "Agriculture", "bank" → "Financial Services")
- Extract from category as well (e.g., if category is "technology", add "Technology" tag)
- Use keyword-based mapping like the category system

**Checklist:**
- [ ] Create synonym map for all 17 sectors
- [ ] Add category-based tag inference
- [ ] Test against real article data

### 1.4 Fix Tender Sector Classification

**File:** `tender-scraper.ts:32-45`

**Problem:** "procurement" keyword in `Retail & Wholesale` list causes UNDP general items to be misclassified as retail.

**Fix:**
- Remove overly broad keywords ("procurement", "supplies" from Retail & Wholesale)
- "procurement" should not be a sector keyword at all — it's the subject, not a sector
- Add more specific keywords per sector

**Checklist:**
- [ ] Review all 12 sector keyword lists for overlaps
- [ ] Remove "procurement" and other generic terms
- [ ] Add domain-specific keywords

### 1.5 Filter Out Non-Tender Items

**File:** `tender-scraper.ts`

**Problem:** PRAZ, IDBZ, UNDP scrapers pick up PDF policy documents, page navigation links, and category pages as "tenders".

**Fix:**
- Add minimum title quality filter (>10 chars, no "Download" prefix)
- Filter out items where description contains "Download" or ends with `.pdf`
- For UNDP: only include items that appear to be actual RFQ/ITB/RFP postings, not policy pages
- Set a minimum confidence threshold — if a source consistently returns PDF links, flag it

**Checklist:**
- [ ] Add title quality filter
- [ ] Filter out PDF download links
- [ ] Add per-source quality scoring

### 1.6 Fix URL Deduplication Bug

**File:** `news-scraper.ts:96-97` (log file)

**Observation:** The log shows the same items being fetched twice in each run (10 unique + 10 duplicates). The dedup might be failing because the RSS parser returns items twice via different selectors.

**Checklist:**
- [ ] Debug why RSS items appear twice
- [ ] Verify dedup by MD5 of URL works correctly

---

## Phase 2: Fix Source Coverage

### 2.1 Debug RSS Feed Failures

**Problem:** Out of 25+ news sources, only `heraldonline.co.zw` RSS feed returns data.

**Investigation needed:**
- Test each RSS feed URL independently
- Check if timeout (15s) is too short for some feeds
- Check if rate limiting is blocking feeds (5 requests/60s per RSS source)
- Check if old articles are being filtered out (>7 day filter at line 438)

**Checklist:**
- [ ] Test each RSS URL manually
- [ ] Increase timeout for slow feeds (15s → 30s)
- [ ] Log which feeds fail and why (timeout, parse error, empty, etc.)
- [ ] Add feed health tracking to Firestore via `recordSourceFetch`

### 2.2 Debug HTML Scraper Failures

**Problem:** HTML scrapers (Bulawayo24, NewsDay, ZimLive, TechZim, 263Chat) return nothing.

**Investigation:**
- The CSS selectors at `news-scraper.ts:491-505` are generic guesses — each site needs a custom selector
- Sites may have anti-bot protections

**Fix:**
- Create per-site CSS selector configuration instead of one-size-fits-all
- Add per-site selectors to `FeedConfig` type
- Add custom headers per site (some block the default Chrome UA)

**Checklist:**
- [ ] Inspect each HTML site's actual DOM structure
- [ ] Add per-site selectors to `FeedConfig`
- [ ] Test each HTML scraper independently

### 2.3 Fix Tender Source Coverage

**Problem:** proc.gov.zw API returns empty, so mock data is used as fallback. Only PRAZ, IDBZ, UNDP contribute (with low-quality data).

**Checklist:**
- [ ] Test `https://proc.gov.zw/api/tenders` independently
- [ ] Verify Bank scrapers (Stanbic, CBZ, FBC, NMB, CABS)
- [ ] Verify Telecom scrapers (Econet, NetOne, TelOne)
- [ ] Verify international sources (AfDB, World Bank, USAID, SADC, SA eTenders)
- [ ] Verify aggregator sites (TendersOnTime, TendersInfo, GlobalTenders, etc.)

### 2.4 Fix Entity Scraper

**File:** `studio/src/services/tender/entity-scraper.ts`

**Entities:** 23 procuring entities (municipalities, hospitals, state enterprises, mining)

**Problem:**
- Many URLs look like placeholders (e.g., `https://www.hararecity.co.zw/tenders` — does this exist?)
- HTML method using regex-based link extraction is brittle
- Only stored to Firestore (`scraped_items`), not merged into main tender list properly

**Checklist:**
- [ ] Verify each entity URL is real
- [ ] Add per-entity CSS selectors (currently in data model but unused)
- [ ] Add logging to see which entities succeed/fail
- [ ] Merge entity tenders into main tender list in `scrapeAllTenders()`, not just in `getLatestTenders()`

---

## Phase 3: Scheduling & Automation

### 3.1 Add Built-In Cron Scheduling

**Current:** No scheduler — relies on external cron hitting API routes with `CRON_SECRET`

**Proposed approach:**
- Use GitHub Actions with cron triggers (already has uptime workflow at `.github/workflows/uptime.yml`)
- Add new workflows:
  - `scrape-news.yml` — runs every 2 hours
  - `scrape-tenders.yml` — runs every 6 hours
  - `scrape-entities.yml` — runs every 12 hours

**Config:**
```yaml
# .github/workflows/scrape-news.yml
on:
  schedule:
    - cron: '0 */2 * * *'  # every 2 hours
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://your-site.com/api/scraper/news \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Checklist:**
- [ ] Create 3 GitHub Actions workflow files
- [ ] Set `CRON_SECRET` in GitHub Secrets
- [ ] Verify scheduled runs via action logs

### 3.2 Add Retry Logic

**Current:** Failed scrapes are logged and skipped with no retry.

**Fix:** Add retry with exponential backoff for failed sources:
- On failure: wait 1s, retry once
- On second failure: log and skip
- Track failures in Firestore for alerting

**Checklist:**
- [ ] Add retry wrapper in `scraper-cache.ts` or a new utility
- [ ] Apply to RSS and HTML news scrapers
- [ ] Apply to tender scrapers

### 3.3 Add Source Health Dashboard

**Current:** `recordSourceFetch()` exists in `source-store.ts` but has no UI.

**Proposal:** Add a simple admin dashboard at `/admin/scrapers` showing:
- Per-source success/failure rate
- Last fetch time
- Number of items produced
- Error messages

**Checklist:**
- [ ] Create admin page to display source health
- [ ] Store health data in Firestore/PostgreSQL

### 3.4 Add Incremental Scraping

**Current:** Every scrape fetches ALL sources from scratch.

**Fix:** Add `lastScrapedAt` tracking per source. Skip sources scraped within their refresh window (e.g., skip RSS feeds scraped <30 min ago).

**Checklist:**
- [ ] Store `lastScrapedAt` per source
- [ ] Skip sources that don't need refreshing
- [ ] Make refresh windows configurable

---

## Execution Order

```
Phase 1: Data Quality (highest priority — fixes what's already there)
  → 1.4 Fix sector keywords (quick fix, big impact)
  → 1.5 Filter non-tenders (quick fix, big impact)
  → 1.2 Improve news classification (medium effort)
  → 1.3 Improve industry tags (medium effort)
  → 1.1 Fix source names (verification task)

Phase 2: Source Coverage (increases volume)
  → 2.1 Debug RSS feeds (parallel with Phase 1)
  → 2.3 Debug tender sources (parallel with Phase 1)
  → 2.4 Fix entity scraper (medium effort)
  → 2.2 Debug HTML scrapers (higher effort)

Phase 3: Scheduling & Automation (operational excellence)
  → 3.1 GitHub Actions cron workflows
  → 3.2 Retry logic
  → 3.3 Source health dashboard
  → 3.4 Incremental scraping
```

---

## Verification

After each phase:
1. Run `npm test` — all 242+ tests must pass
2. Run a dry scrape and inspect output structure (matches `NewsArticle` and `Tender` types)
3. Check `data/backup/` for persisted output

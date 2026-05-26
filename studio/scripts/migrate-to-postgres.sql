-- Radbit SME Hub: SQLite -> Supabase/PostgreSQL Migration
-- Run this in the Supabase SQL Editor (or psql) to create the scraper tables.

-- ─── tenders ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  organization TEXT,
  sourceUrl TEXT,
  sourceName TEXT,
  publishedAt TEXT,
  closingDate TEXT,
  value TEXT,
  category TEXT,
  sector TEXT,
  region TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'open',
  synced INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (NOW()::TEXT),
  updatedAt TEXT DEFAULT (NOW()::TEXT)
);

CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_sector ON tenders(sector);
CREATE INDEX IF NOT EXISTS idx_tenders_region ON tenders(region);
CREATE INDEX IF NOT EXISTS idx_tenders_publishedAt ON tenders(publishedAt DESC);

-- ─── news ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  sourceUrl TEXT,
  sourceName TEXT,
  publishedAt TEXT,
  category TEXT DEFAULT 'general',
  industryTags TEXT,
  region TEXT,
  synced INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (NOW()::TEXT),
  updatedAt TEXT DEFAULT (NOW()::TEXT)
);

CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_region ON news(region);
CREATE INDEX IF NOT EXISTS idx_news_publishedAt ON news(publishedAt DESC);

-- ─── sync_log ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  records_synced INTEGER,
  status TEXT,
  error TEXT,
  createdAt TEXT DEFAULT (NOW()::TEXT)
);

-- ─── RLS (optional) ─────────────────────────────────────────────────────────
-- If you enable Row Level Security, allow the service_role to access everything.
-- The connection string from Supabase Dashboard -> Settings -> Database uses the
-- postgres role by default, which bypasses RLS. Only uncomment if you create a
-- separate limited user.
--
-- ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow all" ON tenders FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all" ON news FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all" ON sync_log FOR ALL USING (true) WITH CHECK (true);

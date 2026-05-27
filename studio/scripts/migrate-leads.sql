-- Create leads table for Radbit Inc consultancy inquiries
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company_name TEXT,
  industry TEXT,
  service_interest TEXT,
  budget_range TEXT,
  message TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'new',
  createdAt TEXT DEFAULT (NOW()::TEXT),
  updatedAt TEXT DEFAULT (NOW()::TEXT)
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(work_email);

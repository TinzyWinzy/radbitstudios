# Database Schema — Radbit SME Hub

## Technology: PostgreSQL 15+ with Row-Level Security

## Entity Relationship

### USERS & TENANCY
```sql
-- ============================================
-- CORE: Users
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) NOT NULL UNIQUE,  -- E.164 format, e.g. +263771234567
    email           VARCHAR(255) UNIQUE,
    password_hash   VARCHAR(255),
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    language        VARCHAR(5) NOT NULL DEFAULT 'en',  -- en, sn, nd, pt, fr
    country_code    CHAR(2) NOT NULL DEFAULT 'ZW',    -- ISO 3166-1 alpha-2
    region_code     VARCHAR(10) DEFAULT 'SADC',
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ  -- Soft delete for GDPR
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_users_language ON users(language);

-- ============================================
-- BUSINESS PROFILES (One user can have many)
-- ============================================
CREATE TABLE business_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name        VARCHAR(255) NOT NULL,
    reg_number          VARCHAR(50),  -- ZIMRA/PACRA/CIPC per country
    industry_code       VARCHAR(20),  -- ISIC v4
    employee_count_band VARCHAR(20),  -- '1-5', '6-20', '21-50', '51-200', '200+'
    annual_revenue_band VARCHAR(20),  -- '$0-5k', '$5k-20k', '$20k-100k', '$100k+'
    currency_preference VARCHAR(3) NOT NULL DEFAULT 'USD',  -- ZIG, USD, ZAR, BWP, MZN
    verified_status     VARCHAR(20) NOT NULL DEFAULT 'unverified'
                        CHECK (verified_status IN ('unverified','pending','verified','premium')),
    business_description TEXT,
    max_assessment_score SMALLINT CHECK (max_assessment_score BETWEEN 0 AND 100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_user ON business_profiles(user_id);
CREATE INDEX idx_business_country ON business_profiles( country_code );  -- inherited pattern

-- ============================================
-- BUSINESS ADDRESSES
-- ============================================
CREATE TABLE business_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    address_type    VARCHAR(20) NOT NULL CHECK (address_type IN ('physical','postal','billing')),
    line1           VARCHAR(255) NOT NULL,
    line2           VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    province        VARCHAR(100),
    country_code    CHAR(2) NOT NULL,
    postal_code     VARCHAR(20),
    gps_lat         NUMERIC(10,7),
    gps_lng         NUMERIC(10,7),
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_address_business ON business_addresses(business_id);
CREATE INDEX idx_address_gps ON business_addresses USING gist (ll_to_earth(gps_lat, gps_lng));
```

### ASSESSMENT ENGINE
```sql
-- ============================================
-- ASSESSMENT FRAMEWORKS (versioned per country)
-- ============================================
CREATE TABLE assessment_frameworks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version         VARCHAR(10) NOT NULL,  -- '1.2', '2.0'
    country_code    CHAR(2) NOT NULL DEFAULT 'ZW',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    dimensions      JSONB NOT NULL DEFAULT '[]',
    -- dimensions: [{"key":"finance","weight":0.2},{"key":"marketing","weight":0.2},...]
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_framework_active ON assessment_frameworks(country_code) WHERE is_active = true;

-- ============================================
-- ASSESSMENT QUESTIONS
-- ============================================
CREATE TABLE assessment_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id    UUID NOT NULL REFERENCES assessment_frameworks(id) ON DELETE CASCADE,
    question_order  SMALLINT NOT NULL,
    config          JSONB NOT NULL,
    -- config: {
    --   "question_key": "question.001",
    --   "options": [
    --     {"key": "a", "score": 1, "i18n_key": "question.001.option.a"},
    --     {"key": "b", "score": 2, "i18n_key": "question.001.option.b"}
    --   ],
    --   "branching": {"a": null, "b": "question.005"}
    -- }
    i18n_base_key   VARCHAR(100) NOT NULL,
    dimension       VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_framework ON assessment_questions(framework_id, question_order);

-- ============================================
-- ASSESSMENT RESPONSES
-- ============================================
CREATE TABLE assessment_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id     UUID REFERENCES business_profiles(id),
    framework_id    UUID NOT NULL REFERENCES assessment_frameworks(id),
    answers         JSONB NOT NULL,
    -- answers: [{"question_id": "...", "selected_key": "b", "score": 3}, ...]
    maturity_score  NUMERIC(5,2) CHECK (maturity_score BETWEEN 0 AND 100),
    dimension_scores JSONB,
    -- dimension_scores: {"finance": 75, "marketing": 40, "operations": 60, ...}
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    device_info     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_user ON assessment_responses(user_id);
CREATE INDEX idx_responses_score ON assessment_responses(maturity_score);

-- ============================================
-- ASSESSMENT REPORTS
-- ============================================
CREATE TABLE assessment_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id         UUID NOT NULL UNIQUE REFERENCES assessment_responses(id) ON DELETE CASCADE,
    pdf_url             TEXT,
    ai_summary          TEXT,
    recommended_actions JSONB,
    -- recommended_actions: [{"action": "Set up Paynow", "priority": "high", "dimension": "finance"}, ...]
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### TENDER SYSTEM
```sql
-- ============================================
-- TENDERS
-- ============================================
CREATE TABLE tenders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    description         TEXT,
    issuing_authority   VARCHAR(255),
    country_code        CHAR(2),
    industry_tags       TEXT[],
    deadline            TIMESTAMPTZ,
    budget_range_min    NUMERIC(19,2),
    budget_range_max    NUMERIC(19,2),
    currency            VARCHAR(3) DEFAULT 'USD',
    document_urls       JSONB,
    source_url          TEXT,
    scraped_at          TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','closing_soon','closed','awarded')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenders_country ON tenders(country_code);
CREATE INDEX idx_tenders_deadline ON tenders(deadline) WHERE status IN ('open','closing_soon');
CREATE INDEX idx_tenders_tags ON tenders USING gin(industry_tags);
CREATE INDEX idx_tenders_search ON tenders USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- TENDER APPLICATIONS
-- ============================================
CREATE TABLE tender_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tender_id       UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    business_id     UUID NOT NULL REFERENCES business_profiles(id),
    application_data JSONB NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','submitted','won','lost')),
    applied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, tender_id)
);

CREATE INDEX idx_applications_user ON tender_applications(user_id);
CREATE INDEX idx_applications_tender ON tender_applications(tender_id);

-- ============================================
-- TENDER ALERTS (user subscriptions)
-- ============================================
CREATE TABLE tender_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id     UUID REFERENCES business_profiles(id),
    rules           JSONB NOT NULL,
    -- rules: {"industries": ["agribusiness", "tech"], "min_budget": 1000,
    --         "countries": ["ZW", "ZA"], "keywords": ["solar", "irrigation"]}
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON tender_alerts(user_id);
```

### AI TOOLKIT
```sql
-- ============================================
-- AI GENERATIONS (history)
-- ============================================
CREATE TABLE ai_generations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id     UUID REFERENCES business_profiles(id),
    generation_type VARCHAR(50) NOT NULL,
    -- 'logo', 'content', 'financial_projection', 'business_plan',
    -- 'slogan', 'competitor_analysis', 'profile'
    prompt          TEXT,
    output_url      TEXT,
    tokens_used     INTEGER,
    cost_usd        NUMERIC(10,6),
    model_used      VARCHAR(50) DEFAULT 'gemini-2.0-flash',
    status          VARCHAR(20) NOT NULL DEFAULT 'completed'
                    CHECK (status IN ('queued','processing','completed','failed')),
    error_message   TEXT,
    cached_result   BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generations_user ON ai_generations(user_id, created_at DESC);
CREATE INDEX idx_generations_type ON ai_generations(generation_type);
CREATE INDEX idx_generations_cost ON ai_generations(cost_usd);

-- ============================================
-- AI CREDITS LEDGER (append-only)
-- ============================================
CREATE TABLE ai_credits_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL
                     CHECK (transaction_type IN ('purchase','grant','usage','expiry','refund')),
    amount          INTEGER NOT NULL,
    balance_after   INTEGER NOT NULL,
    reference_id    UUID,  -- FK to ai_generations for usage, invoices for purchase
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_user ON ai_credits_ledger(user_id, created_at DESC);
```

### PAYMENTS & BILLING
```sql
-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                VARCHAR(20) NOT NULL CHECK (plan IN ('free','growth','pro','enterprise')),
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','past_due','canceled','expired')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end  TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    trial_end           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(status) WHERE status = 'active';

-- ============================================
-- INVOICES (multi-currency)
-- ============================================
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    amount          NUMERIC(19,4) NOT NULL,
    currency_code   VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rate   NUMERIC(19,6),
    exchange_snapshot_at TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','overdue','cancelled','refunded')),
    paid_at         TIMESTAMPTZ,
    due_at          TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id, created_at DESC);
CREATE INDEX idx_invoices_status ON invoices(status) WHERE status = 'overdue';

-- ============================================
-- PAYMENT METHODS
-- ============================================
CREATE TABLE payment_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(20) NOT NULL CHECK (provider IN ('ecocash','onemoney','innbucks','stripe','payfast')),
    provider_token  TEXT,  -- Encrypted at application level
    is_default      BOOLEAN NOT NULL DEFAULT false,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id) WHERE is_default = true;

-- ============================================
-- TRANSACTIONS (append-only ledger)
-- ============================================
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_id      UUID REFERENCES invoices(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('payment','refund','payout','fee')),
    amount          NUMERIC(19,4) NOT NULL,
    currency_code   VARCHAR(3) NOT NULL,
    provider_ref    VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','completed','failed')),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_provider ON transactions(provider_ref) WHERE provider_ref IS NOT NULL;
```

### SADC COMPLIANCE & TAX
```sql
-- ============================================
-- TAX REGIMES (per country)
-- ============================================
CREATE TABLE tax_regimes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code    CHAR(2) NOT NULL UNIQUE,
    regime_name     VARCHAR(100) NOT NULL,
    corporate_tax_rate NUMERIC(5,2),
    vat_rate        NUMERIC(5,2),
    currency_code   VARCHAR(3) NOT NULL,
    fiscal_year_start DATE NOT NULL,
    rules           JSONB,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TAX OBLIGATIONS (per business)
-- ============================================
CREATE TABLE tax_obligations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    tax_type        VARCHAR(50) NOT NULL,  -- 'income_tax', 'vat', 'paye', 'withholding'
    due_date        DATE NOT NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    estimated_amount NUMERIC(19,2),
    paid_amount     NUMERIC(19,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','filed','paid','overdue')),
    filed_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tax_obligations_business ON tax_obligations(business_id, due_date);
CREATE INDEX idx_tax_obligations_overdue ON tax_obligations(status, due_date) WHERE status = 'pending' AND due_date < NOW();
```

### AUDIT LOGGING
```sql
-- ============================================
-- AUDIT LOG (immutable)
-- ============================================
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    country_code    CHAR(2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_log_2026_01 PARTITION OF audit_log
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_log_2026_02 PARTITION OF audit_log
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... automated via pg_partman

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Stored procedure for GDPR anonymization
CREATE OR REPLACE PROCEDURE gdpr_anonymize_user(p_user_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users SET
        phone = 'anonymized_' || gen_random_uuid()::text,
        email = 'anonymized_' || gen_random_uuid()::text || '@redacted.com',
        display_name = 'Deleted User',
        avatar_url = NULL,
        password_hash = NULL,
        deleted_at = NOW()
    WHERE id = p_user_id;

    UPDATE business_profiles SET
        company_name = 'Redacted Business',
        reg_number = NULL,
        business_description = NULL
    WHERE user_id = p_user_id;

    INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_values)
    VALUES (p_user_id, 'GDPR_ANONYMIZE', 'users', p_user_id,
            '{"action": "GDPR deletion request completed"}');
END;
$$;
```

## Row-Level Security (RLS) for Multi-Tenant Isolation

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own row
CREATE POLICY user_isolation ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::UUID);

-- Business profiles: own or team members (future)
CREATE POLICY business_isolation ON business_profiles
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Service role bypass (for admin operations)
CREATE POLICY service_role_bypass ON users
    FOR ALL
    USING (current_setting('app.role') = 'service');
```

## Indexing Strategy (Top 20 Queries)

| # | Query Pattern | Index Used | Type | Est. Scan |
|---|---|---|---|---|
| 1 | `SELECT * FROM tenders WHERE country_code = 'ZW' AND status = 'open' ORDER BY deadline` | `idx_tenders_country`, `idx_tenders_deadline` | B-tree composite | 5ms at 100k |
| 2 | `SELECT * FROM tenders WHERE to_tsvector(title) @@ to_tsquery('solar')` | `idx_tenders_search` | GIN | 15ms |
| 3 | `SELECT * FROM assessment_responses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1` | `idx_responses_user` | B-tree | 1ms |
| 4 | `SELECT * FROM ai_generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20` | `idx_generations_user` | B-tree | 2ms |
| 5 | `SELECT * FROM invoices WHERE user_id = $1 AND status = 'overdue'` | `idx_invoices_user`, `idx_invoices_status` | B-tree partial | 2ms |
| 6 | `SELECT * FROM tenders WHERE industry_tags && ARRAY['agribusiness']` | `idx_tenders_tags` | GIN | 10ms |
| 7 | `SELECT * FROM audit_log WHERE entity_type = 'tender_applications' ORDER BY created_at DESC LIMIT 100` | `idx_audit_entity` | B-tree | 3ms |
| 8 | `SELECT * FROM tax_obligations WHERE business_id = $1 AND status = 'pending' ORDER BY due_date` | `idx_tax_obligations_business` | B-tree | 2ms |
| 9 | `SELECT * FROM business_addresses WHERE business_id = $1 AND is_default = true` | `idx_address_business` | B-tree | 1ms |
| 10 | `SELECT * FROM ai_credits_ledger WHERE user_id = $1 ORDER BY created_at DESC` | `idx_credits_user` | B-tree | 2ms |

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum VerifiedStatus {
  unverified
  pending
  verified
  premium
}

enum TenderStatus {
  open
  closing_soon
  closed
  awarded
}

model User {
  id              String   @id @default(uuid()) @db.Uuid
  phone           String   @unique
  email           String?  @unique
  passwordHash    String?  @map("password_hash")
  displayName     String?  @map("display_name")
  avatarUrl       String?  @map("avatar_url")
  language        String   @default("en")
  countryCode     String   @default("ZW") @map("country_code")
  regionCode      String?  @default("SADC") @map("region_code")
  whatsappOptIn   Boolean  @default(false) @map("whatsapp_opt_in")
  isVerified      Boolean  @default(false) @map("is_verified")
  deletedAt       DateTime? @map("deleted_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  businessProfiles    BusinessProfile[]
  assessmentResponses AssessmentResponse[]
  tenderApplications  TenderApplication[]
  tenderAlerts        TenderAlert[]
  aiGenerations       AiGeneration[]
  aiCreditsLedger     AiCreditsLedger[]
  subscriptions       Subscription[]
  invoices            Invoice[]
  paymentMethods      PaymentMethod[]
  transactions        Transaction[]
  auditLogs           AuditLog[]

  @@map("users")
}

model BusinessProfile {
  id                  String         @id @default(uuid()) @db.Uuid
  userId              String         @map("user_id") @db.Uuid
  companyName         String         @map("company_name")
  regNumber           String?        @map("reg_number")
  industryCode        String?        @map("industry_code")
  employeeCountBand   String?        @map("employee_count_band")
  annualRevenueBand   String?        @map("annual_revenue_band")
  currencyPreference  String         @default("USD") @map("currency_preference")
  verifiedStatus      VerifiedStatus @default(unverified) @map("verified_status")
  businessDescription String?        @map("business_description")
  maxAssessmentScore  Int?           @map("max_assessment_score")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  addresses          BusinessAddress[]
  assessmentResponses AssessmentResponse[]
  tenderApplications TenderApplication[]
  taxObligations     TaxObligation[]

  @@map("business_profiles")
}

// Remaining models follow same pattern as SQL above
// Full Prisma schema at prisma/schema.prisma
```

## Performance Notes
- All `NUMERIC` types used for financial calculations — never `FLOAT`/`DOUBLE`
- Append-only ledger for credits and transactions ensures audit trail integrity
- JSONB for flexible field storage (assessment config, alert rules, application data)
- GIN indexes for full-text search on tenders and array containment on industry_tags
- RLS policies use application-level session variables for tenant isolation
- Partition audit_log by month for query performance and data retention
- `pg_partman` for automated partition management

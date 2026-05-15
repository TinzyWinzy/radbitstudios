# AI Gateway — Radbit SME Hub

## Architecture

```
User Request
    │
    ▼
┌────────────────────────────────────────────┐
│           AI Gateway (NestJS)              │
│                                            │
│  1. Request Validation (Zod)               │
│  2. Token Budget Check (Redis)             │
│  3. Semantic Cache Lookup (Pinecone)       │
│  4. Route to Model (cost-optimized)        │
│  5. Response Stream / Return               │
│  6. Log + Deduct Credits (ledger)          │
└────────────────────────────────────────────┘
    │
    ├── Simple tasks ──► GPT-4o-mini / Claude 3 Haiku  ($0.15/1M input)
    ├── Complex tasks ─► GPT-4o / Claude 3.5 Sonnet    ($2.50/1M input)
    ├── Images ────────► DALL-E 3 / SDXL via Replicate ($0.04-0.08/image)
    └── Embeddings ────► text-embedding-3-small        ($0.02/1M input)
```

## OpenAPI 3.0 Spec

```yaml
openapi: 3.0.3
info:
  title: Radbit AI Gateway API
  version: 1.0.0
  description: AI-powered business tools for Zimbabwean SMEs
servers:
  - url: https://api.radbitsmehub.co.zw/ai/v1

paths:
  /generate:
    post:
      summary: Generate AI content (text)
      operationId: generateContent
      x-model-routing:
        simple: [gpt-4o-mini, claude-3-haiku]
        complex: [gpt-4o, claude-3-sonnet]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [prompt_type, business_description]
              properties:
                prompt_type:
                  type: string
                  enum:
                    - business_plan
                    - financial_projection
                    - slogan
                    - competitor_analysis
                    - social_media_post
                    - email_template
                    - profile_description
                    - tender_application_letter
                business_description:
                  type: string
                  maxLength: 2000
                business_name:
                  type: string
                industry:
                  type: string
                currency:
                  type: string
                  default: USD
                extra_context:
                  type: string
                  maxLength: 1000
                model:
                  type: string
                  enum: [auto, gpt-4o-mini, gpt-4o, claude-3-haiku, claude-3-sonnet]
                  default: auto
                stream:
                  type: boolean
                  default: false
      responses:
        '200':
          description: Generated content
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  content:
                    type: string
                  model_used:
                    type: string
                  tokens_used:
                    type: integer
                  cost_usd:
                    type: number
                    format: float
                  cached:
                    type: boolean
                  citations:
                    type: array
                    items:
                      type: object
                      properties:
                        source:
                          type: string
                        text:
                          type: string
        '402':
          description: Insufficient AI credits
        '503':
          description: AI service degraded, template response served

  /generate/image:
    post:
      summary: Generate an image (logo, banner, social media)
      operationId: generateImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [prompt]
              properties:
                prompt:
                  type: string
                  maxLength: 1000
                style:
                  type: string
                  enum: [modern, minimal, african_patterns, professional]
                  default: modern
                size:
                  type: string
                  enum: [256x256, 512x512, 1024x1024]
                  default: 1024x1024
      responses:
        '200':
          description: Generated image URL

  /embed:
    post:
      summary: Generate text embeddings
      operationId: generateEmbeddings
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                model:
                  type: string
                  default: text-embedding-3-small
      responses:
        '200':
          description: Embedding vector

  /match-tenders:
    post:
      summary: Match tenders to business profile using embeddings
      operationId: matchTenders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [business_profile_id]
              properties:
                business_profile_id:
                  type: string
                  format: uuid
                limit:
                  type: integer
                  default: 10
      responses:
        '200':
          description: Ranked tender list

  /cache/stats:
    get:
      summary: Semantic cache hit rate
      operationId: getCacheStats
      responses:
        '200':
          description: Cache statistics (hit rate, size, top queries)
```

## Prompt Library (20 Vetted Prompts)

### 1. Business Plan Generator (Complex → GPT-4o/Claude Sonnet)
```
You are an expert business consultant specializing in Zimbabwean and SADC markets.
Generate a professional business plan in structured JSON format.

Business Name: {business_name}
Industry: {industry}
Description: {business_description}
Target Country: Zimbabwe
Currency: {currency}

{RAG_context}

Output the following sections as a JSON object:
1. executive_summary: 2-3 paragraph overview
2. market_analysis: Include SADC-specific market size, competitors, regulatory environment
3. financial_projections: 3-year table with columns: Year, Revenue ({currency}), Costs, Profit, Growth %.
   Use realistic Zimbabwean numbers. Factor in 25% annual inflation.
4. operations_plan: Staff, equipment, location, technology needs
5. risk_analysis: Top 5 risks (including load shedding, forex shortages, regulatory changes) and mitigations
6. funding_required: Amount needed and proposed use of funds
```

### 2. Financial Projector (Complex → GPT-4o/Claude Sonnet, uses function calling)
```
You are a financial analyst for Zimbabwean SMEs.
Generate a detailed financial projection.

Input:
- Revenue sources: {revenue_sources}
- Operating costs: {operating_costs}
- Current currency: {currency}
- Business type: {business_type}

{RAG_context: ZIMRA tax tables}

Use function calling to calculate:
1. Monthly cash flow forecast (12 months)
2. Break-even analysis (units or months)
3. Tax liability estimate using current ZIMRA rates:
   - QPD: 1.5% of turnover (if turnover < $240k USD equiv)
   - Corporate income tax: 24.72% of net profit
   - VAT: 15% if annual turnover > $40k USD equiv
4. Profit & loss statement (annual)
5. Key metrics: Gross margin, Net margin, Monthly burn rate, Runway

Return structured JSON with all calculations verified server-side.
```

### 3. Slogan Generator (Simple → GPT-4o-mini/Claude Haiku)
```
Generate 10 catchy, memorable slogans for a Zimbabwean {industry} business called "{business_name}".

The business is described as: {business_description}

Requirements:
- Mix of Shona/English and English-only options
- Keep under 8 words each
- Reflect Zimbabwean values: community (nhimbe), resilience (kushinga), growth (kukura)
- No generic slogans
- Format as a numbered list
```

### 4. Competitor Analysis (Simple → GPT-4o-mini/Claude Haiku)
```
Analyze the competitive landscape for a {industry} business in Zimbabwe.

Business: {business_name}
Description: {business_description}
Location: {city}

Identify:
1. 3-5 likely direct competitors in Zimbabwe
2. Their perceived strengths and weaknesses
3. Market gaps or underserved segments
4. Recommended differentiators for {business_name}
5. Pricing benchmarks in {currency}

Format as structured markdown with a comparison table.
```

### 5. Social Media Post (Simple → GPT-4o-mini/Claude Haiku)
```
Write a {platform} post for a Zimbabwean {industry} business.

Business: {business_name}
Message: {extra_context}
Target audience: Zimbabwean {audience}

{platform_specific_instructions}

Create 3 variants with different tones:
A) Professional & informative
B) Friendly & conversational (with Shona phrases sprinkled in)
C) Urgent & promotional (limited time offer angle)

Include:
- Hashtags (mix of trending Zim hashtags and industry tags)
- Best posting time for Zimbabwean audience
- Call-to-action
```

### 6. Tender Application Letter (Complex → GPT-4o-mini/Claude Haiku)
```
Write a professional tender application cover letter for a Zimbabwean tender.

Business: {business_name}
Tender Title: {extra_context}
Business Description: {business_description}
Industry: {industry}

{RAG_context: tender_details}

The letter should:
1. Address the issuing authority by name
2. Reference the specific tender number and title
3. Highlight 3 key qualifications from the business profile
4. Confirm understanding of requirements
5. Include compliance statement (ZIMRA tax clearance, NSSF, NEC)
6. Professional closing with contact details

Output in plain text format, ready to copy into a document.
```

### 7-10. Email Templates, Profile Description, SMS Campaign, WhatsApp Broadcast
[Additional prompts follow same format — see `src/ai/prompts/` for full library]

## RAG Pipeline Architecture

```
Document Ingestion
    │
    ▼
┌──────────────────────┐
│  Document Sources     │
│  - ZIMRA tax tables   │
│  - Companies Act      │
│  - SADC trade docs    │
│  - SME guides         │
│  - FAQ knowledge base │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Chunking (500 tokens)│
│  Overlap: 50 tokens   │
│  Metadata: source,    │
│    date, category     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Embeddings           │
│  (text-embedding-3-   │
│   small, 1536 dims)   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Pinecone Index       │
│  - Index: radbit-rag  │
│  - Metric: cosine     │
│  - Pod type: s1.x1    │
│  - Namespace by       │
│    country (zw, za)   │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
Query          Maintenance
    │             │
    ▼             ▼
Embed query   Re-index weekly
    │         or on document
    ▼         update
Pinecone
similarity
search
    │
    ▼
Top-5 chunks
+ metadata
    │
    ▼
Inject into
prompt as
{RAG_context}
```

## Cost Monitoring

| Tier | Monthly AI Budget | Hard Cap | Alert at 80% |
|---|---|---|---|
| Free | $0.50/user | $0.50 | WhatsApp notification |
| Growth | $3.00/user | $3.00 | In-app + WhatsApp |
| Pro | $10.00/user | $10.00 | In-app + WhatsApp |
| Enterprise | Custom | Custom | Dashboard alert |

## Semantic Caching

```typescript
// Cache key: embedding of normalized prompt + business profile hash
// TTL: 24 hours
// Similarity threshold: cosine > 0.92

interface CacheEntry {
  prompt_hash: string;     // SHA256 of normalized prompt
  business_hash: string;   // SHA256 of business profile key fields
  embedding: number[];     // 1536-dim vector
  response: string;
  model_used: string;
  tokens_saved: number;
  cost_saved: number;
  created_at: Date;
  hit_count: number;
}
```

## A/B Test Framework

| Test | Model A | Model B | Metric | Sample Size |
|---|---|---|---|---|
| Business Plan Quality | GPT-4o | Claude 3.5 Sonnet | SME panel rating (1-5) | 50 plans, 3 raters each |
| Slogan Creativity | GPT-4o-mini | Claude 3 Haiku | Click-through rate | 200 users |
| Financial Accuracy | GPT-4o + function calling | Claude Sonnet + tool use | Numerical error rate | 100 projections |
| Response Latency | All models | — | p95 response time | 1000 requests each |

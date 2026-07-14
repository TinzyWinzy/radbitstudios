# Zimbabwe Knowledge Base

Radbit's Zimbabwe knowledge base is a pgvector-backed RAG index for local market, compliance, tax, investment, and policy material. It is meant to ground AI responses in local documents instead of relying on generic model memory.

## Current Maturity

The core pieces exist:

- PostgreSQL and pgvector schema in `studio/src/lib/sqlite.ts`.
- Server-side RAG indexing and retrieval in `studio/src/services/ai/rag.server.ts`.
- Gemini embeddings in `studio/src/services/ai/embeddings.ts`.
- Product usage in the Tax Copilot flow.
- A governed source registry in `studio/scripts/rag-sources.mjs`.

The system should still be treated as a governed assistant, not an authority. Legal, tax, currency, tender, licensing, and deadline claims must cite their source and preserve the date or version of the retrieved document.

## Source Registry

Run:

```bash
cd studio
npm run rag:list
```

The registry tracks:

- source id
- title and display source
- category
- file path and canonical PDF path where applicable
- trust tier
- freshness or reporting period
- usage guidance for claims

Disabled sources are intentionally visible in `studio/scripts/rag-sources.mjs`. A disabled source usually means the extract is empty, the document ownership is unclear, or the file needs manual validation before it should influence client-facing answers.

## Indexing

Required environment:

```bash
DATABASE_URL=postgresql://...
GOOGLE_GENAI_API_KEY=...
```

Then run:

```bash
cd studio
npm run rag:index
```

Useful options:

```bash
npm run rag:index -- --dry-run
npm run rag:index -- --source constitution-2023-excerpts --dry-run
npm run rag:index -- --source fiscal-device-gateway-api-v7-2
npm run rag:index -- --list --include-disabled
```

`--dry-run` reads and chunks the material without writing to PostgreSQL or creating embeddings.

## Claim Rules

Use the retrieved material this way:

- Primary law and official specifications can ground specific answers, but quote section numbers or endpoint names only when retrieved text includes them.
- Policy documents such as NDS2 describe government priorities and targets; do not present targets as achieved outcomes.
- Reports and public notices are dated evidence; include the quarter, year, version, or closing date.
- Web extracts are current only as of their scrape date.
- Derived summaries are orientation material; prefer the full report when exact figures matter.
- When a claim affects money, licensing, legal compliance, tax, deadlines, or eligibility, the answer should tell the user to verify with the issuing authority before acting.

## Known Gaps

- The RAG index does not yet store source freshness and trust metadata in `rag_documents`; that guidance currently lives in the script registry and docs.
- `studio/src/lib/sqlite.ts` is now PostgreSQL-backed despite the filename. Renaming would reduce confusion but touches many imports.
- Some AI flows still use hard-coded Zimbabwe facts. Those should be gradually moved behind RAG retrieval and short, source-aware prompts.
- The public AI gateway still uses the older Firestore/client RAG path. Server-side flows that need reliable compliance context should prefer `rag.server.ts`.
- The tourism PDF and quality policy are disabled until extraction and relevance are verified.

## Adding A Source

1. Put the text extract in `database/`, or place a PDF at the repo root.
2. Add an entry to `studio/scripts/rag-sources.mjs`.
3. Run `npm run rag:list` and confirm the file is found.
4. Run `npm run rag:index -- --source <source-id> --dry-run`.
5. Run the live indexing command only after source ownership, date, and claim guidance are clear.

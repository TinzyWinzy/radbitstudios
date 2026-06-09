import { vi } from 'vitest';

// Set test environment
(process.env as Record<string, string>).NODE_ENV = 'development';
process.env.ENCRYPTION_KEY = 'test-key-for-testing-only-32bytes!';

vi.mock('@/lib/firebase/firebase', () => ({
  app: {},
  auth: {},
  db: {},
  storage: {},
}));

vi.mock('@/lib/firebase/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: vi.fn(),
    doc: vi.fn(),
    runTransaction: vi.fn(),
  },
}));

vi.mock('@/services/ai/rag.server', () => ({
  searchRelevantContext: vi.fn().mockResolvedValue([]),
  indexDocument: vi.fn().mockResolvedValue('mock-doc-id'),
  removeDocument: vi.fn().mockResolvedValue(undefined),
  getDocumentCount: vi.fn().mockResolvedValue(0),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock(import('@/services/rate-limiter'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 29, limit: 30 }),
  };
});

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Fetch not mocked in this test — use vi.mocked(fetch).mockResolvedValue')));

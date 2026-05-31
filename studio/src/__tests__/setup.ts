import { vi } from 'vitest';

// Set test environment
Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
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

// Mock Firebase for test environment
import { vi } from 'vitest';

vi.mock('@/lib/firebase/firebase', () => ({
  app: {},
  auth: {},
  db: {},
  storage: {},
}));

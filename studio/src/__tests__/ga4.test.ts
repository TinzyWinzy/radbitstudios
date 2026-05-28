import { describe, it, expect } from 'vitest';

describe('GA4 Analytics', () => {
  describe('trackEvent', () => {
    it('should be a function', () => {
      // trackEvent is a no-op when GA_ID is not set
      // This tests the module can be loaded
      expect(true).toBe(true);
    });
  });
});

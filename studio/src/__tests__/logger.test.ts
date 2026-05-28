import { describe, it, expect } from 'vitest';
import { createLogger, serializeError } from '@/lib/logger';

describe('Logger', () => {
  describe('createLogger', () => {
    it('should return a pino child logger with component', () => {
      const logger = createLogger('TestComponent');
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should create different loggers for different components', () => {
      const logger1 = createLogger('Component1');
      const logger2 = createLogger('Component2');
      expect(logger1).not.toBe(logger2);
    });
  });

  describe('serializeError', () => {
    it('should serialize Error instances', () => {
      const error = new Error('test error');
      const serialized = serializeError(error);
      expect(serialized.message).toBe('test error');
      expect(serialized.name).toBe('Error');
      expect(serialized.stack).toBeDefined();
    });

    it('should serialize non-Error values', () => {
      const serialized = serializeError('string error');
      expect(serialized.message).toBe('string error');
    });

    it('should serialize null/undefined', () => {
      const serialized = serializeError(null);
      expect(serialized.message).toBe('null');
    });
  });
});

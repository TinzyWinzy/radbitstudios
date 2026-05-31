import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  withCircuitBreaker,
  getCircuitState,
  resetCircuit,
  getAllCircuitStates,
} from '@/lib/circuit-breaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    // Reset all circuits between tests
    for (const name of Object.keys(getAllCircuitStates())) {
      resetCircuit(name);
    }
  });

  describe('withCircuitBreaker', () => {
    it('should return result when function succeeds', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const result = await withCircuitBreaker('test', fn);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledOnce();
    });

    it('should propagate errors when circuit is closed', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(withCircuitBreaker('test', fn)).rejects.toThrow('fail');
    });

    it('should open circuit after failureThreshold failures', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      const onStateChange = vi.fn();

      // Fail 5 times (default threshold)
      for (let i = 0; i < 5; i++) {
        await expect(withCircuitBreaker('test', fn, { onStateChange })).rejects.toThrow('fail');
      }

      // Circuit should now be open
      const state = getCircuitState('test');
      expect(state.state).toBe('open');
      expect(state.failures).toBe(5);

      // Next call should be rejected without calling fn
      await expect(withCircuitBreaker('test', fn)).rejects.toThrow('Circuit "test" is open');
      expect(fn).toHaveBeenCalledTimes(5); // Not called again
    });

    it('should transition to half-open after resetTimeout', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await withCircuitBreaker('test', fn).catch(() => {});
      }

      expect(getCircuitState('test').state).toBe('open');

      // Manually set nextAttemptTime to past to simulate timeout
      resetCircuit('test');

      // Re-open with short timeout
      for (let i = 0; i < 5; i++) {
        await withCircuitBreaker('test2', fn, { resetTimeoutMs: 1 }).catch(() => {});
      }

      // Wait for timeout
      await new Promise(r => setTimeout(r, 10));

      // Next call should transition to half-open
      fn.mockResolvedValueOnce('ok');
      const result = await withCircuitBreaker('test2', fn, { resetTimeoutMs: 1 });
      expect(result).toBe('ok');
    });

    it('should close circuit after successThreshold successes in half-open', async () => {
      const onStateChange = vi.fn();
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      // Open circuit
      for (let i = 0; i < 5; i++) {
        await withCircuitBreaker('test3', fn, { onStateChange, resetTimeoutMs: 1 }).catch(() => {});
      }

      // Wait for reset timeout
      await new Promise(r => setTimeout(r, 10));

      // Succeed twice (default successThreshold)
      fn.mockResolvedValue('ok');
      await withCircuitBreaker('test3', fn, { onStateChange, resetTimeoutMs: 1 });
      await withCircuitBreaker('test3', fn, { onStateChange, resetTimeoutMs: 1 });

      expect(getCircuitState('test3').state).toBe('closed');
    });

    it('should call onStateChange when state transitions', async () => {
      const onStateChange = vi.fn();
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 5; i++) {
        await withCircuitBreaker('test4', fn, { onStateChange }).catch(() => {});
      }

      expect(onStateChange).toHaveBeenCalledWith('test4', 'closed', 'open');
    });
  });

  describe('getCircuitState', () => {
    it('should return closed for unknown circuit', () => {
      const state = getCircuitState('unknown');
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });

    it('should track failure count', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      await withCircuitBreaker('test5', fn).catch(() => {});
      await withCircuitBreaker('test5', fn).catch(() => {});

      expect(getCircuitState('test5').failures).toBe(2);
    });
  });

  describe('resetCircuit', () => {
    it('should reset circuit to closed state', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 5; i++) {
        await withCircuitBreaker('test6', fn).catch(() => {});
      }

      expect(getCircuitState('test6').state).toBe('open');
      resetCircuit('test6');
      expect(getCircuitState('test6').state).toBe('closed');
    });
  });
});

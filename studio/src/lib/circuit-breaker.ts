/* ── Circuit Breaker Pattern ────────────────────────────────────────────
   Prevents cascading failures by tracking service health.
   States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
   ─────────────────────────────────────────────────────────────────── */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold?: number;
  /** Time in ms to wait before trying half-open */
  resetTimeoutMs?: number;
  /** Number of successes in half-open to close the circuit */
  successThreshold?: number;
  /** Optional callback on state change */
  onStateChange?: (name: string, from: CircuitState, to: CircuitState) => void;
}

interface CircuitData {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const circuits = new Map<string, CircuitData>();

function getCircuit(name: string): CircuitData {
  if (!circuits.has(name)) {
    circuits.set(name, {
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    });
  }
  return circuits.get(name)!;
}

/**
 * Execute a function with circuit breaker protection.
 * Returns the result if successful, or throws if the circuit is open or the function fails.
 *
 * @example
 * const data = await withCircuitBreaker('stripe', () => stripe.charges.create(...));
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  options: CircuitBreakerOptions = {},
): Promise<T> {
  const {
    failureThreshold = 5,
    resetTimeoutMs = 30000,
    successThreshold = 2,
    onStateChange,
  } = options;

  const circuit = getCircuit(name);
  const now = Date.now();

  // Check if circuit should transition from open to half-open
  if (circuit.state === 'open' && now >= circuit.nextAttemptTime) {
    const from = circuit.state;
    circuit.state = 'half-open';
    circuit.successes = 0;
    onStateChange?.(name, from, 'half-open');
  }

  // Reject if circuit is open
  if (circuit.state === 'open') {
    const waitMs = Math.ceil((circuit.nextAttemptTime - now) / 1000);
    throw new Error(`Circuit "${name}" is open. Retry in ${waitMs}s.`);
  }

  try {
    const result = await fn();

    // Success — reset failures, maybe close circuit
    if (circuit.state === 'half-open') {
      circuit.successes++;
      if (circuit.successes >= successThreshold) {
        const from = circuit.state;
        circuit.state = 'closed';
        circuit.failures = 0;
        circuit.successes = 0;
        onStateChange?.(name, from, 'closed');
      }
    } else {
      circuit.failures = 0;
    }

    return result;
  } catch (error: unknown) {
    // Failure — increment failures, maybe open circuit
    circuit.failures++;
    circuit.lastFailureTime = now;

    if (circuit.state === 'half-open') {
      const from = circuit.state;
      circuit.state = 'open';
      circuit.nextAttemptTime = now + resetTimeoutMs;
      onStateChange?.(name, from, 'open');
    } else if (circuit.failures >= failureThreshold) {
      const from = circuit.state;
      circuit.state = 'open';
      circuit.nextAttemptTime = now + resetTimeoutMs;
      onStateChange?.(name, from, 'open');
    }

    throw error;
  }
}

/**
 * Get the current state of a circuit (for health checks / monitoring).
 */
export function getCircuitState(name: string): { state: CircuitState; failures: number } {
  const circuit = getCircuit(name);
  // Auto-transition to half-open if timeout elapsed
  if (circuit.state === 'open' && Date.now() >= circuit.nextAttemptTime) {
    circuit.state = 'half-open';
    circuit.successes = 0;
  }
  return { state: circuit.state, failures: circuit.failures };
}

/**
 * Manually reset a circuit (e.g., after fixing the underlying issue).
 */
export function resetCircuit(name: string): void {
  circuits.delete(name);
}

/**
 * Get all circuit states (for monitoring dashboard).
 */
export function getAllCircuitStates(): Record<string, { state: CircuitState; failures: number }> {
  const result: Record<string, { state: CircuitState; failures: number }> = {};
  for (const [name] of circuits) {
    result[name] = getCircuitState(name);
  }
  return result;
}

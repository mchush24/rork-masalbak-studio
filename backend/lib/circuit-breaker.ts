/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures when external services are down
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is down, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */

import { logger } from "./utils.js";

export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold: number;
  /** Time in ms before attempting recovery (default: 30000) */
  resetTimeout: number;
  /** Name for logging purposes */
  name: string;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 30000,
  name: "unnamed",
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Check if circuit is open (failing fast)
   */
  isOpen(): boolean {
    if (this.state === "open") {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = "half_open";
        logger.info(`[CircuitBreaker:${this.options.name}] Transitioning to half-open`);
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    // Update state if timeout passed
    if (this.state === "open" && Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
      this.state = "half_open";
    }
    return this.state;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      const waitTime = Math.ceil((this.options.resetTimeout - (Date.now() - this.lastFailureTime)) / 1000);
      throw new CircuitOpenError(
        `Circuit breaker [${this.options.name}] is open. Retry in ${waitTime}s`,
        this.options.name
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Record a successful call
   */
  private onSuccess(): void {
    if (this.state === "half_open") {
      this.successCount++;
      // After 2 successful calls in half-open, close the circuit
      if (this.successCount >= 2) {
        this.reset();
        logger.info(`[CircuitBreaker:${this.options.name}] Circuit closed after recovery`);
      }
    } else {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Record a failed call
   */
  private onFailure(error: unknown): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;

    if (this.state === "half_open") {
      // Failed during recovery attempt, reopen
      this.state = "open";
      logger.warn(`[CircuitBreaker:${this.options.name}] Recovery failed, reopening circuit`);
    } else if (this.failures >= this.options.failureThreshold) {
      this.state = "open";
      logger.warn(`[CircuitBreaker:${this.options.name}] Threshold reached (${this.failures}), opening circuit`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Get circuit breaker stats
   */
  getStats(): {
    state: CircuitState;
    failures: number;
    lastFailureTime: number;
    name: string;
  } {
    return {
      state: this.getState(),
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      name: this.options.name,
    };
  }
}

/**
 * Custom error for circuit open state
 */
export class CircuitOpenError extends Error {
  readonly circuitName: string;

  constructor(message: string, circuitName: string) {
    super(message);
    this.name = "CircuitOpenError";
    this.circuitName = circuitName;
  }
}

/**
 * Retry helper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if shouldRetry returns false
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't wait after last attempt
      if (attempt < maxRetries - 1) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        logger.debug(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Check if error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    // OpenAI style
    if ("status" in error && (error as any).status === 429) return true;
    // Anthropic style
    if (error.message.includes("rate_limit") || error.message.includes("429")) return true;
  }
  return false;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Don't retry rate limits - they need longer backoff
  if (isRateLimitError(error)) return false;

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("ECONNREFUSED")) return true;
    if (error.message.includes("ETIMEDOUT")) return true;
    if (error.message.includes("network")) return true;

    // Server errors (5xx)
    if ("status" in error) {
      const status = (error as any).status;
      if (status >= 500 && status < 600) return true;
    }
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

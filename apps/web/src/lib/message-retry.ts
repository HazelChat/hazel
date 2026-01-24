/**
 * Message Retry Strategies
 *
 * Provides Effect-based retry policies for message sending with exponential backoff.
 * Uses the same patterns as experimental/bot-sdk/src/retry.ts.
 */

/**
 * Maximum number of retry attempts for message sending.
 * After automatic retries are exhausted, user can manually retry via toast action.
 */
export const MAX_RETRY_ATTEMPTS = 3

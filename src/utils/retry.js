/**
 * Retries an async function with exponential backoff.
 *
 * @param {() => Promise<any>} fn - the async function to retry (no args; wrap with a closure if you need args)
 * @param {object} [options]
 * @param {number} [options.retries=3] - max retry attempts (not counting the first try)
 * @param {number} [options.baseDelay=500] - initial delay in ms
 * @param {number} [options.maxDelay=10000] - cap on delay between retries
 * @param {(error: any, attempt: number) => boolean} [options.shouldRetry] - return false to stop retrying early
 * @param {(error: any, attempt: number, delay: number) => void} [options.onRetry] - called before each retry, e.g. for logging
 * @returns {Promise<any>}
 */
export async function retry(
  fn,
  {
    retries = 3,
    baseDelay = 500,
    maxDelay = 10_000,
    shouldRetry = () => true,
    onRetry = () => {},
  } = {},
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === retries;
      if (isLastAttempt || !shouldRetry(error, attempt)) {
        throw error;
      }

      // exponential backoff with jitter: base * 2^attempt, +/- randomness
      const exponential = baseDelay * 2 ** attempt;
      const capped = Math.min(exponential, maxDelay);
      const delay = capped / 2 + Math.random() * (capped / 2);

      onRetry(error, attempt + 1, delay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError; // unreachable, but keeps TS/linters happy
}

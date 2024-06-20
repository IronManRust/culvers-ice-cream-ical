import { FailedAttemptError, Options } from 'p-retry'

export const RetryOptions: Options = {
  /**
   * Handler for when a retry attempt fails.
   * @param {FailedAttemptError} error - The error for the current failed attempt.
   */
  onFailedAttempt: (error: FailedAttemptError) => {
    console.warn(`Attempt ${error.attemptNumber} Failed (${error.retriesLeft} Left)`)
  },
  /**
   * The number of retry attempts to make.
   */
  retries: 4
}

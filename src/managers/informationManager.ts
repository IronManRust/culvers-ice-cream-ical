import { HealthStatus } from '../enums/healthStatus'
import Status from '../types/status'

/**
 * Gets the API status.
 * @returns {Status} - The API status.
 */
export const getStatus = (): Status => {
  // TODO: Stub Operation
  console.log('getStatus()')
  return {
    health: HealthStatus.Healthy
  }
}

import { HealthStatus } from '../enums/healthStatus'
import BaseResponse from '../types/baseResponse'
import Status from '../types/status'

/**
 * Gets the API entry point.
 * @returns {BaseResponse} - The initial API links collection.
 */
export const getRoot = (): BaseResponse => {
  return {
    // Navigation links are set in the controller.
  }
}

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

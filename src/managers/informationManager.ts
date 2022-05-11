import { FastifyRequest } from 'fastify'
import { HealthStatus } from '../enums/healthStatus'
import { getCachePrefixes } from '../functions/cacheKeys'
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
 * @param {FastifyRequest} request - The request instance.
 * @returns {Status} - The API status.
 */
export const getStatus = (request: FastifyRequest): Status => {
  return {
    health: HealthStatus.Healthy, // Until there is a service dependency that can be unhealthy, this is hard-coded.
    cacheStatistics: request.cache.getStatistics(getCachePrefixes())
  }
}

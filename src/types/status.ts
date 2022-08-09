import BaseResponse from './baseResponse'
import CacheStatistics from './cacheStatistics'
import { HealthStatus } from '../enums/healthStatus'

export default interface Status extends BaseResponse {
  health: HealthStatus
  memoryUsed: number
  cacheStatistics: CacheStatistics
}

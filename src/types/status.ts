import BaseResponse from './baseResponse'
import { HealthStatus } from '../enums/healthStatus'

export default interface Status extends BaseResponse {
  health: HealthStatus
}

import BaseResponse from './baseResponse'
import FlavorSummary from './flavorSummary'

export default interface FlavorListSummary extends BaseResponse {
  items: FlavorSummary[]
}

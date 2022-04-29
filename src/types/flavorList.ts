import BaseResponse from './baseResponse'
import FlavorSummary from './flavorSummary'

export default interface FlavorList extends BaseResponse {
  items: FlavorSummary[]
}

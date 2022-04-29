import BaseResponse from './baseResponse'
import LocationSummary from './locationSummary'

export default interface LocationList extends BaseResponse {
  items: LocationSummary[]
}

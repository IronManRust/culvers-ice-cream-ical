import BaseResponse from './baseResponse'
import FlavorDetail from './flavorDetail'
import LocationDetail from './locationDetail'

export default interface CalendarItem extends BaseResponse {
  date: {
    start: Date
    end: Date
  }
  flavor: FlavorDetail,
  location: LocationDetail
}

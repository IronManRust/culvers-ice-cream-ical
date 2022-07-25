import BaseResponse from './baseResponse'
import FlavorDetail from './flavorDetail'
import LocationDetail from './locationDetail'

export default interface CalendarItem extends BaseResponse {
  date: string
  flavor: FlavorDetail,
  location: LocationDetail
}

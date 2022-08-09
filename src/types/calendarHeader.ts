import BaseResponse from './baseResponse'

export default interface CalendarHeader extends BaseResponse {
  date: string
  flavorKey: string,
  locationID: number
}

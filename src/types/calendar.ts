import BaseResponse from './baseResponse'
import CalendarItem from './calendarItem'

export default interface Calendar extends BaseResponse {
  items: CalendarItem[]
}

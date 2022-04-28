import BaseResponse from './baseResponse'
import KeyValuePair from './keyValuePair'

export default interface ErrorResponse extends BaseResponse {
  statusCode: number
  statusName: string
  message: string
  metaData: KeyValuePair[]
}

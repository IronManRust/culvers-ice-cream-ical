import BaseResponse from './baseResponse'

export default interface LocationSummary extends BaseResponse {
  id: number
  key: string
  name: string
  url: string
}

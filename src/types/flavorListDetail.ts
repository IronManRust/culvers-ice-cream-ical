import BaseResponse from './baseResponse'
import FlavorDetail from './flavorDetail'

export default interface FlavorListDetail extends BaseResponse {
  items: FlavorDetail[]
}

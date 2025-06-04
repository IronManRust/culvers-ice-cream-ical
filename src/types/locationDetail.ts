import Address from './address'
import LocationSummary from './locationSummary'
import Schedule from './schedule'

export default interface LocationDetail extends LocationSummary {
  address: Address
  scheduleDineIn?: Schedule
  scheduleDriveThru?: Schedule
  scheduleCurdSide?: Schedule
  scheduleDelivery?: Schedule
}

import LocationSummary from './locationSummary'

export default interface LocationDetail extends LocationSummary {
  address: {
    address1: string
    address2: string
    city: string
    state: string
    postal: number
    country: string
  }
  hours: {
    monday: {
      open: string
      close: string
    },
    tuesday: {
      open: string
      close: string
    },
    wednesday: {
      open: string
      close: string
    },
    thursday: {
      open: string
      close: string
    },
    friday: {
      open: string
      close: string
    },
    saturday: {
      open: string
      close: string
    },
    sunday: {
      open: string
      close: string
    }
  }
}

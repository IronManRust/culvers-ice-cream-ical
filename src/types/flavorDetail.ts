import FlavorSummary from './flavorSummary'

export default interface FlavorDetail extends FlavorSummary {
  flavorURL: string
  imageURL: string
  description: string
}

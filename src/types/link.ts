import { RouteVerb } from '../enums/routeVerb'
import KeyValuePair from './keyValuePair'

export default interface Link {
  title: string
  href: string
  verb: RouteVerb
  rel: string
  metaData: KeyValuePair[]
}

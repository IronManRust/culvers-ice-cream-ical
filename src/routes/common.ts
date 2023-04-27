import { RouteVerb } from '../enums/routeVerb'
import KeyValuePair from '../types/keyValuePair'
import Link from '../types/link'

export const metaData: KeyValuePair[] = [{
  key: 'key',
  value: 'value'
}]

// TODO: Use actual hypermedia links to make a more accurate example.
export const links: Link[] = [{
  title: 'title',
  href: '#',
  verb: RouteVerb.GET,
  rel: 'relationship',
  metaData
}]

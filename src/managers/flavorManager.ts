import FlavorDetail from '../types/flavorDetail'
import FlavorList from '../types/flavorList'
import FlavorParams from '../types/flavorParams'

/**
 * Gets a list of flavors.
 * @returns {FlavorList} - A list of all available flavors.
 */
export const getFlavorList = (): FlavorList => {
  // TODO: Stub Operation
  console.log('getFlavorList()')
  return {
    items: [
      {
        key: 'flavor-1',
        name: 'Flavor #1',
        imageURL: '#'
      }
    ]
  }
}

/**
 * Gets a flavor.
 * @param {FlavorParams} flavorParams - The specified flavor.
 * @returns {FlavorDetail} - Information about the specified flavor.
 */
export const getFlavor = (flavorParams: FlavorParams): FlavorDetail => {
  // TODO: Stub Operation
  console.log(`getFlavor(${JSON.stringify(flavorParams)})`)
  return {
    key: 'flavor-1',
    name: 'Flavor #1',
    imageURL: '#',
    description: 'This is a description of Flavor #1.'
  }
}

import axios from 'axios'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { parse } from 'node-html-parser'
import FlavorDetail from '../types/flavorDetail'
import FlavorListDetail from '../types/flavorListDetail'
import FlavorListSummary from '../types/flavorListSummary'
import FlavorParams from '../types/flavorParams'

/**
 * Gets a list of flavors by scraping the Culver's website.
 * @returns {FlavorListDetail} - A list of all available flavors.
 */
const getFlavorListScrape = async (): Promise<FlavorListDetail> => {
  const response = await axios.get('https://www.culvers.com/flavor-of-the-day')
  if (response.status === StatusCodes.OK) {
    const items = await Promise.all(parse(response.data).querySelectorAll('.ModuleFotdAllFlavors-item')
      .map(async (item) => {
        const flavorURL = `https://www.culvers.com${item.getElementsByTagName('a')[0].getAttribute('href')}`
        const responseDescription = await axios.get(flavorURL)
        const flavorDetail: FlavorDetail = {
          key: (item.getElementsByTagName('a')[0].getAttribute('href') ?? '').replace('/flavor-of-the-day/', ''),
          name: item.getElementsByTagName('strong')[0].innerText,
          flavorURL,
          imageURL: `https:${item.getElementsByTagName('img')[0].getAttribute('src')}`,
          description: responseDescription.status === StatusCodes.OK
            ? parse(responseDescription.data).querySelectorAll('.ModuleFotdDetail-description')[0].getElementsByTagName('p')[0].innerText
            : '<Description Not Available>'
        }
        return flavorDetail
      }))
    return {
      items
    }
  } else {
    throw new httpErrors.InternalServerError('Unable to retrieve Flavor of the Day data.')
  }
}

/**
 * Gets a list of flavors.
 * @returns {FlavorListSummary} - A list of all available flavors.
 */
export const getFlavorList = async (): Promise<FlavorListSummary> => {
  // TODO: Read From Cache
  const flavorList = await getFlavorListScrape()

  return {
    items: flavorList.items.map((x) => {
      return {
        key: x.key,
        name: x.name
      }
    })
  }
}

/**
 * Gets a flavor.
 * @param {FlavorParams} flavorParams - The specified flavor.
 * @returns {FlavorDetail} - Information about the specified flavor.
 */
export const getFlavor = async (flavorParams: FlavorParams): Promise<FlavorDetail> => {
  if (!flavorParams.key) {
    throw new httpErrors.BadRequest('No flavor key specified.')
  }

  // TODO: Read From Cache
  const flavorList = await getFlavorListScrape()

  const matchingFlavors = flavorList.items.filter((x) => {
    return x.key.trim().toLowerCase() === flavorParams.key.trim().toLowerCase()
  })
  if (matchingFlavors.length === 1) {
    return matchingFlavors[0]
  } else {
    throw new httpErrors.NotFound('No matching flavor found.')
  }
}

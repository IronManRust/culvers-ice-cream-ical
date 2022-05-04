import axios from 'axios'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { parse } from 'node-html-parser'
import CachedAsset from '../types/cachedAsset'
import FlavorDetail from '../types/flavorDetail'
import FlavorListDetail from '../types/flavorListDetail'
import FlavorListSummary from '../types/flavorListSummary'
import FlavorParams from '../types/flavorParams'

/**
 * Gets a list of flavors by reading from the cache.
 * @returns {CachedAsset<FlavorListDetail> | undefined} - A list of all available flavors.
 */
const getFlavorListCache = (): Promise<CachedAsset<FlavorListDetail> | undefined> => {
  console.log('Reading From Cache') // TODO: Read From Cache
  return Promise.resolve(undefined)
}

/**
 * Writes a list of flavors to the cache.
 * @param {FlavorListDetail} flavorListDetail - A list of all available flavors.
 * @returns {CachedAsset<FlavorListDetail>} - A list of all available flavors.
 */
const setFlavorListCache = (flavorListDetail: FlavorListDetail): Promise<CachedAsset<FlavorListDetail>> => {
  console.log('Writing To Cache') // TODO: Write To Cache
  return Promise.resolve({
    data: flavorListDetail,
    expires: new Date('2020-01-01T00:00:00.000+00:00')
  })
}

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
 * @returns {CachedAsset<FlavorListSummary>} - A list of all available flavors.
 */
export const getFlavorList = async (): Promise<CachedAsset<FlavorListSummary>> => {
  const flavorList = await getFlavorListCache() ?? await setFlavorListCache(await getFlavorListScrape())

  return {
    data: {
      items: flavorList.data.items.map((x) => {
        return {
          key: x.key,
          name: x.name
        }
      })
    },
    expires: flavorList.expires
  }
}

/**
 * Gets a flavor.
 * @param {FlavorParams} flavorParams - The specified flavor.
 * @returns {CachedAsset<FlavorDetail>} - Information about the specified flavor.
 */
export const getFlavor = async (flavorParams: FlavorParams): Promise<CachedAsset<FlavorDetail>> => {
  if (!flavorParams.key) {
    throw new httpErrors.BadRequest('No flavor key specified.')
  }

  const flavorList = await getFlavorListCache() ?? await setFlavorListCache(await getFlavorListScrape())

  const matchingFlavors = flavorList.data.items.filter((x) => {
    return x.key.trim().toLowerCase() === flavorParams.key.trim().toLowerCase()
  })
  if (matchingFlavors.length === 1) {
    return {
      data: matchingFlavors[0],
      expires: flavorList.expires
    }
  } else {
    throw new httpErrors.NotFound('No matching flavor found.')
  }
}

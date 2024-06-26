import axios from 'axios'
import { FastifyBaseLogger, FastifyRequest } from 'fastify'
import { unescape } from 'html-escaper'
import httpErrors from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { parse } from 'node-html-parser'
import pRetry from 'p-retry'
import { HTTPAddress } from '../constants/httpAddress'
import { RetryOptions } from '../constants/retryOptions'
import { getCacheKeyFlavors } from '../functions/cacheKeys'
import { Cache } from '../plugins/caching'
import CachedAsset from '../types/cachedAsset'
import FlavorDetail from '../types/flavorDetail'
import FlavorListDetail from '../types/flavorListDetail'
import FlavorListSummary from '../types/flavorListSummary'
import FlavorParams from '../types/flavorParams'

/**
 * Gets a list of flavors by reading from the cache.
 * @param {Cache} cache - The cache object.
 * @returns {CachedAsset<FlavorListDetail> | undefined} - A list of all available flavors.
 */
const getFlavorListCache = (cache: Cache): CachedAsset<FlavorListDetail> | undefined => {
  return cache.read<FlavorListDetail>(getCacheKeyFlavors())
}

/**
 * Writes a list of flavors to the cache.
 * @param {Cache} cache - The cache object.
 * @param {FlavorListDetail} flavorListDetail - A list of all available flavors.
 * @returns {CachedAsset<FlavorListDetail>} - A list of all available flavors.
 */
const setFlavorListCache = (cache: Cache, flavorListDetail: FlavorListDetail): CachedAsset<FlavorListDetail> => {
  return cache.write<FlavorListDetail>(getCacheKeyFlavors(), flavorListDetail)
}

/**
 * Gets a list of flavors by scraping the Culver's website.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @returns {FlavorListDetail} - A list of all available flavors.
 */
const getFlavorListScrape = async (logger: FastifyBaseLogger): Promise<FlavorListDetail> => {
  logger.info('scrape flavors - begin')
  const response = await axios.get(`${HTTPAddress.Website}/flavor-of-the-day`)
  if (response.status === StatusCodes.OK) {
    const items = await Promise.all(parse(response.data).querySelectorAll('a[class^=\'FlavorLinkListItem_containerLink\']')
      .map(async (item) => {
        const flavorURL = `${HTTPAddress.Website}${item.getAttribute('href')}`
        const responseDescription = await axios.get(flavorURL)
        if (responseDescription.status === StatusCodes.OK) {
          const responseBody = parse(responseDescription.data)
          const flavorDetail: FlavorDetail = {
            key: (flavorURL ?? '').replace(`${HTTPAddress.Website}/flavor-of-the-day/`, '').toLowerCase(),
            name: unescape(responseBody.getElementsByTagName('h1')[0].innerHTML
              .replace('’', '\''))
              .replace('&#x27;', '\''),
            flavorURL,
            imageURL: unescape(responseBody.querySelectorAll('div[class^=\'FlavorOfTheDayDetails_containerPrimary\'] > img:first-of-type')[0].getAttribute('src') ?? ''),
            description: unescape(responseBody.querySelectorAll('div[class^=\'FlavorOfTheDayDetails_containerPrimaryContentDescription\']')[0].innerHTML)
          }
          return flavorDetail
        } else {
          const flavorDetail: FlavorDetail = {
            key: (flavorURL ?? '').replace(`${HTTPAddress.Website}/flavor-of-the-day/`, '').toLowerCase(),
            name: '',
            flavorURL,
            imageURL: '',
            description: ''
          }
          return flavorDetail
        }
      }))
    logger.info('scrape flavors - success')
    return {
      items
    }
  } else {
    logger.info('scrape flavors - failure')
    throw new httpErrors.InternalServerError('Unable to retrieve Flavor of the Day data.')
  }
}

/**
 * Gets a list of flavors.
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<FlavorListSummary>} - A list of all available flavors.
 */
export const getFlavorList = async (request: FastifyRequest): Promise<CachedAsset<FlavorListSummary>> => {
  const flavorList = getFlavorListCache(request.cache) ?? setFlavorListCache(request.cache, await pRetry(() => { return getFlavorListScrape(request.log) }, RetryOptions))

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
 * @param {FastifyRequest} request - The request instance.
 * @returns {CachedAsset<FlavorDetail>} - Information about the specified flavor.
 */
export const getFlavor = async (request: FastifyRequest): Promise<CachedAsset<FlavorDetail>> => {
  const flavorParams = request.params as FlavorParams
  if (!flavorParams.key) {
    throw new httpErrors.BadRequest('No flavor key specified.')
  }

  const flavorList = getFlavorListCache(request.cache) ?? setFlavorListCache(request.cache, await pRetry(() => { return getFlavorListScrape(request.log) }, RetryOptions))

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

/**
 * Gets a flavor.
 * @param {Cache} cache - The cache object.
 * @param {FastifyBaseLogger} logger - The logger instance.
 * @param {string} flavorName - The name of the flavor.
 * @returns {FlavorDetail} - Information about the specified flavor.
 */
export const getFlavorInternal = async (cache: Cache, logger: FastifyBaseLogger, flavorName: string): Promise<FlavorDetail> => {
  const flavorList = getFlavorListCache(cache) ?? setFlavorListCache(cache, await pRetry(() => { return getFlavorListScrape(logger) }, RetryOptions))
  for (const flavor of flavorList.data.items) {
    if (flavor.name.trim().toLowerCase() === flavorName.trim().toLowerCase()) {
      return flavor
    }
  }
  return {
    key: 'unknown-flavor',
    name: flavorName,
    flavorURL: '',
    imageURL: '',
    description: ''
  }
}

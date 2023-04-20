import { FastifyBaseLogger, FastifyInstance } from 'fastify'
import NodeCache from 'node-cache'
import CachedAsset from '../types/cachedAsset'
import CacheOptions from '../types/cacheOptions'
import CacheStatistics from '../types/cacheStatistics'

/**
 * A templated NodeCache wrapper.
 * @class Cache
 */
export class Cache {

  #nodeCache: NodeCache

  #logger: FastifyBaseLogger

  #cacheOptions: CacheOptions

  /**
   * Creates an instance of the Cache class.
   * @param {FastifyBaseLogger} logger - The logger instance.
   * @param {CacheOptions} cacheOptions - The specified caching options.
   * @memberof Cache
   */
  public constructor(logger: FastifyBaseLogger, cacheOptions: CacheOptions) {
    this.#nodeCache = new NodeCache({
      stdTTL: cacheOptions.cacheLength,
      checkperiod: cacheOptions.cleanupLength
    })

    this.#logger = logger

    this.#cacheOptions = cacheOptions
  }

  /**
   * Reads an item from the cache.
   * @param {string} key - The cache key.
   * @returns {CachedAsset<T> | undefined} - The cached value.
   * @memberof Cache
   */
  public read<T>(key: string): CachedAsset<T> | undefined {
    const data = this.#nodeCache.get<T>(key)
    const ttl = this.#nodeCache.getTtl(key)
    if (data && ttl) {
      this.#logger.info(`cache read ${key} - hit`)
      return {
        data,
        expires: new Date(ttl)
      }
    } else {
      this.#logger.info(`cache read ${key} - miss`)
      return undefined
    }
  }

  /**
   * Writes an item to the cache.
   * @param {string} key - The cache key.
   * @param {T} data -  The value to cache.
   * @returns {CachedAsset<T>} - The cached value.
   * @memberof Cache
   */
  public write<T>(key: string, data: T): CachedAsset<T> {
    const success = this.#nodeCache.set(key, data, this.#cacheOptions.cacheLength)
    const ttl = this.#nodeCache.getTtl(key)
    if (success && ttl) {
      this.#logger.info(`cache write ${key} - success`)
      return {
        data,
        expires: new Date(ttl)
      }
    } else {
      this.#logger.info(`cache write ${key} - failure`)
      return {
        data,
        expires: new Date(Date.now())
      }
    }
  }

  /**
   * Gets statistics about the cache.
   * @param {string[]} prefixes - A list of cache key prefixes.
   * @returns {CacheStatistics} - Statistics about the cache.
   * @memberof Cache
   */
  public getStatistics(prefixes: string[]): CacheStatistics {
    const cacheStatistics: CacheStatistics = {
      items: []
    }
    const keys = this.#nodeCache.keys().map((x) => { return x.trim().toLowerCase() })
    for (const prefix of prefixes.map((x) => { return x.trim().toLowerCase() })) {
      cacheStatistics.items.push({
        prefix,
        count: keys.filter((x) => { return x.startsWith(prefix) }).length
      })
    }
    return cacheStatistics
  }

}

declare module 'fastify' {
  interface FastifyInstance {
    cache: Cache
  }
  interface FastifyRequest {
    cache: Cache
  }
  interface FastifyReply {
    cache: Cache
  }
}

/**
 * Sets up caching functionality.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the caching to.
 * @param {CacheOptions} cacheOptions - The specified caching options.
 */
export const setupCaching = (fastifyInstance: FastifyInstance, cacheOptions: CacheOptions): void => {
  const cache = new Cache(fastifyInstance.log, cacheOptions)
  const cacheKey = 'cache'
  const cacheDecoration = {
    /**
     * Returns the cache object.
     * @returns {Cache} - The cache object.
     */
    getter: () => {
      return cache
    }
  }
  fastifyInstance.decorate(cacheKey, cacheDecoration)
  fastifyInstance.decorateRequest(cacheKey, cacheDecoration)
  fastifyInstance.decorateReply(cacheKey, cacheDecoration)
}

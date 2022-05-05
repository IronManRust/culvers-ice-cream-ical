import { FastifyInstance, FastifyLoggerInstance } from 'fastify'
import NodeCache from 'node-cache'
import CachedAsset from '../types/cachedAsset'
import CacheOptions from '../types/cacheOptions'

/**
 * A templated NodeCache wrapper.
 * @class Cache
 */
export class Cache {

  #nodeCache: NodeCache

  #logger: FastifyLoggerInstance

  #cacheOptions: CacheOptions

  /**
   * Creates an instance of the Cache class.
   * @param {FastifyLoggerInstance} logger - The logger instance.
   * @param {CacheOptions} cacheOptions - The specified caching options.
   * @memberof Cache
   */
  public constructor(logger: FastifyLoggerInstance, cacheOptions: CacheOptions) {
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

  // TODO: Return cache information to be used on the status call.

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

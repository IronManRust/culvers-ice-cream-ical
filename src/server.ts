import AJV from 'ajv'
import Fastify, { FastifyInstance } from 'fastify'
import fs from 'fs'
import { getLogger } from './logger'
import { setupCaching } from './plugins/caching'
import { setupDocumentation } from './plugins/documentation'
import { setupErrorHandler } from './plugins/errorHandler'
import { setupRouting } from './plugins/routing'
import CacheOptions from './types/cacheOptions'
import ListenOptions from './types/listenOptions'
import LoggerOptions from './types/loggerOptions'

/**
 * The root object that handles processing requests and responses.
 * @class Server
 */
export default class Server {

  #fastifyInstance: FastifyInstance

  /**
   * Creates an instance of the Server class.
   * @param {LoggerOptions} loggerOptions - The specified logging options.
   * @memberof Server
   */
  public constructor(loggerOptions: LoggerOptions) {
    this.#fastifyInstance = Fastify({
      ajv: {
        customOptions: {
          coerceTypes: 'array'
        },
        plugins: [
          (ajv: AJV.Ajv) => {
            // TODO: Deal With Deprecation Warning
            ajv.addKeyword('example', {
              type: 'object'
            })
          }
        ]
      },
      logger: getLogger(loggerOptions)
    })
  }

  /**
   * Initializes the server.
   * @param {CacheOptions} cacheOptions - The specified caching options.
   * @memberof Server
   */
  public async initialize(cacheOptions: CacheOptions): Promise<void> {
    await setupCaching(this.#fastifyInstance, cacheOptions)
    await setupErrorHandler(this.#fastifyInstance)
    await setupDocumentation(this.#fastifyInstance)
    await setupRouting(this.#fastifyInstance)

    await this.#fastifyInstance.ready(() => {
      const spec20 = this.#fastifyInstance.swagger()
      const spec30 = JSON.parse(JSON.stringify(spec20))
      spec30.openapi = '3.0'
      try {
        fs.writeFileSync(`${__dirname}/spec-2.0.json`, JSON.stringify(spec20), {
          encoding: 'utf8'
        })
        fs.writeFileSync(`${__dirname}/spec-3.0.json`, JSON.stringify(spec30), {
          encoding: 'utf8'
        })
      } catch {
        // Do Nothing
        // TODO: Possibly Do Something
      }
    })
  }

  /**
   * Starts the server by listening at the specified options.
   * @param {ListenOptions} listenOptions - The specified listening options.
   * @returns {ListenOptions} - The specified listening options.
   * @memberof Server
   */
  public listen(listenOptions: ListenOptions): Promise<ListenOptions> {
    return new Promise((resolve, reject) => {
      this.#fastifyInstance.listen({
        host: listenOptions.host,
        port: listenOptions.port
      }, (error: Error | null) => {
        if (error) {
          return reject(error)
        } else {
          return resolve(listenOptions)
        }
      })
    })
  }

}

/**
 * Displays a startup banner in the console.
 * @param {number} instanceCount - The number of instances to use if in cluster mode, or 1 if in singleton mode.
 * @throws {Error} - Thrown if the instance count is not greater than 0.
 */
export const displayServerBanner = (instanceCount: number): void => {
  let mode = ''
  if (instanceCount === 1) {
    mode = 'Singleton'
  } else if (instanceCount > 1) {
    mode = `Cluster (${instanceCount} Instances)`
  } else {
    throw new Error(`Invalid Instance Count: ${instanceCount}`)
  }
  console.log(String.raw`                                                              `)
  console.log(String.raw`   ______         _                       _                   `)
  console.log(String.raw`  / _____)       | |                     ( )                  `)
  console.log(String.raw` | /       _   _ | | _   _   ____   ____ |/   ___             `)
  console.log(String.raw` | |      | | | || || | | | / _  ) / ___)    /___)            `)
  console.log(String.raw` | \_____ | |_| || | \ V / ( (/ / | |       |___ |            `)
  console.log(String.raw`  \______) \____||_|  \_/   \____)|_|       (___/             `)
  console.log(String.raw`                                                              `)
  console.log(String.raw`  _____                   ______                              `)
  console.log(String.raw` (_____)                 / _____)                             `)
  console.log(String.raw`    _     ____   ____   | /        ____   ____   ____  ____   `)
  console.log(String.raw`   | |   / ___) / _  )  | |       / ___) / _  ) / _  ||    \  `)
  console.log(String.raw`  _| |_ ( (___ ( (/ /   | \_____ | |    ( (/ / ( ( | || | | | `)
  console.log(String.raw` (_____) \____) \____)   \______)|_|     \____) \_||_||_|_|_| `)
  console.log(String.raw`                                                              `)
  console.log(String.raw`  _   ______         _                   .-"''"-.             `)
  console.log(String.raw` (_) / _____)       | |                 /        \            `)
  console.log(String.raw`  _ | /        ____ | |                 |        |            `)
  console.log(String.raw` | || |       / _  || |                 /'---'--'\            `)
  console.log(String.raw` | || \_____ ( ( | || |                |          |           `)
  console.log(String.raw` |_| \______) \_||_||_|                \.--.---.-./           `)
  console.log(String.raw`                                       (_.--._.-._)           `)
  console.log(String.raw`                                         \=-=-=-/             `)
  console.log(String.raw`                                          \=-=-/              `)
  console.log(String.raw`                                           \=-/               `)
  console.log(String.raw`                                            \/                `)
  console.log(String.raw`       Mode: ${mode}                                          `)
  console.log(String.raw`                                                              `)
}

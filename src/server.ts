import Fastify, { FastifyInstance } from 'fastify'
import { getLogger } from './logger'
import { setupDocumentation } from './plugins/documentation'
import { setupErrorHandler } from './plugins/errorHandler'
import { setupRouting } from './plugins/routing'
import { ListenOptions } from './types/listenOptions'
import { LoggerOptions } from './types/loggerOptions'

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
      logger: getLogger(loggerOptions)
    })

    setupDocumentation(this.#fastifyInstance)
    setupErrorHandler(this.#fastifyInstance)
    setupRouting(this.#fastifyInstance)
  }

  /**
   * Starts the server by listening at the specified options.
   * @param {ListenOptions} listenOptions - The specified listening options.
   * @returns {ListenOptions} - The specified listening options.
   * @memberof Server
   */
  public listen(listenOptions: ListenOptions): Promise<ListenOptions> {
    return new Promise((resolve, reject) => {
      this.#fastifyInstance.listen(listenOptions.port, listenOptions.address, (error: Error | null) => {
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

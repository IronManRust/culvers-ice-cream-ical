import cluster from 'cluster'
// TODO: Enable Clustering - import os from 'os'
import Server, { displayServerBanner } from './server'
import CacheOptions from './types/cacheOptions'
import ListenOptions from './types/listenOptions'
import LoggerOptions from './types/loggerOptions'

/**
 * Encapsulates a server in cluster mode.
 * @class Cluster
 */
export default class Cluster {

  /**
   * Creates an instance of the Cluster class.
   * @param {ListenOptions} listenOptions - The specified listening options.
   * @param {LoggerOptions} loggerOptions - The specified logging options.
   * @param {CacheOptions} cacheOptions - The specified caching options.
   * @memberof Cluster
   */
  public constructor(listenOptions: ListenOptions, loggerOptions: LoggerOptions, cacheOptions: CacheOptions) {
    if (cluster.isPrimary) {
      const cpuCount = 1 // TODO: Enable Clustering - os.cpus().length
      displayServerBanner(cpuCount)
      for (let i = 0; i < cpuCount; i++) {
        cluster.fork()
      }
      cluster.on('exit', () => {
        cluster.fork()
      })
    } else {
      Cluster.initialize(listenOptions, loggerOptions, cacheOptions)
    }
  }

  /**
   * Starts the server.
   * @param {ListenOptions} listenOptions - The specified listening options.
   * @param {LoggerOptions} loggerOptions - The specified logging options.
   * @param {CacheOptions} cacheOptions - The specified caching options.
   * @memberof Cluster
   */
  private static initialize = async (listenOptions: ListenOptions, loggerOptions: LoggerOptions, cacheOptions: CacheOptions): Promise<void> => {
    const server = new Server(loggerOptions)
    await server.initialize(cacheOptions)
    await server.listen(listenOptions)
  }

}

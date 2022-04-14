import cluster from 'cluster'
import os from 'os'
import { LoggerOptions } from './logger'
import Server, { displayServerBanner, ListenOptions } from './server'

/**
 * Encapsulates a server in cluster mode.
 * @class Cluster
 */
export default class Cluster {

  /**
   * Creates an instance of the Cluster class.
   * @param {ListenOptions} listenOptions - The specified listening options.
   * @param {LoggerOptions} loggerOptions - The specified logging options.
   * @memberof Cluster
   */
  public constructor(listenOptions: ListenOptions, loggerOptions: LoggerOptions) {
    if (cluster.isPrimary) {
      const cpuCount = os.cpus().length
      displayServerBanner(cpuCount)
      for (let i = 0; i < cpuCount; i++) {
        cluster.fork()
      }
      cluster.on('exit', () => {
        cluster.fork()
      })
    } else {
      this.initialize(listenOptions, loggerOptions)
    }
  }

  /**
   * Starts the server.
   * @param {ListenOptions} listenOptions - The specified listening options.
   * @param {LoggerOptions} loggerOptions - The specified logging options.
   * @memberof Cluster
   */
  private initialize = async (listenOptions: ListenOptions, loggerOptions: LoggerOptions): Promise<void> => {
    await new Server(loggerOptions).listen(listenOptions)
  }

}

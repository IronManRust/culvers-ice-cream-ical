import Cluster from './cluster'
import { getLogger } from './logger'
import CacheOptions from './types/cacheOptions'
import ListenOptions from './types/listenOptions'
import LoggerOptions from './types/loggerOptions'

// TODO: Inject options at runtime, either from a config file or from command line arguments.

const listenOptions: ListenOptions = {
  address: 'localhost',
  port: Number(process.env.PORT || 80)
}

const loggerOptions: LoggerOptions = {
  pretty: true,
  colorize: true,
  levelFirst: true
}

const cacheOptions: CacheOptions = {
  cacheLength: 300,
  cleanupLength: 300
}

const logger = getLogger(loggerOptions)
process.on('unhandledRejection', (reason) => {
  logger.error(reason || 'Unhandled Rejection')
})

export default new Cluster(listenOptions, loggerOptions, cacheOptions)

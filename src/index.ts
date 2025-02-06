import Cluster from './cluster'
import { getLogger } from './logger'
import CacheOptions from './types/cacheOptions'
import ListenOptions from './types/listenOptions'
import LoggerOptions from './types/loggerOptions'

// TODO: Enable rules in `knip.json` and address any findings.

const listenOptions: ListenOptions = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 8080)
}

const loggerOptions: LoggerOptions = {
  pretty: true,
  colorize: true,
  levelFirst: true
}

const cacheOptions: CacheOptions = {
  cacheLength: 3600,
  cleanupLength: 3600
}

const logger = getLogger(loggerOptions)
process.on('unhandledRejection', (reason) => {
  logger.error(reason || 'Unhandled Rejection')
})

export default new Cluster(listenOptions, loggerOptions, cacheOptions)

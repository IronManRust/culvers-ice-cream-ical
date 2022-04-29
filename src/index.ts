import Cluster from './cluster'
import { getLogger } from './logger'
import ListenOptions from './types/listenOptions'
import LoggerOptions from './types/loggerOptions'

// TODO: Inject options at runtime, either from a config file or from command line arguments.

const listenOptions: ListenOptions = {
  address: 'localhost',
  port: 8080
}

const loggerOptions: LoggerOptions = {
  pretty: true,
  colorize: true,
  levelFirst: true
}

const logger = getLogger(loggerOptions)
process.on('unhandledRejection', (reason) => {
  logger.error(reason || 'Unhandled Rejection')
})

export default new Cluster(listenOptions, loggerOptions)

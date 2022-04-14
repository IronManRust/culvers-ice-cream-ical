import Cluster from './cluster'
import { getLogger, LoggerOptions } from './logger'
import { ListenOptions } from './server'

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

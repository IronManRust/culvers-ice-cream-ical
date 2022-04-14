import { FastifyRequest, FastifyReply } from 'fastify'
import pino, { Logger } from 'pino'

export interface LoggerOptions {
  pretty: boolean
  colorize: boolean
  levelFirst: boolean
}

interface SerializedLogRequest {
  method: string
  hostname: string
  url: string
}

interface SerializedLogReply {
  statusCode: number
}

/**
 * Gets a Logger instance with the specified options.
 * @param {LoggerOptions} loggerOptions - The specified logging options.
 * @returns {Logger} - A Logger instance.
 */
export const getLogger = (loggerOptions: LoggerOptions): Logger => {
  const serializers = {
    /**
     * Creates a message for logging.
     * @param {FastifyRequest} request - The FastifyRequest to format.
     * @returns {SerializedLogRequest} - The formatted message.
     */
    req: (request: FastifyRequest): SerializedLogRequest => {
      return {
        method: request.method,
        hostname: request.hostname,
        url: request.url
      }
    },
    /**
     * Creates a message for logging.
     * @param {FastifyReply} reply - The FastifyReply to format.
     * @returns {SerializedLogReply} - The formatted message.
     */
    res: (reply: FastifyReply): SerializedLogReply => {
      return {
        statusCode: reply.statusCode
      }
    }
  }
  if (loggerOptions.pretty) {
    return pino({
      name: process.env.npm_package_name,
      serializers,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: loggerOptions.colorize,
          levelFirst: loggerOptions.levelFirst
        }
      }
    })
  } else {
    return pino({
      name: process.env.npm_package_name,
      serializers
    })
  }
}

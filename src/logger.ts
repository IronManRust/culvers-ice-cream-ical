import { FastifyRequest, FastifyReply } from 'fastify'
import pino, { Logger } from 'pino'
import { LoggerOptions } from './types/loggerOptions'
import { LogReply } from './types/logReply'
import { LogRequest } from './types/logRequest'

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
     * @returns {LogRequest} - The formatted message.
     */
    req: (request: FastifyRequest): LogRequest => {
      return {
        method: request.method,
        hostname: request.hostname,
        url: request.url
      }
    },
    /**
     * Creates a message for logging.
     * @param {FastifyReply} reply - The FastifyReply to format.
     * @returns {LogReply} - The formatted message.
     */
    res: (reply: FastifyReply): LogReply => {
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

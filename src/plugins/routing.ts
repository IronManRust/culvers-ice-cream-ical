import { FastifyInstance } from 'fastify'
import { registerCalendarController } from '../controllers/calendar'
import { registerFlavorController } from '../controllers/flavor'
import { registerInformationController } from '../controllers/information'
import { registerLocationController } from '../controllers/location'

/**
 * Sets up routing functionality.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const setupRouting = (fastifyInstance: FastifyInstance): void => {
  registerCalendarController(fastifyInstance)
  registerFlavorController(fastifyInstance)
  registerInformationController(fastifyInstance)
  registerLocationController(fastifyInstance)
}

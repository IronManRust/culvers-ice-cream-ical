import { FastifyInstance } from 'fastify'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerFlavorController = (fastifyInstance: FastifyInstance): void => {
  console.log(`Registering routes for instance v${fastifyInstance.version} ...`) // TODO: Register Routes
}

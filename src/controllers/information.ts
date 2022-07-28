import { FastifyInstance } from 'fastify'
import { HTTPHeader } from '../constants/httpHeader'
import { getContentTypeList } from '../enums/contentType'
import { getRoot, getStatus } from '../managers/informationManager'
import { RouteRoot, RouteStatus } from '../routes/information'

/**
 * Registers the controller.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the routing to.
 */
export const registerInformationController = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.get(RouteRoot.path, RouteRoot.options, (_request, response) => {
    const value = getRoot()
    // TODO: Add Hypermedia
    response
      .code(RouteRoot.successCode)
      .header(HTTPHeader.ContentType, getContentTypeList(RouteRoot.options.schema.produces))
      .send(value)
  })
  fastifyInstance.get(RouteStatus.path, RouteStatus.options, (request, response) => {
    const value = getStatus(request)
    // TODO: Add Hypermedia
    response
      .code(RouteStatus.successCode)
      .header(HTTPHeader.ContentType, getContentTypeList(RouteStatus.options.schema.produces))
      .send(value)
  })
}

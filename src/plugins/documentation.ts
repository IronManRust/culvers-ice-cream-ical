import { FastifyInstance, FastifyReply } from 'fastify'
import FastifyStatic from 'fastify-static'
import FastifySwagger from 'fastify-swagger'
import fs from 'fs'

/**
 * Returns a static file with the specified status code and file name.
 * @param {FastifyReply} response - The HTTP response object to return.
 * @param {number} statusCode - The HTTP status code to use.
 * @param {string} fileName - The file name to use.
 * @returns {FastifyReply} - The HTTP response object to return.
 */
const sendStaticFile = (response: FastifyReply, statusCode: number, fileName: string): FastifyReply => {
  return response
    .code(statusCode)
    .sendFile(fileName)
}

/**
 * Sets up documentation handling functionality.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the documentation handlers to.
 */
export const setupDocumentation = (fastifyInstance: FastifyInstance): void => {
  // TODO: Read `package.json` Values
  fastifyInstance.register(FastifySwagger, {
    swagger: {
      info: {
        title: process.env.npm_package_name || '',
        description: process.env.npm_package_description || '',
        version: process.env.npm_package_version || '0.0.0',
        contact: {
          name: process.env.npm_package_author_name || '',
          email: process.env.npm_package_author_email || '',
          url: process.env.npm_package_author_url || ''
        },
        license: {
          name: process.env.npm_package_license || '',
          url: `https://opensource.org/licenses/${process.env.npm_package_license || ''}`
        }
      },
      tags: [/* TODO: { name: RouteTag.Value, description: getRouteTagDescription(RouteTag.Value) } */]
    },
    exposeRoute: true,
    routePrefix: '/swagger'
  })

  fastifyInstance.register(FastifyStatic, {
    root: `${__dirname}/..`
  })

  fastifyInstance.ready(() => {
    const spec20 = fastifyInstance.swagger()
    const spec30 = JSON.parse(JSON.stringify(spec20))
    spec30.openapi = '3.0'
    fs.writeFileSync(`${__dirname}/../spec-2.0.json`, JSON.stringify(spec20))
    fs.writeFileSync(`${__dirname}/../spec-3.0.json`, JSON.stringify(spec30))
  })

  const RouteIndex = {
    path: '/',
    options: {
    },
    successCode: 200
  } // TODO: Move to `routes` folder and expand.
  fastifyInstance.get(RouteIndex.path, RouteIndex.options, (_request, response) => {
    sendStaticFile(response, RouteIndex.successCode, 'index.html')
  })
}

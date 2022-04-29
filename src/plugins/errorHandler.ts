import { FastifyInstance } from 'fastify'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import ToJsonSchema from 'to-json-schema'
import { generateJSONSchemaObject } from '../functions/route'
import { links, metaData } from '../routes/common'
import ErrorResponse from '../types/errorResponse'

/**
 * Sets up error handling functionality.
 * @param {FastifyInstance} fastifyInstance - The instance of the Fastify runtime to apply the error handlers to.
 */
export const setupErrorHandler = (fastifyInstance: FastifyInstance): void => {
  fastifyInstance.setNotFoundHandler((_request, response) => {
    const errorResponse: ErrorResponse = {
      statusCode: StatusCodes.NOT_FOUND,
      statusName: getReasonPhrase(StatusCodes.NOT_FOUND),
      message: 'This is not the route you\'re looking for ...',
      metaData: [],
      links: []
    }
    response
      .code(errorResponse.statusCode)
      .send(errorResponse)
  })
  fastifyInstance.setErrorHandler((error, _request, response) => {
    // NOTE: To trigger this handler from anywhere in the codebase, merely throw the appropriately typed error via the methods in the `http-errors` package. Example:
    //
    //       `throw new httpErrors.ImATeapot('I am short and stout.')`
    //
    //       This will be captured as a mapped `FastifyError` object, and the appropriate status code, in this case 418, will be returned to the user.
    const errorResponse: ErrorResponse = {
      statusCode: error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
      statusName: error.statusCode ? getReasonPhrase(error.statusCode) : getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      message: error.message,
      metaData: [],
      links: []
    }
    response
      .code(errorResponse.statusCode)
      .send(errorResponse)
  })
}

/**
 * Generates standard error handler schemas used across multiple routes.
 * @returns {{ HTTP400: ToJsonSchema.JSONSchema3or4, HTTP404: ToJsonSchema.JSONSchema3or4, HTTP500: ToJsonSchema.JSONSchema3or4 }} - An object representing standard error handler schemas.
 */
export const getErrorHandlerSchemas = (): {
  HTTP400: ToJsonSchema.JSONSchema3or4,
  HTTP404: ToJsonSchema.JSONSchema3or4,
  HTTP500: ToJsonSchema.JSONSchema3or4
} => {
  const errorResponse400: ErrorResponse = {
    statusCode: StatusCodes.BAD_REQUEST,
    statusName: getReasonPhrase(StatusCodes.BAD_REQUEST),
    message: getReasonPhrase(StatusCodes.BAD_REQUEST),
    metaData,
    links
  }
  const errorResponse404: ErrorResponse = {
    statusCode: StatusCodes.NOT_FOUND,
    statusName: getReasonPhrase(StatusCodes.NOT_FOUND),
    message: getReasonPhrase(StatusCodes.NOT_FOUND),
    metaData,
    links
  }
  const errorResponse500: ErrorResponse = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    statusName: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    metaData,
    links
  }
  return {
    HTTP400: generateJSONSchemaObject(errorResponse400, errorResponse400.statusName, errorResponse400.message),
    HTTP404: generateJSONSchemaObject(errorResponse404, errorResponse404.statusName, errorResponse404.message),
    HTTP500: generateJSONSchemaObject(errorResponse500, errorResponse500.statusName, errorResponse500.message)
  }
}

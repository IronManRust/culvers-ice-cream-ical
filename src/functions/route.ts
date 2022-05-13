import ToJsonSchema from 'to-json-schema'

// NOTE: It appears that the `to-json-schema` library doesn't support per-property comments or handling enums as anything other than basic strings.
//       It does look like the project (https://github.com/ruzicka/to-json-schema) is actively maintained, so this is a potential PR.

/**
 * Transforms an example object into JSON Schema for use in Swagger definitions.
 * @param {any} value - An example object to transform into JSON Schema.
 * @param {string} title - The title of the generated object.
 * @param {string} description - A description of the generated object.
 * @returns {ToJsonSchema.JSONSchema3or4} - A JSON Schema representation of the example object.
 */
export const generateJSONSchemaObject = (value: unknown, title: string | undefined, description: string | undefined): ToJsonSchema.JSONSchema3or4 => {
  const schema = ToJsonSchema(value ?? '', {
    arrays: {
      mode: 'uniform'
    },
    required: false,
    strings: {
      detectFormat: false
    }
  })
  schema.title = title
  schema.description = description
  schema.example = value
  return schema
}

type TypedParameterValue = 'boolean' | 'integer' | 'number' | 'string' // Not Supported: 'array' | 'object'

interface TypedParameter {
  key: string
  value: TypedParameterValue
}

interface DynamicObject {
  [key: string]: unknown
}

/**
 * Parses a path into params.
 * @param {string} path - The path to parse.
 * @param {TypedParameter[]} typedParameters - Optional parameter types.
 * @returns {ToJsonSchema.JSONSchema3or4 | undefined} - A JSON Schema representation of the params.
 */
export const generateJSONSchemaParams = (path: string, typedParameters?: TypedParameter[]): ToJsonSchema.JSONSchema3or4 | undefined => {
  const parts =
    path
      .split('/')
      .filter((x) => { return x.startsWith(':') })
      .map((x) => { return x.substring(1) })
  if (parts && parts.length > 0) {
    const value: DynamicObject = {
      // Start with no values.
    }
    parts.forEach((x) => {
      let typedParameterValue: TypedParameterValue = 'string'
      if (typedParameters) {
        for (const typedParameter of typedParameters) {
          if (typedParameter.key.trim().toLowerCase() === x.trim().toLowerCase()) {
            typedParameterValue = typedParameter.value
          }
        }
      }
      switch (typedParameterValue) {
        case 'boolean':
          value[x] = false
          break
        case 'integer':
          value[x] = 0
          break
        case 'number':
          value[x] = 0.1
          break
        case 'string':
        default:
          value[x] = ''
          break
      }
    })
    return generateJSONSchemaObject(value, '', '')
  } else {
    return undefined
  }
}

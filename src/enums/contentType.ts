export enum ContentType {
  iCalendar = 'text/calendar',
  HTML = 'text/html',
  JSON = 'application/json'
}

/**
 * Maps a ContentType enum to a header value.
 * @param {ContentType} contentType - A ContentType enum to map.
 * @returns {string} - A header value.
 */
export const getContentTypeValue = (contentType: ContentType): string => {
  switch (contentType) {
    case ContentType.iCalendar:
    case ContentType.HTML:
    case ContentType.JSON:
      return `${contentType}; charset=utf-8`
    default:
      return ''
  }
}

/**
 * Maps a ContentType enum to a header value.
 * @param {ContentType[]} contentTypes - A list of ContentType enums to map.
 * @returns {string} - A header value.
 */
export const getContentTypeList = (contentTypes: ContentType[]): string => {
  if (contentTypes.length === 1) {
    return getContentTypeValue(contentTypes[0])
  } else {
    return ''
  }
}

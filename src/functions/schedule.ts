import httpErrors from 'http-errors'
import { convertTimeToDate, findTimeZone, setTimeZone } from 'timezone-support'
import Schedule from '../types/schedule'
import { ScheduleDayDefaultOpen, ScheduleDayDefaultClose } from '../types/scheduleDay'

/**
 * Builds a date based on the specified time string.
 * @param {Date} date - The date to get the year, month and day from.
 * @param {string} time - The specified time string.
 * @param {string} timezone - The time zone name.
 * @returns {Date} - A date based on the specified time string.
 */
const buildCalendarDate = (date: Date, time: string, timezone: string): Date => {
  return convertTimeToDate(setTimeZone(new Date(`${date.toLocaleDateString()} ${time}`), findTimeZone(timezone), {
    useUTC: false
  }))
}

/**
 * Builds a date based on the specified schedule.
 * @param {Date} date - The date to get the year, month and day from.
 * @param {Schedule | undefined} schedule - The specified schedule.
 * @param {string} timezone - The time zone name.
 * @throws {HttpError} - Thrown if the day of the week cannot be determined.
 * @returns {Date} - A date based on the specified schedule.
 */
export const buildCalendarDateOpen = (date: Date, schedule: Schedule | undefined, timezone: string): Date => {
  if (schedule) {
    switch (date.getDay()) {
      case 0:
        return buildCalendarDate(date, schedule.sunday.open, timezone)
      case 1:
        return buildCalendarDate(date, schedule.monday.open, timezone)
      case 2:
        return buildCalendarDate(date, schedule.tuesday.open, timezone)
      case 3:
        return buildCalendarDate(date, schedule.wednesday.open, timezone)
      case 4:
        return buildCalendarDate(date, schedule.thursday.open, timezone)
      case 5:
        return buildCalendarDate(date, schedule.friday.open, timezone)
      case 6:
        return buildCalendarDate(date, schedule.saturday.open, timezone)
      default:
        throw new httpErrors.InternalServerError('Invalid day of the week.')
    }
  } else {
    return buildCalendarDate(date, ScheduleDayDefaultOpen, timezone)
  }
}

/**
 * Builds a date based on the specified schedule.
 * @param {Date} date - The date to get the year, month and day from.
 * @param {Schedule | undefined} schedule - The specified schedule.
 * @param {string} timezone - The time zone name.
 * @throws {HttpError} - Thrown if the day of the week cannot be determined.
 * @returns {Date} - A date based on the specified schedule.
 */
export const buildCalendarDateClose = (date: Date, schedule: Schedule | undefined, timezone: string): Date => {
  if (schedule) {
    switch (date.getDay()) {
      case 0:
        return buildCalendarDate(date, schedule.sunday.close, timezone)
      case 1:
        return buildCalendarDate(date, schedule.monday.close, timezone)
      case 2:
        return buildCalendarDate(date, schedule.tuesday.close, timezone)
      case 3:
        return buildCalendarDate(date, schedule.wednesday.close, timezone)
      case 4:
        return buildCalendarDate(date, schedule.thursday.close, timezone)
      case 5:
        return buildCalendarDate(date, schedule.friday.close, timezone)
      case 6:
        return buildCalendarDate(date, schedule.saturday.close, timezone)
      default:
        throw new httpErrors.InternalServerError('Invalid day of the week.')
    }
  } else {
    return buildCalendarDate(date, ScheduleDayDefaultClose, timezone)
  }
}

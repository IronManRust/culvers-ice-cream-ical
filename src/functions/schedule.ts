import httpErrors from 'http-errors'
import Schedule from '../types/schedule'
import { ScheduleDayDefaultOpen, ScheduleDayDefaultClose } from '../types/scheduleDay'

/**
 * Builds a date based on the specified time string.
 * @param {Date} date - The date to get the year, month and day from.
 * @param {string} time - The specified time string.
 * @returns {Date} - A date based on the specified time string.
 */
const buildCalendarDate = (date: Date, time: string): Date => {
  return new Date(`${date.toLocaleDateString()} ${time} Z`)
}

/**
 * Builds a date based on the specified schedule.
 * @param {Date} date - The date to get the year, month and day from.
 * @param {Schedule | undefined} schedule - The specified schedule.
 * @throws {HttpError} - Thrown if the day of the week cannot be determined.
 * @returns {Date} - A date based on the specified schedule.
 */
export const buildCalendarDateOpen = (date: Date, schedule: Schedule | undefined): Date => {
  if (schedule) {
    switch (date.getDay()) {
      case 0:
        return buildCalendarDate(date, schedule.sunday.open)
      case 1:
        return buildCalendarDate(date, schedule.monday.open)
      case 2:
        return buildCalendarDate(date, schedule.tuesday.open)
      case 3:
        return buildCalendarDate(date, schedule.wednesday.open)
      case 4:
        return buildCalendarDate(date, schedule.thursday.open)
      case 5:
        return buildCalendarDate(date, schedule.friday.open)
      case 6:
        return buildCalendarDate(date, schedule.saturday.open)
      default:
        throw new httpErrors.InternalServerError('Invalid day of the week.')
    }
  } else {
    return buildCalendarDate(date, ScheduleDayDefaultOpen)
  }
}

/**
 * Builds a date based on the specified schedule.
 * @param {Date} date - The date to get the year, month and day from.
 * @param {Schedule | undefined} schedule - The specified schedule.
 * @throws {HttpError} - Thrown if the day of the week cannot be determined.
 * @returns {Date} - A date based on the specified schedule.
 */
export const buildCalendarDateClose = (date: Date, schedule: Schedule | undefined): Date => {
  if (schedule) {
    switch (date.getDay()) {
      case 0:
        return buildCalendarDate(date, schedule.sunday.close)
      case 1:
        return buildCalendarDate(date, schedule.monday.close)
      case 2:
        return buildCalendarDate(date, schedule.tuesday.close)
      case 3:
        return buildCalendarDate(date, schedule.wednesday.close)
      case 4:
        return buildCalendarDate(date, schedule.thursday.close)
      case 5:
        return buildCalendarDate(date, schedule.friday.close)
      case 6:
        return buildCalendarDate(date, schedule.saturday.close)
      default:
        throw new httpErrors.InternalServerError('Invalid day of the week.')
    }
  } else {
    return buildCalendarDate(date, ScheduleDayDefaultClose)
  }
}

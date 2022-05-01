import ScheduleDay from './scheduleDay'

export default interface Schedule {
  monday: ScheduleDay,
  tuesday: ScheduleDay,
  wednesday: ScheduleDay,
  thursday: ScheduleDay,
  friday: ScheduleDay,
  saturday: ScheduleDay,
  sunday: ScheduleDay
}

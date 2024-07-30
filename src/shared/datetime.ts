import { Timezone } from "../types/schema";
import { leadingZeroes, ordinal } from "./english";

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekdaysShort = weekdays.map(weekday => weekday.slice(0, 3));

export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthsShort = months.map(month => month.slice(0, 3));

export const ONE_DAY = 1000 * 60 * 60 * 24;

// ---------------------------------------------------------------------
// ---------------- Postgres Time With Timezone formats ----------------
// ---------------------------------------------------------------------
// These are the recommended patterns for showing the time in the timezone provided by the database.
// Customers should see times in the time zone of their delivery address.
// Restaurants should see times in the time zone of their restaurant location.
export function toTimestamptz(yyyyMMdd: string, digitalTime: string, timezone: Timezone): string {
  // 2003-04-12 04:05:06 America/New_York
  return `${yyyyMMdd} ${digitalTime} ${timezone}`;
}
export function toDatestring(timestampAtTimezone: string) {
  // timestampAtTimezone should look like: '2021-07-01 14:00:00'
  return timestampAtTimezone.slice(0, 10);
}
export function toAmericanTime(timestampAtTimezone: string, timezoneAbbreviation: string) {
  // timestampAtTimezone should look like: '2021-07-01 14:00:00'
  let hours = Number(timestampAtTimezone.slice(11, 13));
  const isPM = hours >= 12;
  if (hours > 12) {
    hours -= 12;
  }
  const minutes = timestampAtTimezone.slice(14, 16);
  let tz = '';
  if (timezoneAbbreviation !== localTimezoneAbbreviation()) {
    tz = ` ${timezoneAbbreviation}`;
  }
  return `${hours}:${leadingZeroes(minutes)}${isPM ? 'pm' : 'am'}${tz}`;
}
export function toLonghandDate(timestampAtTimezone: string, omitYear?: boolean) {
  // timestampAtTimezone should look like: '2021-07-01 14:00:00'
  let year = Number(timestampAtTimezone.slice(0, 4));
  let month = Number(timestampAtTimezone.slice(5, 7)) - 1;
  let day = Number(timestampAtTimezone.slice(8, 10));
  let date = new Date(year, month, day);
  let weekday = weekdays[date.getDay()];
  return `${weekday} ${months[month]} ${ordinal(day)}${omitYear ? '' : ', ' + year}`;
}

export function toTime(timestampAtTimezone: string, timezoneAbbreviation: string) {
  // timestampAtTimezone should look like: '2021-07-01 14:00:00'
  let hours = Number(timestampAtTimezone.slice(11, 13));
  const isPM = hours >= 12;
  if (hours > 12) {
    hours -= 12;
  }
  const minutes = timestampAtTimezone.slice(14, 16);

  let tz = '';
  if (timezoneAbbreviation !== localTimezoneAbbreviation()) {
    tz = ` ${timezoneAbbreviation}`;
  }
  return `${hours}:${leadingZeroes(minutes)}${isPM ? 'pm' : 'am'}${tz}`;
}

// ----------------------------------------------------------
// ---------------- Alternative time formats ----------------
// ----------------------------------------------------------
export function toDigitalTime(hours: string | number, minutes: string | number, isPM: boolean, seconds?: string | number): string {
  if (typeof hours === 'string') hours = Number(hours);
  if (typeof minutes === 'string') minutes = Number(minutes);
  if (typeof seconds === 'string') seconds = Number(seconds);

  if (isPM && hours < 12) hours += 12;
  return `${leadingZeroes(hours)}:${leadingZeroes(minutes)}:${seconds || '00'}`;
}
export function hoursAndMinutes(digitalTime: string): [number, number] {
  const hours = digitalTime.slice(0, 2);
  const minutes = digitalTime.slice(3, 5);
  return [Number(hours), Number(minutes)];
}
export function americanTimeExplicit(hour: number, minute: number, second?: number, leadingZero?: boolean): string {
  const isPM = hour >= 12;
  hour = hour % 12 || 12;
  return `${leadingZero ? leadingZeroes(hour) : hour}:${leadingZeroes(minute)}${second ? ':' + leadingZeroes(second) : ''}${isPM ? 'pm' : 'am'}`;
}

// -----------------------------------------------------------
// ---------------- Javascript date functions ----------------
// -----------------------------------------------------------
// These functions use the browser's timezone. Avoid using them for customer-facing times which should match the timezone of the customer, 
// or for the restaurant which should match the restaurant location's timezone.
export function standardDatetimeLocal (date: Date | number): string {
  date = toDate(date);
  // const weekday = date.getDay(); 
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${monthsShort[month - 1]} ${ordinal(day)} ${year} ${americanTimeLocal(date)}`;
}
export function standardDateLocal (date: Date | number): string {
  date = toDate(date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${monthsShort[month - 1]} ${ordinal(day)} ${year}`;
}
export function compactDatetimeLocal (date: Date | number): string {
  date = toDate(date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${weekdaysShort[date.getDay()]} ${month}/${day} ${militaryTimeLocal(date)}`;
}
export function slashesDatetimeLocal (date: Date | number): string {
  date = toDate(date);
  const day = leadingZeroes(date.getDate());
  const month = leadingZeroes(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = leadingZeroes(date.getHours());
  const minutes = leadingZeroes(date.getMinutes());
  const seconds = leadingZeroes(date.getSeconds());
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
export function slashesDateLocal (date: Date | number): string {
  date = toDate(date);
  const day = leadingZeroes(date.getDate());
  const month = leadingZeroes(date.getMonth() + 1);
  const year = date.getFullYear(); 
  return `${year}/${month}/${day}`;
}
export function toYYYYMMDDLocal (date: Date): string {
  date = toDate(date);
  // Returns the date in the format 'YYYY-MM-DD' in the current brower or server's timezone
  return `${date.getFullYear()}-${leadingZeroes(date.getMonth()+1)}-${leadingZeroes(date.getDate())}`
}
export function localYYYYMMDD(): string {
  // Returns the current browser or server local date in the format 'YYYY-MM-DD'
  const date = new Date();
  return `${date.getFullYear()}-${leadingZeroes(date.getMonth()+1)}-${leadingZeroes(date.getDate())}`
}
export function longhandDateLocal(date: Date | number, omitYear?: boolean): string {
  date = toDate(date);
  return `${weekdays[date.getDay()]} ${months[date.getMonth()]} ${ordinal(date.getDate())}${omitYear ? '' : ', ' + date.getFullYear()}`;
}
export function longhandDatetimeLocal(date: Date | number): string {
  date = toDate(date);
  return `${weekdays[date.getDay()]} ${months[date.getMonth()]} ${ordinal(date.getDate())}, ${date.getFullYear()} ${americanTimeLocal(date)}`;
}
export function americanTimeLocal(date: Date | number): string {
  date = toDate(date);
  const hour = date.getHours() % 12 || 12; 
  const minute = leadingZeroes(date.getMinutes());
  return `${hour}:${minute}${date.getHours() < 12 ? 'am' : 'pm'}`;
}
export function militaryTimeLocal(date: Date | number): string {
  date = toDate(date);
  const hour = leadingZeroes(date.getHours());
  const minute = leadingZeroes(date.getMinutes());
  return `${hour}:${minute}`;
}
export function toDate(date: Date | number | string): Date {
  if (typeof date === 'string') {
    return new Date(date);
  } else if (typeof date === 'number') {
    return new Date(date);
  } else if (date instanceof Date) {
    return date;
  } else {
    throw new Error('Invalid date');
  }
}

export function localTimezoneAbbreviation() {
  return new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
}


// Date-fns replacement functions
export function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
export function endOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() + (6 - d.getDay()));
  return d;
}
export function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  return d;
}
export function endOfMonth(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d;
}
export function startOfYear(date: Date) {
  const d = new Date(date);
  d.setMonth(0);
  d.setDate(1);
  return d;
}
export function endOfYear(date: Date) {
  const d = new Date(date);
  d.setMonth(11);
  d.setDate(31);
  return d;
}
export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
export function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}
export function addHours(date: Date, hours: number) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}
export function addMinutes(date: Date, minutes: number) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}
export function addSeconds(date: Date, seconds: number) {
  const d = new Date(date);
  d.setSeconds(d.getSeconds() + seconds);
  return d;
}
export function addMilliseconds(date: Date, milliseconds: number) {
  const d = new Date(date);
  d.setMilliseconds(d.getMilliseconds() + milliseconds);
  return d;
}
export function subtractDays(date: Date, days: number) {
  return addDays(date, -days);
}
export function subtractMonths(date: Date, months: number) {
  return addMonths(date, -months);
}
export function subtractYears(date: Date, years: number) {
  return addYears(date, -years);
}
export function subtractHours(date: Date, hours: number) {
  return addHours(date, -hours);
}
export function subtractMinutes(date: Date, minutes: number) {
  return addMinutes(date, -minutes);
}
export function subtractSeconds(date: Date, seconds: number) {
  return addSeconds(date, -seconds);
}
export function subtractMilliseconds(date: Date, milliseconds: number) {
  return addMilliseconds(date, -milliseconds);
}
export function isSameDay(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}
export function isSameMonth(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}
export function isSameYear(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear();
}
export function isToday(date: Date) {
  return isSameDay(date, new Date());
}
export function isFuture(date: Date) {
  return date > new Date();
}
export function isPast(date: Date) {
  return date < new Date();
}
export function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6;
}
export function isLeapYear(date: Date) {
  const year = date.getFullYear();
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
export function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
export function daysInYear(date: Date) {
  return isLeapYear(date) ? 366 : 365;
}
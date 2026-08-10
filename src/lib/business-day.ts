// Myanmar (UTC+6:30) business-day helpers, ported from qq-app/src/lib/business-day.ts.
// Every "what day is it" computation for attendance should go through here so
// the day boundary doesn't depend on the server's TZ setting (plain UTC
// midnight flips at 6:30am Myanmar time, misattributing early clock-ins).

const MM_OFFSET_MS = (6 * 60 + 30) * 60 * 1000;

/** UTC-midnight Date of the Myanmar calendar day containing the given instant. */
export function mmDayOf(instant: Date): Date {
  const shifted = new Date(instant.getTime() + MM_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

/** Today as a UTC-midnight Date (storage convention for DATE-like columns). */
export function mmTodayUTC(): Date {
  return mmDayOf(new Date());
}

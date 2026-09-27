// Single source of truth for service-day rules (weekly / nth-weekday / as-needed).
// All dates are plain "YYYY-MM-DD" calendar days (no timezone math): weekday is
// derived from the date parts, and horizon checks compare ISO strings.

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

/** Monday=1..Sunday=0 weekday for a YYYY-MM-DD string, computed from parts (TZ-safe). */
export function weekdayOf(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** The calendar date (day-of-month) of the nth <weekday> in the YYYY-MM month. */
export function nthWeekdayDate(year, month, weekday, nth) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
}

export function scheduleText(schedule) {
  if (schedule.mode === 'weekly') {
    const days = [...schedule.weekdays].sort().map((d) => `Every ${DAY_NAMES[d]}`);
    return days.join(' & ');
  }
  if (schedule.mode === 'nth-weekday') {
    return `Every ${ordinal(schedule.nthWeek)} ${DAY_NAMES[schedule.weekday]} of the month`;
  }
  return 'As needed — staff will confirm the date';
}

/** Is this calendar day bookable for the service? Sundays are never bookable (center closed). */
export function isValidServiceDay(service, ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const weekday = weekdayOf(ymd);
  if (weekday === 0) return false;
  const s = service.schedule;
  if (s.mode === 'weekly') return s.weekdays.includes(weekday);
  if (s.mode === 'nth-weekday') {
    if (weekday !== s.weekday) return false;
    const [y, m, d] = ymd.split('-').map(Number);
    return d === nthWeekdayDate(y, m, s.weekday, s.nthWeek);
  }
  return true; // as-needed: any open day, staff confirm the date
}

function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

export function addDaysYMD(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return toYMD(dt);
}

/** Today's date (UTC) as YYYY-MM-DD. */
export function todayYMD() {
  return toYMD(new Date());
}

/** All bookable days for the service from `fromYMD` (inclusive) for `days` ahead (inclusive). */
export function upcomingValidDates(service, fromYMD, days = 30) {
  const out = [];
  for (let i = 0; i <= days; i += 1) {
    const ymd = addDaysYMD(fromYMD, i);
    if (isValidServiceDay(service, ymd)) out.push(ymd);
  }
  return out;
}

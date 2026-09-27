export interface ServiceDay {
  name: string;
  detail: string;
}

/** 2nd Wednesday of the month for the given date (local time). */
export function secondWednesdayOfMonth(date: Date): number {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  // Days from the 1st to the first Wednesday (0=Sun..6=Sat, Wed=3).
  const offset = (3 - first.getDay() + 7) % 7;
  return 1 + offset + 7;
}

/** Which service day "today" is, per the v1 weekly/monthly schedule. Pure — safe to unit test. */
export function getTodayService(now: Date = new Date()): ServiceDay {
  const day = now.getDay(); // 0=Sun
  if (day === 1) return { name: 'Consultation', detail: 'Every Monday' };
  if (day === 2) return { name: 'Prenatal', detail: 'Every Tuesday' };
  if (day === 4) return { name: 'Family Planning', detail: 'Every Thursday' };
  if (day === 3 && now.getDate() === secondWednesdayOfMonth(now)) {
    return { name: 'Routine Immunization (Newborn)', detail: 'Every 2nd Wednesday of the month' };
  }
  return { name: 'As-needed services', detail: 'Postpartum · Follow-up · Hypertensive · Breastfeeding — staff confirm the date' };
}

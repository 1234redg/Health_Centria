import { createFileRoute, Link } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, LoaderCircle } from 'lucide-react';
import { DashboardShell } from '../../../components/dashboard-shell';
import { patientNav } from '../../../components/patient-nav';
import { getSession } from '../../../lib/auth';
import { ApiError, bookAppointment, listServices, validDates, type Service } from '../../../lib/api';
import { getTodayService } from '../../../lib/schedule';
import { cn } from '../../../lib/utils';

export const Route = createFileRoute('/app/appointments/new')({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search.service === 'string' ? search.service : undefined,
  }),
  component: BookAppointment,
});

const STEPS = ['Service', 'Date & details', 'Review'] as const;

function toYMD(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayYMD(): string {
  const n = new Date();
  return toYMD(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

function maxYMD(): string {
  const n = new Date();
  n.setDate(n.getDate() + 30);
  return toYMD(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

function formatLong(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function BookAppointment() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const today = getTodayService();
  const preselect = Route.useSearch().service;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [services, setServices] = useState<Service[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | undefined>(preselect);
  const [dates, setDates] = useState<Set<string> | null>(null);
  const [datesError, setDatesError] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1 };
  });
  const [day, setDay] = useState<string | undefined>(undefined);
  const [timePreference, setTimePreference] = useState('any');
  const [notes, setNotes] = useState('');
  const [stepError, setStepError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ serviceName: string; day: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    listServices()
      .then((r) => {
        if (cancelled) return;
        setServices(r.services);
        if (preselect && !r.services.some((s) => s.id === preselect)) setServiceId(undefined);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load services. Check your connection and try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [preselect]);

  const service = useMemo(() => services?.find((s) => s.id === serviceId), [services, serviceId]);

  useEffect(() => {
    setDates(null);
    setDatesError(false);
    setDay(undefined);
    if (!serviceId) return;
    let cancelled = false;
    validDates(serviceId)
      .then((r) => {
        if (!cancelled) setDates(new Set(r.dates));
      })
      .catch(() => {
        if (!cancelled) setDatesError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const maxDay = maxYMD();
  const minMonth = useMemo(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1 };
  }, []);
  const maxMonth = useMemo(() => {
    const [y, m] = maxDay.split('-').map(Number);
    return { y, m };
  }, [maxDay]);

  const cells = useMemo(() => {
    const { y, m } = monthCursor;
    const first = new Date(y, m - 1, 1);
    const lead = (first.getDay() + 6) % 7; // Mon-first offset
    const count = new Date(y, m, 0).getDate();
    const out: Array<{ ymd: string; label: number } | null> = [];
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let d = 1; d <= count; d += 1) out.push({ ymd: toYMD(y, m, d), label: d });
    return out;
  }, [monthCursor]);

  const canPrev = monthCursor.y > minMonth.y || (monthCursor.y === minMonth.y && monthCursor.m > minMonth.m);
  const canNext = monthCursor.y < maxMonth.y || (monthCursor.y === maxMonth.y && monthCursor.m < maxMonth.m);

  function moveMonth(delta: -1 | 1) {
    setMonthCursor((c) => {
      let { y, m } = c;
      m += delta;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
      if (m > 12) {
        m = 1;
        y += 1;
      }
      return { y, m };
    });
  }

  function next() {
    setStepError(null);
    if (step === 0 && !service) {
      setStepError('Choose a service to continue.');
      return;
    }
    if (step === 1 && !day) {
      setStepError('Pick a highlighted date to continue.');
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStepError(null);
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!service || !day) return;
    setPending(true);
    setStepError(null);
    try {
      await bookAppointment({ serviceId: service.id, day, timePreference, notes: notes.trim() });
      setDone({ serviceName: service.name, day });
    } catch (err) {
      setStepError(err instanceof ApiError ? err.message : 'Booking failed. Try again.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <DashboardShell
        title="Book Appointment"
        roleLabel="Patient"
        userName={session?.name}
        userEmail={session?.email ?? ''}
        todayService={`${today.name} — ${today.detail}`}
        nav={patientNav}
      notificationsTo="/app/notifications"
      >
        <section
          aria-labelledby="booked-heading"
          className="rounded-2xl border border-slate-200/70 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
        >
          <h2 id="booked-heading" className="text-xl font-bold text-slate-900">
            Request sent — pending confirmation
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {done.serviceName} on {formatLong(done.day)}. The center will confirm or decline it, and you'll be
            notified by bell and email.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/app/appointments"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 font-medium text-white active:scale-[0.97]"
            >
              View my appointments
            </Link>
            <Link
              to="/app/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 font-medium text-slate-700 active:scale-[0.97]"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Book Appointment"
      roleLabel="Patient"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={patientNav}
      notificationsTo="/app/notifications"
    >
      <ol aria-label="Booking progress" className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={i === step ? 'step' : undefined}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                i < step && 'bg-teal-600 text-white',
                i === step && 'bg-gradient-to-r from-teal-600 to-blue-600 text-white',
                i > step && 'bg-slate-100 text-slate-500',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('hidden text-sm sm:block', i === step ? 'font-medium text-slate-900' : 'text-slate-500')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span aria-hidden className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      {loadError && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)] sm:p-6"
        >
          {step === 0 && (
            <div role="radiogroup" aria-label="Choose a service" className="grid gap-3">
              {services === null && !loadError && <p className="text-sm text-slate-500">Loading services…</p>}
              {services?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={serviceId === s.id}
                  onClick={() => {
                    setServiceId(s.id);
                    setStepError(null);
                  }}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all active:scale-[0.99]',
                    serviceId === s.id
                      ? 'border-teal-600 bg-teal-50/60 shadow-[0_8px_30px_rgba(15,60,90,0.10)]'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="mt-0.5 block text-sm font-medium text-teal-700">{s.scheduleText}</span>
                  {s.description && <span className="mt-1 block text-sm text-slate-600">{s.description}</span>}
                </button>
              ))}
            </div>
          )}

          {step === 1 && service && (
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{service.name}</span> — {service.scheduleText}.
                Only highlighted dates can be booked.
              </p>
              {datesError ? (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  Couldn't load bookable dates. Check your connection and try again.
                </p>
              ) : dates === null ? (
                <p className="mt-3 text-sm text-slate-500">Loading calendar…</p>
              ) : (
                <>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => moveMonth(-1)}
                      disabled={!canPrev}
                      aria-label="Previous month"
                      className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h3 className="font-bold text-slate-900" aria-live="polite">
                      {new Date(monthCursor.y, monthCursor.m - 1, 1).toLocaleDateString('en-PH', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                    <button
                      type="button"
                      onClick={() => moveMonth(1)}
                      disabled={!canNext}
                      aria-label="Next month"
                      className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <div role="grid" aria-label="Pick a date" className="mt-2 grid grid-cols-7 gap-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <span key={i} className="py-1 text-center text-xs font-semibold text-slate-400">
                        {d}
                      </span>
                    ))}
                    {cells.map((cell, i) => {
                      if (!cell) return <span key={`e${i}`} />;
                      const enabled = dates.has(cell.ymd) && cell.ymd >= todayYMD() && cell.ymd <= maxDay;
                      const selected = day === cell.ymd;
                      return (
                        <button
                          key={cell.ymd}
                          type="button"
                          role="gridcell"
                          disabled={!enabled}
                          aria-pressed={selected}
                          aria-label={formatLong(cell.ymd)}
                          onClick={() => {
                            setDay(cell.ymd);
                            setStepError(null);
                          }}
                          className={cn(
                            'flex aspect-square items-center justify-center rounded-xl text-sm transition-all',
                            selected
                              ? 'bg-gradient-to-r from-teal-600 to-blue-600 font-bold text-white'
                              : enabled
                                ? 'font-medium text-slate-800 hover:bg-teal-50 active:scale-95'
                                : 'cursor-not-allowed text-slate-300',
                          )}
                        >
                          {cell.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="book-time" className="mb-1.5 block text-sm font-medium text-slate-800">
                        Time preference
                      </label>
                      <select
                        id="book-time"
                        value={timePreference}
                        onChange={(e) => setTimePreference(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
                      >
                        <option value="any">No preference</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="book-notes" className="mb-1.5 block text-sm font-medium text-slate-800">
                        Notes <span className="font-normal text-slate-500">(optional — symptoms or reason)</span>
                      </label>
                      <textarea
                        id="book-notes"
                        rows={3}
                        maxLength={500}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Briefly describe your concern…"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && service && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Service</dt>
                <dd className="text-right font-semibold text-slate-900">{service.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Date</dt>
                <dd className="text-right font-semibold text-slate-900">{day ? formatLong(day) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Time</dt>
                <dd className="text-right font-semibold text-slate-900">
                  {timePreference === 'any' ? 'No preference' : timePreference === 'morning' ? 'Morning' : 'Afternoon'}
                </dd>
              </div>
              {notes.trim() && (
                <div>
                  <dt className="text-slate-500">Notes</dt>
                  <dd className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-800">{notes.trim()}</dd>
                </div>
              )}
              <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-slate-700">
                This sends a <strong>pending</strong> request. The center confirms or declines it — you'll be notified.
              </p>
            </dl>
          )}
        </motion.div>
      </AnimatePresence>

      {stepError && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {stepError}
        </p>
      )}

      <div className="sticky bottom-4 flex gap-3 rounded-2xl border border-slate-200/70 bg-white/85 p-2 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 font-medium text-slate-700 active:scale-[0.97]"
          >
            <ArrowLeft size={18} aria-hidden /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-base font-medium text-white active:scale-[0.97]"
          >
            Continue <ArrowRight size={18} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-base font-medium text-white active:scale-[0.97] disabled:opacity-60"
          >
            {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden />}
            {pending ? 'Sending…' : 'Submit request'}
          </button>
        )}
      </div>

      <p className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarDays size={16} aria-hidden />
        <Link to="/app/services" className="underline-offset-4 hover:underline">
          Browse all services
        </Link>
      </p>
    </DashboardShell>
  );
}

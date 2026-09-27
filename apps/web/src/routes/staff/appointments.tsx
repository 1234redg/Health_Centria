import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  LoaderCircle,
  Megaphone,
} from 'lucide-react';
import { DashboardShell } from '../../components/dashboard-shell';
import { getSession } from '../../lib/auth';
import {
  ApiError,
  completeAppointment,
  confirmAppointment,
  declineAppointment,
  listServices,
  queueAppointments,
  type Service,
  type StaffAppointment,
} from '../../lib/api';
import { getTodayService } from '../../lib/schedule';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/staff/appointments')({
  component: StaffQueue,
});

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
type DatePreset = 'today' | 'week' | 'all';

const STATUS_STYLE: Record<StaffAppointment['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function patientName(a: StaffAppointment): string {
  return typeof a.patient === 'object' ? a.patient.name : 'Patient';
}

function patientEmail(a: StaffAppointment): string {
  return typeof a.patient === 'object' ? a.patient.email : '';
}

function serviceName(a: StaffAppointment): string {
  return typeof a.service === 'object' ? a.service.name : 'Service';
}

function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function QueueCard({
  appt,
  onChange,
}: {
  appt: StaffAppointment;
  onChange: (a: StaffAppointment) => void;
}) {
  const [declining, setDeclining] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [busy, setBusy] = useState<'confirm' | 'decline' | 'complete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: 'confirm' | 'decline' | 'complete') {
    if (action === 'decline' && !reason.trim()) {
      setReasonError('A reason is required so the patient understands why.');
      return;
    }
    setBusy(action);
    setError(null);
    try {
      const r =
        action === 'confirm'
          ? await confirmAppointment(appt.id)
          : action === 'decline'
            ? await declineAppointment(appt.id, reason.trim())
            : await completeAppointment(appt.id, {
                diagnosis: diagnosis.trim(),
                prescription: prescription.trim(),
                visitNotes: visitNotes.trim(),
              });
      onChange(r.appointment);
      setDeclining(false);
      setCompleting(false);
      setReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed. Try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">
            {patientName(appt)} <span className="font-normal text-slate-500">· {serviceName(appt)}</span>
          </h3>
          <p className="mt-0.5 text-sm text-slate-600">
            {formatDay(appt.day)}
            {appt.timePreference !== 'any' ? ` · ${appt.timePreference === 'morning' ? 'Morning' : 'Afternoon'}` : ''}
            {patientEmail(appt) && <span className="block text-xs text-slate-400">{patientEmail(appt)}</span>}
          </p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize', STATUS_STYLE[appt.status])}>
          {appt.status}
        </span>
      </div>
      {appt.notes && <p className="mt-2 text-sm text-slate-600">Patient notes: {appt.notes}</p>}
      {appt.status === 'declined' && appt.declineReason && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">Decline reason: {appt.declineReason}</p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {appt.status === 'pending' && !declining && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => run('confirm')}
            disabled={busy !== null}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white active:scale-[0.97] disabled:opacity-60"
          >
            {busy === 'confirm' && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setDeclining(true)}
            disabled={busy !== null}
            className="h-10 flex-1 rounded-xl border border-red-200 text-sm font-semibold text-destructive active:scale-[0.97]"
          >
            Decline
          </button>
        </div>
      )}

      {appt.status === 'pending' && declining && (
        <div className="mt-3 rounded-xl border border-slate-200 p-3">
          <label htmlFor={`reason-${appt.id}`} className="mb-1.5 block text-sm font-medium text-slate-800">
            Decline reason * <span className="font-normal text-slate-500">(shown to the patient)</span>
          </label>
          <textarea
            id={`reason-${appt.id}`}
            rows={2}
            maxLength={500}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(null);
            }}
            placeholder="e.g. Clinic closed for holiday — please rebook next week"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
          />
          {reasonError && (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {reasonError}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => run('decline')}
              disabled={busy !== null}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 text-sm font-semibold text-destructive active:scale-[0.97] disabled:opacity-60"
            >
              {busy === 'decline' && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
              Send decline
            </button>
            <button
              type="button"
              onClick={() => {
                setDeclining(false);
                setReason('');
                setReasonError(null);
              }}
              disabled={busy !== null}
              className="h-10 flex-1 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 active:scale-[0.97]"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {appt.status === 'confirmed' && !completing && (
        <button
          type="button"
          onClick={() => setCompleting(true)}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 active:scale-[0.97] sm:w-auto sm:px-5"
        >
          Complete visit
        </button>
      )}

      {appt.status === 'confirmed' && completing && (
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-800">
            Visit record <span className="font-normal text-slate-500">(saved on completion, visible to the patient)</span>
          </p>
          <div>
            <label htmlFor={`diag-${appt.id}`} className="mb-1.5 block text-sm font-medium text-slate-800">
              Diagnosis
            </label>
            <textarea
              id={`diag-${appt.id}`}
              rows={2}
              maxLength={1000}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute viral nasopharyngitis"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
            />
          </div>
          <div>
            <label htmlFor={`rx-${appt.id}`} className="mb-1.5 block text-sm font-medium text-slate-800">
              Prescription
            </label>
            <textarea
              id={`rx-${appt.id}`}
              rows={2}
              maxLength={1000}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="e.g. Paracetamol 500mg every 6 hours for 3 days"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
            />
          </div>
          <div>
            <label htmlFor={`vn-${appt.id}`} className="mb-1.5 block text-sm font-medium text-slate-800">
              Visit notes
            </label>
            <textarea
              id={`vn-${appt.id}`}
              rows={2}
              maxLength={2000}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="Advice, follow-up instructions…"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/25"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => run('complete')}
              disabled={busy !== null}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white active:scale-[0.97] disabled:opacity-60"
            >
              {busy === 'complete' && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
              Save & complete
            </button>
            <button
              type="button"
              onClick={() => setCompleting(false)}
              disabled={busy !== null}
              className="h-10 flex-1 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 active:scale-[0.97]"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {appt.status === 'completed' && (appt.diagnosis || appt.prescription || appt.visitNotes) && (
        <dl className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
          {appt.diagnosis && (
            <div>
              <dt className="font-semibold text-slate-700">Diagnosis</dt>
              <dd className="text-slate-800">{appt.diagnosis}</dd>
            </div>
          )}
          {appt.prescription && (
            <div>
              <dt className="font-semibold text-slate-700">Prescription</dt>
              <dd className="text-slate-800">{appt.prescription}</dd>
            </div>
          )}
          {appt.visitNotes && (
            <div>
              <dt className="font-semibold text-slate-700">Visit notes</dt>
              <dd className="text-slate-800">{appt.visitNotes}</dd>
            </div>
          )}
        </dl>
      )}
    </article>
  );
}

function StaffQueue() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const today = getTodayService();
  const [list, setList] = useState<StaffAppointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [preset, setPreset] = useState<DatePreset>('all');
  const [serviceId, setServiceId] = useState('');
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    listServices().then((r) => setServices(r.services)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    const now = new Date();
    const filters: { status?: string; serviceId?: string; from?: string; to?: string } = {};
    if (status !== 'all') filters.status = status;
    if (serviceId) filters.serviceId = serviceId;
    if (preset === 'today') filters.from = filters.to = toYMD(now);
    if (preset === 'week') {
      filters.from = toYMD(now);
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      filters.to = toYMD(end);
    }
    queueAppointments(filters)
      .then((r) => {
        if (!cancelled) setList(r.appointments);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setList([]);
          setError(err instanceof Error ? err.message : 'Could not load the queue.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status, preset, serviceId]);

  const pending = useMemo(() => (list ?? []).filter((a) => a.status === 'pending'), [list]);

  return (
    <DashboardShell
      title="Appointments"
      roleLabel={session?.role === 'admin' ? 'Admin' : 'Staff'}
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={[
        { label: 'Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', to: '/staff/appointments', icon: CalendarCheck },
        { label: 'Announcements', to: '/staff/announcements', icon: Megaphone },
        { label: 'Notifications', to: '/staff/notifications', icon: Bell },
      ]}
      notificationsTo="/staff/notifications"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      >
        {pending.length > 0 ? (
          <p role="status" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {pending.length} request{pending.length === 1 ? '' : 's'} waiting for review
          </p>
        ) : (
          list !== null && (
            <p role="status" className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              Queue clear — nothing pending.
            </p>
          )
        )}
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 sm:flex-row sm:items-center">
        <div role="group" aria-label="Date" className="flex rounded-xl bg-slate-100 p-1">
          {(['today', 'week', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              aria-pressed={preset === p}
              className={cn(
                'h-9 rounded-lg px-4 text-sm font-medium capitalize transition-colors active:scale-[0.97]',
                preset === p ? 'bg-white text-slate-900 shadow' : 'text-slate-500',
              )}
            >
              {p === 'today' ? 'Today' : p === 'week' ? '7 days' : 'All'}
            </button>
          ))}
        </div>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          aria-label="Filter by service"
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-teal-600"
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-teal-600"
        >
          {(['all', 'pending', 'confirmed', 'declined', 'completed', 'cancelled'] as const).map((s) => (
            <option key={s} value={s} className="capitalize">
              {s === 'all' ? 'All statuses' : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {list === null && !error && <p className="text-sm text-slate-500">Loading queue…</p>}
      {list !== null && list.length === 0 && !error && (
        <p className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
          No appointments match these filters.
        </p>
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        <div className="grid gap-4 md:grid-cols-2">
          {(list ?? []).map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            >
              <QueueCard
                appt={a}
                onChange={(updated) => setList((l) => (l ?? []).map((x) => (x.id === updated.id ? updated : x)))}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <p className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarDays size={16} aria-hidden /> Walk-in registration and patient records land in the next steps.
      </p>
    </DashboardShell>
  );
}

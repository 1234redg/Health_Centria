import { createFileRoute } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { patientNav } from '../../components/patient-nav';
import { getSession } from '../../lib/auth';
import { myAppointments, type Appointment } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/app/records')({
  component: MyRecords,
});

function serviceName(a: Appointment): string {
  return typeof a.service === 'object' ? a.service.name : 'Service';
}

function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function MyRecords() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const today = getTodayService();
  const [list, setList] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    myAppointments()
      .then((r) => {
        if (!cancelled) setList(r.appointments);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load records.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visits = useMemo(() => {
    if (!list) return null;
    return list
      .filter((a) => a.status === 'completed')
      .sort((a, b) => (a.day < b.day ? 1 : -1));
  }, [list]);

  return (
    <DashboardShell
      title="My Records"
      roleLabel="Patient"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${today.name} — ${today.detail}`}
      nav={patientNav}
      notificationsTo="/app/notifications"
    >
      <motion.p
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        className="rounded-2xl bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900"
      >
        Read-only — these are written by center staff. For corrections, ask the front desk.
      </motion.p>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {visits === null && !error && <p className="text-sm text-slate-500">Loading records…</p>}
      {visits !== null && visits.length === 0 && (
        <p className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm leading-6 text-slate-600">
          No visit records yet. Completed visits with their diagnosis and prescription will appear here.
        </p>
      )}
      {visits !== null && (
        <div className="grid gap-4 md:grid-cols-2">
          {visits.map((v) => (
            <article
              key={v.id}
              className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
            >
              <h3 className="font-bold text-slate-900">{serviceName(v)}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{formatDay(v.day)}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-slate-700">Diagnosis</dt>
                  <dd className="text-slate-800">{v.diagnosis || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Prescription</dt>
                  <dd className="text-slate-800">{v.prescription || '—'}</dd>
                </div>
                {v.visitNotes && (
                  <div>
                    <dt className="font-semibold text-slate-700">Visit notes</dt>
                    <dd className="text-slate-800">{v.visitNotes}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

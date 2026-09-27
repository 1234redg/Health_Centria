import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { patientNav } from '../../components/patient-nav';
import { getSession } from '../../lib/auth';
import { myAppointments, type Appointment } from '../../lib/api';
import { getTodayService } from '../../lib/schedule';

export const Route = createFileRoute('/app/dashboard')({
  component: PatientDashboard,
});

function todayYMD(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function serviceName(a: Appointment): string {
  return typeof a.service === 'object' ? a.service.name : 'Service';
}

function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
}

function PatientDashboard() {
  const reduceMotion = useReducedMotion();
  const session = getSession();
  const service = getTodayService();
  const name = session?.name?.trim() || 'there';
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    myAppointments()
      .then((r) => {
        if (!cancelled) setAppointments(r.appointments);
      })
      .catch(() => {
        if (!cancelled) setAppointments([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const t = todayYMD();
  const upcoming = (appointments ?? [])
    .filter((a) => a.day >= t && (a.status === 'pending' || a.status === 'confirmed'))
    .sort((a, b) => (a.day < b.day ? -1 : 1));
  const next = upcoming[0];
  const pendingCount = (appointments ?? []).filter((a) => a.status === 'pending').length;

  return (
    <DashboardShell
      title="Dashboard"
      roleLabel="Patient"
      userName={session?.name}
      userEmail={session?.email ?? ''}
      todayService={`${service.name} — ${service.detail}`}
      nav={patientNav}
      notificationsTo="/app/notifications"
    >
      <motion.section
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        aria-labelledby="patient-greeting"
        className="rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white shadow-[0_8px_30px_rgba(15,60,90,0.12)]"
      >
        <h2 id="patient-greeting" className="text-xl font-bold tracking-tight">
          Hello, {name}
        </h2>
        <p className="mt-1 text-sm leading-6 text-white/90">
          Today at the center: {service.name} ({service.detail}).
        </p>
      </motion.section>

      <section
        aria-labelledby="patient-next"
        className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
      >
        <h2 id="patient-next" className="text-base font-bold text-slate-900">
          Next appointment
        </h2>
        {appointments === null ? (
          <p className="mt-2 text-sm text-slate-500">Loading…</p>
        ) : next ? (
          <div className="mt-2">
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">{serviceName(next)}</strong> — {formatDay(next.day)} ·{' '}
              <span className="font-semibold capitalize text-teal-700">{next.status}</span>
            </p>
            <Link
              to="/app/appointments"
              className="mt-3 inline-flex h-11 items-center rounded-xl border border-slate-300 px-5 font-medium text-slate-700 active:scale-[0.97]"
            >
              View my appointments
            </Link>
          </div>
        ) : (
          <div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No upcoming visits yet. When you book, your confirmed appointment and reminders will appear here.
            </p>
            <Link
              to="/app/appointments/new"
              search={{ service: undefined }}
              className="mt-4 inline-flex h-12 items-center rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 text-base font-medium text-white active:scale-[0.97]"
            >
              Book appointment
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section
          aria-labelledby="patient-pending"
          className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
        >
          <h2 id="patient-pending" className="text-base font-bold text-slate-900">
            Pending requests
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {appointments === null
              ? 'Loading…'
              : pendingCount === 0
                ? 'Nothing waiting for confirmation.'
                : `${pendingCount} request${pendingCount === 1 ? '' : 's'} waiting for confirmation.`}
          </p>
        </section>
        <section
          aria-labelledby="patient-news"
          className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,60,90,0.06)]"
        >
          <h2 id="patient-news" className="text-base font-bold text-slate-900">
            Announcements
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No announcements yet. New posts from the center will show up here.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
